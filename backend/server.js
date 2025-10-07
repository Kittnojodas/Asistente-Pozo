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
  "Content-Type": "application/json"
};

// Función para esperar a que no haya runs activos
async function esperarSinRunActivo(threadId) {
  let activo = true;
  while (activo) {
    try {
      const check = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/runs`,
        { headers }
      );
      activo = check.data.data.some(
        (r) => r.status === "in_progress" || r.status === "queued"
      );
      if (activo) await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      console.error("Error checking runs:", error);
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
    // Crear thread si no existe
    if (!threadId) {
      const threadRes = await axios.post("https://api.openai.com/v1/threads", {}, { headers });
      threadId = threadRes.data.id;
    }

    await esperarSinRunActivo(threadId);

    // Enviar mensaje del usuario
    await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { role: "user", content: message },
      { headers }
    );

    // Iniciar run con el asistente Pozo
    const runRes = await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      { assistant_id: IA_ASSISTANT_ID },
      { headers }
    );

    let runId = runRes.data.id;
    let status = "queued";

    while (status !== "completed") {
      const poll = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
        { headers }
      );
      status = poll.data.status;
      
      if (status === "failed" || status === "cancelled" || status === "expired") {
        throw new Error(`Run falló con status: ${status}`);
      }
      
      if (status !== "completed") await new Promise((r) => setTimeout(r, 1000));
    }

    // Obtener respuesta
    const msgRes = await axios.get(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { headers }
    );

    const lastMessage = msgRes.data.data.find((m) => m.role === "assistant");
    const finalText = lastMessage?.content?.[0]?.text?.value || output;

    res.json({ response: finalText, thread_id: threadId });
  } catch (err) {
    console.error("❌ Error en /chat:", err.message);
    res.status(500).json({ 
      error: "Error procesando tu solicitud",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Endpoint de health check para Render
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development"
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