const express = require("express");
const axios = require("axios");
const path = require("path");

// Cargar variables de entorno (en desarrollo usa .env, en producción usa las de Render)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const PORT = process.env.PORT || 3001;
const IA_API_KEY = process.env.IA_API_KEY;
const IA_ASSISTANT_ID = process.env.IA_ASSISTANT_ID;

// Verificar variables críticas al iniciar
if (!IA_API_KEY || !IA_ASSISTANT_ID) {
  console.error("❌ Faltan variables de entorno críticas:");
  if (!IA_API_KEY) console.error("- IA_API_KEY no está definida");
  if (!IA_ASSISTANT_ID) console.error("- IA_ASSISTANT_ID no está definido");
  console.error("Por favor, configura estas variables en Render o en tu archivo .env");
  process.exit(1);
}

// Configuración para la API de IA
const headers = {
  "Authorization": `Bearer ${IA_API_KEY}`,
  "OpenAI-Beta": "assistants=v2", // ¡Este header es crucial!
  "Content-Type": "application/json"
};

// Función con reintentos para manejar errores temporales
async function fetchWithRetry(url, options, retries = 3) {
  try {
    return await axios(url, options);
  } catch (err) {
    if (retries > 0) {
      console.log(`Reintentando... (${retries} intentos restantes)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

// Función para esperar a que no haya runs activos
async function esperarSinRunActivo(threadId) {
  let activo = true;
  while (activo) {
    try {
      const check = await fetchWithRetry(
        `https://api.openai.com/v1/threads/${threadId}/runs`,
        { headers }
      );
      activo = check.data.data.some(
        (r) => r.status === "in_progress" || r.status === "queued"
      );
      if (activo) await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      console.error("Error checking runs:", error.message);
      break;
    }
  }
}

// Endpoint principal del chat
app.post("/chat", async (req, res) => {
  const { message, thread_id } = req.body;
  let threadId = thread_id;
  let output = "Sin respuesta.";

  try {
    console.log("📨 Mensaje recibido:", message);
    console.log("🧵 Thread ID:", threadId);
    
    // Crear thread si no existe
    if (!threadId) {
      console.log("🆕 Creando nuevo thread");
      try {
        const threadRes = await fetchWithRetry("https://api.openai.com/v1/threads", {}, { headers });
        threadId = threadRes.data.id;
        console.log("✅ Thread creado:", threadId);
      } catch (threadError) {
        console.error("❌ Error creando thread:", threadError.response?.data);
        throw new Error("No se pudo crear el thread: " + threadError.message);
      }
    }

    await esperarSinRunActivo(threadId);

    // Enviar mensaje del usuario
    console.log("💬 Enviando mensaje a OpenAI");
    try {
      await fetchWithRetry(
        `https://api.openai.com/v1/threads/${threadId}/messages`,
        { role: "user", content: message },
        { headers }
      );
      console.log("✅ Mensaje enviado");
    } catch (messageError) {
      console.error("❌ Error enviando mensaje:", messageError.response?.data);
      throw new Error("No se pudo enviar el mensaje: " + messageError.message);
    }

    // Iniciar run con el asistente Pozo
    console.log("🚀 Iniciando run con asistente:", IA_ASSISTANT_ID);
    let runRes;
    try {
      runRes = await fetchWithRetry(
        `https://api.openai.com/v1/threads/${threadId}/runs`,
        { assistant_id: IA_ASSISTANT_ID },
        { headers }
      );
      console.log("✅ Run iniciado, ID:", runRes.data.id);
    } catch (runError) {
      console.error("❌ Error iniciando run:", runError.response?.data);
      throw new Error("No se pudo iniciar el run: " + runError.message);
    }

    let runId = runRes.data.id;
    let status = "queued";
    console.log("⏳ Esperando respuesta...");

    while (status !== "completed") {
      try {
        const poll = await fetchWithRetry(
          `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
          { headers }
        );
        status = poll.data.status;
        console.log("🔄 Status del run:", status);
        
        if (status === "failed" || status === "cancelled" || status === "expired") {
          console.error("❌ Run falló con status:", status);
          throw new Error(`Run falló con status: ${status}`);
        }
        
        if (status !== "completed") await new Promise((r) => setTimeout(r, 1000));
      } catch (pollError) {
        console.error("❌ Error consultando status del run:", pollError.response?.data);
        throw new Error("Error consultando status del run: " + pollError.message);
      }
    }

    // Obtener respuesta
    console.log("📥 Obteniendo respuesta");
    try {
      const msgRes = await fetchWithRetry(
        `https://api.openai.com/v1/threads/${threadId}/messages`,
        { headers }
      );

      const lastMessage = msgRes.data.data.find((m) => m.role === "assistant");
      const finalText = lastMessage?.content?.[0]?.text?.value || output;
      console.log("✅ Respuesta obtenida:", finalText.substring(0, 100) + "...");

      res.json({ response: finalText, thread_id: threadId });
    } catch (msgError) {
      console.error("❌ Error obteniendo respuesta:", msgError.response?.data);
      throw new Error("Error obteniendo respuesta: " + msgError.message);
    }
  } catch (err) {
    console.error("❌ Error en /chat:", err.message);
    console.error("Stack trace:", err.stack);
    
    // Enviar respuesta detallada del error
    res.status(500).json({ 
      error: "Error procesando tu solicitud",
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de health check para Render
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
    memory: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// RUTAS AÑADIDAS PARA SOLUCIONAR ERRORES 404

// Ruta para la página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/chat-widget.html"));
});

// Ruta para favicon.ico
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Pozo corriendo en http://localhost:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔑 API Key: ${IA_API_KEY ? "Configurada" : "No configurada"}`);
  console.log(`🤖 Assistant ID: ${IA_ASSISTANT_ID ? "Configurado" : "No configurado"}`);
});