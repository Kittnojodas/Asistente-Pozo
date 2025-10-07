(function () {
  // Esperar a que el DOM esté completamente cargado
  document.addEventListener('DOMContentLoaded', function() {
    const head = document.head;
    const body = document.body;

    // Cargar fuentes Barbold y Montserrat
    const fontLink = document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css2?family=Barlow:wght@700&family=Montserrat:wght@400&display=swap";
    fontLink.rel = "stylesheet";
    head.appendChild(fontLink);

    // CSS del widget con mayor especificidad
    const widgetStyles = document.createElement("style");
    widgetStyles.textContent = `
      :root {
        --primary: #1e3a5f;
        --secondary: #2c5282;
        --accent: #3182ce;
        --light: #ebf8ff;
        --dark: #1a202c;
        --assistant-bubble: #eef2f7; /* Color ligeramente modificado */
        --user-bubble: #e6fffa;
        --gradient: linear-gradient(135deg, var(--primary), var(--secondary));
        --font-header: 'Barlow', sans-serif;
        --font-messages: 'Montserrat', sans-serif;
      }
      
      /* Botón de volver */
      .back-button {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        z-index: 10000 !important;
        background: var(--gradient) !important;
        color: white !important;
        border: none !important;
        border-radius: 50px !important;
        padding: 12px 20px !important;
        font-family: var(--font-messages) !important;
        font-weight: 500 !important;
        font-size: 14px !important;
        cursor: pointer !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        transition: all 0.3s ease !important;
      }
      
      .back-button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1) !important;
      }
      
      .back-button:active {
        transform: translateY(0) !important;
      }
      
      /* Icono de flecha para el botón */
      .back-button::before {
        content: '←' !important;
        font-size: 16px !important;
        font-weight: bold !important;
      }
      
      /* Widget de chat centrado en desktop */
      body #chat-widget.chat-widget {
        display: flex !important;
        flex-direction: column !important;
        width: 90% !important;
        max-width: 500px !important;
        position: fixed !important;
        top: 20px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        background: white !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        overflow: hidden !important;
        z-index: 9999 !important;
        animation: fadeInUp 0.4s ease-out !important;
        border: 1px solid #e2e8f0 !important;
      }
      
      body #chat-widget.chat-widget .chat-header {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        padding: 16px 20px !important;
        background: var(--gradient) !important;
        color: white !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      
      body #chat-widget.chat-widget .chat-header img {
        width: 50px !important;
        height: 50px !important;
        border-radius: 50% !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      }
      
      body #chat-widget.chat-widget .chat-header-info {
        flex-grow: 1 !important;
      }
      
      body #chat-widget.chat-widget .chat-header-info .name {
        font-size: 18px !important;
        font-weight: 700 !important;
        font-family: var(--font-header) !important;
        color: white !important;
        letter-spacing: 0.5px !important;
      }
      
      body #chat-widget.chat-widget .chat-header-info .subtitle {
        font-size: 14px !important;
        font-family: var(--font-header) !important;
        color: rgba(255, 255, 255, 0.8) !important;
        margin-top: 2px !important;
      }
      
      body #chat-widget.chat-widget .chat-messages {
        max-height: 400px !important;
        overflow-y: auto !important;
        flex-grow: 1 !important;
        margin: 0 !important;
        padding: 20px !important;
        border-radius: 0 !important;
        -webkit-overflow-scrolling: touch !important;
        background: #f8fafc !important;
      }
      
      body #chat-widget.chat-widget .chat-bubble {
        max-width: 75% !important;
        padding: 12px 16px !important;
        margin: 8px 0 !important;
        border-radius: 18px !important;
        font-size: 15px !important;
        line-height: 1.5 !important;
        word-break: break-word !important;
        white-space: pre-wrap !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        font-family: var(--font-messages) !important;
      }
      
      body #chat-widget.chat-widget .chat-bubble.user {
        background: var(--user-bubble) !important;
        color: var(--dark) !important;
        align-self: flex-end !important;
        margin-left: auto !important;
        border-bottom-right-radius: 4px !important;
      }
      
      body #chat-widget.chat-widget .chat-bubble.assistant {
        background: var(--assistant-bubble) !important;
        color: var(--dark) !important;
        align-self: flex-start !important;
        margin-right: auto !important;
        border-bottom-left-radius: 4px !important;
      }
      
      body #chat-widget.chat-widget .chat-input-container {
        display: flex !important;
        padding: 12px 16px !important;
        border-top: 1px solid #e2e8f0 !important;
        background: white !important;
        gap: 10px !important;
      }
      
      body #chat-widget.chat-widget #user-input {
        flex: 1 !important;
        padding: 10px 14px !important;
        border-radius: 8px !important;
        border: 1px solid #cbd5e0 !important;
        font-size: 14px !important;
        font-family: var(--font-messages) !important;
        background: white !important;
        transition: border-color 0.2s !important;
      }
      
      body #chat-widget.chat-widget #user-input:focus {
        border-color: var(--accent) !important;
        outline: none !important;
        box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1) !important;
      }
      
      body #chat-widget.chat-widget button {
        padding: 10px 16px !important;
        background: var(--gradient) !important;
        color: white !important;
        font-weight: 500 !important;
        border: none !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        font-family: var(--font-messages) !important;
        font-size: 14px !important;
      }
      
      body #chat-widget.chat-widget button:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      }
      
      /* Animación de los tres puntitos - versión JavaScript */
      .chat-bubble.typing {
        font-style: italic !important;
        font-size: 13px !important;
        color: #777 !important;
        opacity: 0.8 !important;
        background: var(--assistant-bubble) !important;
        color: var(--primary) !important;
        align-self: flex-start !important;
        margin-right: auto !important;
        border-bottom-left-radius: 4px !important;
        font-family: var(--font-messages) !important;
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
        body #chat-widget.chat-widget {
          width: 95% !important;
          max-width: 95% !important;
          bottom: 2px !important;
          left: 1px !important;
          border-radius: 16px 16px 0 0 !important;
          height: 80vh !important;
          transform: none !important;
        }
        
        body #chat-widget.chat-widget .chat-messages {
          max-height: calc(80vh - 120px) !important;
        }
        
        .back-button {
          top: 10px !important;
          right: 10px !important;
          padding: 10px 16px !important;
          font-size: 12px !important;
        }
      }
      
      /* Desktop - mantener centrado */
      @media screen and (min-width: 481px) {
        body #chat-widget.chat-widget {
          left: 50% !important;
          transform: translateX(-50%) !important;
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
            <div class="subtitle">Experta en Inversiones</div>
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

      // Mostrar "Giorgia está escribiendo..." con animación
      const typingBubble = document.createElement("div");
      typingBubble.className = "chat-bubble typing";
      typingBubble.id = "typing-bubble";
      typingBubble.innerHTML = "Giorgia está escribiendo<span id='typing-dots'></span>";
      messagesDiv.appendChild(typingBubble);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      // Animación de los puntos con JavaScript
      let dotsCount = 0;
      const typingInterval = setInterval(() => {
        dotsCount = (dotsCount + 1) % 4;
        const dotsElement = document.getElementById('typing-dots');
        if (dotsElement) {
          dotsElement.textContent = '.'.repeat(dotsCount);
        }
      }, 400);

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

        // Detener la animación y eliminar "escribiendo..." bubble
        clearInterval(typingInterval);
        const typing = document.getElementById("typing-bubble");
        if (typing) typing.remove();

        const assistantBubble = document.createElement("div");
        assistantBubble.className = "chat-bubble assistant";
        assistantBubble.innerHTML = data.response;
        messagesDiv.appendChild(assistantBubble);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      } catch (err) {
        // Detener la animación y eliminar "escribiendo..." bubble
        clearInterval(typingInterval);
        const typing = document.getElementById("typing-bubble");
        if (typing) typing.remove();
        
        const errorBubble = document.createElement("div");
        errorBubble.className = "chat-bubble assistant";
        errorBubble.innerHTML = "Lo siento, ocurrió un error.";
        errorBubble.style.color = "red";
        messagesDiv.appendChild(errorBubble);
      }
    };

    // Función para adjuntar los event listeners con múltiples intentos
    function attachEventListeners() {
      const userInput = document.getElementById("user-input");
      const sendButton = document.getElementById("send-button");
      
      if (userInput && sendButton) {
        // Remover listeners existentes para evitar duplicados
        userInput.removeEventListener('keydown', handleEnterKey);
        sendButton.removeEventListener('click', window.sendMessage);
        
        // Event listener para la tecla Enter
        userInput.addEventListener('keydown', handleEnterKey);
        
        // Event listener para el botón de enviar
        sendButton.addEventListener('click', window.sendMessage);
        
        console.log("✅ Event listeners adjuntados correctamente");
      } else {
        console.error("❌ No se encontraron los elementos del chat");
        console.log("userInput:", userInput);
        console.log("sendButton:", sendButton);
        // Reintentar después de un corto tiempo
        setTimeout(attachEventListeners, 200);
      }
    }

    // Función que maneja la tecla Enter
    function handleEnterKey(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        console.log("🔑 Tecla Enter presionada");
        window.sendMessage();
      }
    }

    // Adjuntar los event listeners con múltiples reintentos
    function attachWithRetry() {
      attachEventListeners();
      setTimeout(attachEventListeners, 500);
      setTimeout(attachEventListeners, 1000);
    }

    // Iniciar el proceso de adjuntar listeners
    attachWithRetry();
  });
})();