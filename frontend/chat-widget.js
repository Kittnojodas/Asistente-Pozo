(function () {
  // Esperar a que el DOM esté completamente cargado
  document.addEventListener('DOMContentLoaded', function() {
    const head = document.head;
    const body = document.body;

    // Cargar fuente Inter
    const fontLink = document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap";
    fontLink.rel = "stylesheet";
    head.appendChild(fontLink);

    // CSS del widget
    const widgetStyles = document.createElement("style");
    widgetStyles.textContent = `
      :root {
        --primary: #1e3a5f;
        --secondary: #2c5282;
        --accent: #3182ce;
        --light: #ebf8ff;
        --dark: #1a202c;
        --assistant-bubble: #f7fafc;
        --user-bubble: #e6fffa;
        --gradient: linear-gradient(135deg, var(--primary), var(--secondary));
        --font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      }
      
      /* Botón de volver */
      .back-button {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: var(--gradient);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 12px 20px;
        font-family: var(--font-family);
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
      }
      
      .back-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
      }
      
      .back-button:active {
        transform: translateY(0);
      }
      
      /* Icono de flecha para el botón */
      .back-button::before {
        content: '←';
        font-size: 16px;
        font-weight: bold;
      }
      
      /* Widget de chat */
      .chat-widget {
        display: flex;
        flex-direction: column;
        width: 90%;
        max-width: 500px;
        position: fixed;
        bottom: 20px;
        left: 5%;
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        overflow: hidden;
        z-index: 9999;
        animation: fadeInUp 0.4s ease-out;
        border: 1px solid #e2e8f0;
      }
      
      .chat-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: var(--gradient);
        color: white;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .chat-header img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      .chat-header-info {
        flex-grow: 1;
      }
      
      .chat-header-info .name {
        font-size: 16px;
        font-weight: 600;
        color: white;
      }
      
      .chat-header-info .subtitle {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.8);
      }
      
      .chat-messages {
        max-height: 400px;
        overflow-y: auto;
        flex-grow: 1;
        margin: 0;
        padding: 20px;
        border-radius: 0;
        -webkit-overflow-scrolling: touch;
        background: #f8fafc;
      }
      
      .chat-bubble {
        max-width: 75%;
        padding: 12px 16px;
        margin: 8px 0;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
        white-space: pre-wrap;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        font-family: var(--font-family);
      }
      
      .chat-bubble.user {
        background: var(--user-bubble);
        color: var(--dark);
        align-self: flex-end;
        margin-left: auto;
        border-bottom-right-radius: 4px;
      }
      
      .chat-bubble.assistant {
        background: var(--assistant-bubble);
        color: var(--dark);
        align-self: flex-start;
        margin-right: auto;
        border-bottom-left-radius: 4px;
      }
      
      .chat-input-container {
        display: flex;
        padding: 12px 16px;
        border-top: 1px solid #e2e8f0;
        background: white;
        gap: 10px;
      }
      
      #user-input {
        flex: 1;
        padding: 10px 14px;
        border-radius: 8px;
        border: 1px solid #cbd5e0;
        font-size: 14px;
        font-family: var(--font-family);
        background: white;
        transition: border-color 0.2s;
      }
      
      #user-input:focus {
        border-color: var(--accent);
        outline: none;
        box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
      }
      
      .chat-widget button {
        padding: 10px 16px;
        background: var(--gradient);
        color: white;
        font-weight: 500;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-family: var(--font-family);
        font-size: 14px;
      }
      
      .chat-widget button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      /* Animación de entrada */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Responsive */
      @media screen and (max-width: 480px) {
        .chat-widget {
          width: 100%;
          max-width: 100%;
          bottom: 0;
          left: 0;
          border-radius: 16px 16px 0 0;
          height: 80vh;
        }
        
        .chat-messages {
          max-height: calc(80vh - 120px);
        }
        
        .back-button {
          top: 10px;
          right: 10px;
          padding: 10px 16px;
          font-size: 12px;
        }
      }
    `;
    head.appendChild(widgetStyles);

    let threadId = localStorage.getItem("thread_id") || null;

    // Crear botón de volver
    const backButton = document.createElement("button");
    backButton.className = "back-button";
    backButton.innerHTML = "Volver";
    backButton.onclick = function() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    };
    body.appendChild(backButton);

    // HTML del widget (siempre visible)
    const widgetHTML = `
      <div id="chat-widget" class="chat-widget">
        <div class="chat-header">
          <img src="/images/giorgia.png" alt="Pozo" />
          <div class="chat-header-info">
            <div class="name">Asistente Giorgia</div>
            <div class="subtitle">Tu experto inmobiliario</div>
          </div>
        </div>
        <div id="messages" class="chat-messages">
          <div class="chat-bubble assistant">
            ¡Hola! Soy Giorgia, tu asistente en este emprendimiento. ¿En qué puedo ayudarte hoy?
          </div>
        </div>
        <div class="chat-input-container">
          <input type="text" id="user-input" placeholder="Escribe tu mensaje..." />
          <button id="send-button">Enviar</button>
        </div>
      </div>
    `;
    
    const wrapper = document.createElement("div");
    wrapper.innerHTML = widgetHTML;
    body.appendChild(wrapper);

    // Definir la función sendMessage
    window.sendMessage = async function() {
      const input = document.getElementById("user-input");
      const message = input.value.trim();
      if (!message) return;

      const messagesDiv = document.getElementById("messages");

      const userBubble = document.createElement("div");
      userBubble.className = "chat-bubble user";
      userBubble.innerHTML = message;
      messagesDiv.appendChild(userBubble);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      input.value = "";

      // Mostrar "Pozo está escribiendo..."
      const typingBubble = document.createElement("div");
      typingBubble.className = "chat-bubble assistant";
      typingBubble.id = "typing-bubble";
      typingBubble.innerHTML = "Giorgia está escribiendo...";
      messagesDiv.appendChild(typingBubble);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      try {
        const res = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, thread_id: threadId })
        });

        const data = await res.json();

        if (data.thread_id) {
          threadId = data.thread_id;
          localStorage.setItem("thread_id", threadId);
        }

        // Eliminar "escribiendo..." bubble
        const typing = document.getElementById("typing-bubble");
        if (typing) typing.remove();

        const assistantBubble = document.createElement("div");
        assistantBubble.className = "chat-bubble assistant";
        assistantBubble.innerHTML = data.response;
        messagesDiv.appendChild(assistantBubble);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      } catch (err) {
        const errorBubble = document.createElement("div");
        errorBubble.className = "chat-bubble assistant";
        errorBubble.innerHTML = "Lo siento, ocurrió un error.";
        errorBubble.style.color = "red";
        messagesDiv.appendChild(errorBubble);
      }
    };

    // Función para adjuntar los event listeners
    function attachEventListeners() {
      const userInput = document.getElementById("user-input");
      const sendButton = document.getElementById("send-button");
      
      if (userInput && sendButton) {
        // Event listener para la tecla Enter
        userInput.addEventListener('keydown', function(event) {
          if (event.key === 'Enter') {
            event.preventDefault();
            console.log("Tecla Enter presionada");
            window.sendMessage();
          }
        });
        
        // Event listener para el botón de enviar
        sendButton.addEventListener('click', function() {
          console.log("Botón Enviar clickeado");
          window.sendMessage();
        });
        
        console.log("✅ Event listeners adjuntados correctamente");
      } else {
        console.error("❌ No se encontraron los elementos del chat");
        console.log("userInput:", userInput);
        console.log("sendButton:", sendButton);
        // Reintentar después de un corto tiempo
        setTimeout(attachEventListeners, 100);
      }
    }

    // Adjuntar los event listeners
    setTimeout(attachEventListeners, 100);
  });
})();