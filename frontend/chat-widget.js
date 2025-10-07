(function () {
  const head = document.head;
  const body = document.body;

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


    .chat-widget,
    .chat-header,
    .chat-messages,
    .chat-input-container,
    .chat-bubble,
    #chat-bubble-hint {
      font-family: 'Poppins', 'Noto Color Emoji', sans-serif;
    }
    
    #chat-bubble-hint {
      font-style: normal;
      font-weight: normal;
    }
    
    .chat-widget {
      display: flex;
      flex-direction: column;
      width: 90%;
      max-width: 500px;
      position: fixed;
      bottom: 20px;
      left: 5%;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      z-index: 9999;
      animation: fadeInUp 0.4s ease-out;
    }
    
    /* ... (resto de estilos CSS que tenías) ... */
  `;
  head.appendChild(widgetStyles);

  let chatOpenedManually = false;
  let threadId = localStorage.getItem("thread_id") || null;

  // HTML del widget
  const widgetHTML = `
    <div id="chat-widget" class="chat-widget" style="display:none">
      <div class="chat-header">
        <img src="/images/giorgia.png" alt="Pozo" style="width: 50px; height: 50px; border-radius: 50%;" />
        <span id="chat-header-text">Hola, soy Giorgia. Pregúntame lo que quieras</span>
        
      </div>
      <div id="messages" class="chat-messages"></div>
      <div class="chat-input-container">
        <input type="text" id="user-input" placeholder="Escribe tu mensaje..." />
        <button onclick="sendMessage()">Enviar</button>
      </div>
    </div>
    <button id="chat-toggle-button">
      <img src="/images/logo.png" alt="Chat" />
    </button>
  `;
  
head.appendChild(widgetStyles);

  // Crear botón de volver
  const backButton = document.createElement("button");
  backButton.className = "back-button";
  backButton.innerHTML = "Volver";
  backButton.onclick = function() {
    // Volver a la página anterior
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Si no hay historial, ir al home
      window.location.href = "/";
    }
  };
  body.appendChild(backButton);


  const wrapper = document.createElement("div");
  wrapper.innerHTML = widgetHTML;
  body.appendChild(wrapper);



  window.sendMessage = async function () {
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

    // Mostrar "Giorgia está escribiendo..."
    const typingBubble = document.createElement("div");
    typingBubble.className = "chat-bubble assistant";
    typingBubble.id = "typing-bubble";
    typingBubble.innerHTML = "Giorgia está escribiendo";
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

  document.getElementById("chat-toggle-button").addEventListener("click", window.toggleChat);
  document.getElementById("user-input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      window.sendMessage();
    }
  });
})();
