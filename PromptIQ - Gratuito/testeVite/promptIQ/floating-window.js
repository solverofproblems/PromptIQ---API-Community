// Sistema de janela flutuante do PromptIQ
class PromptIQFloatingWindow {
  constructor() {
    this.window = null;
    this.isMinimized = false;
    this.isVisible = false;
    this.init();
  }

  init() {
    // Injetar CSS primeiro
    this.injectCSS();
    
    // Aguardar o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createWindow());
    } else {
      this.createWindow();
    }
  }

  injectCSS() {
    // Verificar se o CSS já foi injetado
    if (document.getElementById('promptiq-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'promptiq-styles';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Zalando+Sans+SemiExpanded:ital,wght@0,200..900;1,200..900&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
      
      /* Janela flutuante do PromptIQ */
      #promptiq-floating-window {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 500px;
        max-height: 80vh;
        min-height: 400px;
        background: #f3f3f3;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        z-index: 10000;
        font-family: "Montserrat", sans-serif;
        color: #fff;
        overflow: hidden;
        transition: all 0.3s ease;
        border: 2px solid #0892ad;
        display: flex;
        flex-direction: column;
      }

      #promptiq-floating-window.minimized {
        height: 60px !important;
        max-height: 60px !important;
        min-height: 60px !important;
        overflow: hidden;
        transition: height 0.3s ease;
      }

      #promptiq-floating-window.minimized .promptiq-content {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
        opacity: 0 !important;
        transform: scaleY(0) !important;
        transition: all 0.3s ease !important;
      }

      #promptiq-floating-window.minimized .promptiq-results {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
        opacity: 0 !important;
        transform: scaleY(0) !important;
        transition: all 0.3s ease !important;
      }

      /* Header da janela - compacto */
      .promptiq-header {
        width: 100%;
        background-image: linear-gradient(180deg, #181818, #2f2f2f, #181818);
        color: #e6e6e6;
        padding: 1rem 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;
      }

      .promptiq-header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .promptiq-logo {
        width: 28px;
        height: 28px;
      }

      .promptiq-title {
        font-family: "Zalando Sans SemiExpanded", sans-serif;
        font-weight: 600;
        font-size: 1.5rem;
        text-shadow: 0 0 5px rgba(255,255,255,0.2);
        margin: 0;
      }

      .promptiq-controls {
        display: flex;
        gap: 8px;
      }

      .promptiq-btn {
        background: none;
        border: none;
        color: #e6e6e6;
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        font-size: 14px;
      }

      .promptiq-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      /* Conteúdo da janela - seguindo o layout original */
      .promptiq-content {
        padding: 0;
        flex: 1;
        overflow-y: auto;
        background: #f3f3f3;
        min-height: 0; /* Permite que o flex funcione corretamente */
      }

      /* BLOCO DO USUÁRIO - seguindo o original */
      .promptiq-text-user {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        margin-top: 3%;
        padding: 2rem;
      }

      .promptiq-text-display {
        padding: 1rem 2rem;
        border-radius: 10px;
        color: #fff;
        font-family: "Zalando Sans SemiExpanded", sans-serif;
        font-weight: 600;
        background-image: linear-gradient(180deg, #0892ad, #0fd6ff, #0892ad);
        box-shadow: 0 4px 12px rgba(8,146,173,0.4);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        word-wrap: break-word;
        max-width: 100%;
        font-size: 1rem;
      }

      .promptiq-text-display:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(8, 146, 173, 0.6);
      }

      .promptiq-capture-btn {
        padding: 0.6rem 2rem;
        background-image: linear-gradient(180deg, #1e3a8a, #3b82f6, #1e3a8a);
        color: white;
        font-weight: 600;
        border: none;
        border-radius: 6px;
        box-shadow: 0 0 14px rgba(30, 58, 138, 0.5);
        transition: background-image 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
        font-size: 1rem;
        margin-bottom: 0.5rem;
      }

      .promptiq-capture-btn:hover {
        background-image: linear-gradient(180deg, #ffc20b, #ffe154, #ffc20b);
        transform: translateY(-2px);
        box-shadow: 0 0 20px rgba(255, 193, 7, 0.6);
      }

      .promptiq-analyze-btn {
        padding: 0.6rem 2rem;
        background-image: linear-gradient(180deg, #0cb5dc, #0fd6ff, #0cb5dc);
        color: white;
        font-weight: 600;
        border: none;
        border-radius: 6px;
        box-shadow: 0 0 14px rgba(0, 180, 220, 0.5);
        transition: background-image 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
        font-size: 1rem;
      }

      .promptiq-analyze-btn:hover {
        background-image: linear-gradient(180deg, #ffc20b, #ffe154, #ffc20b);
        transform: translateY(-2px);
        box-shadow: 0 0 20px rgba(255,193,7,0.6);
      }

      /* CONTAINER DE RESULTADOS - seguindo o original */
      .promptiq-container-fix {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.5rem;
        margin-top: 1rem;
        background-image: linear-gradient(180deg, #1f1f1f, #3b3b3b, #1f1f1f);
        border-radius: 12px;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        margin-left: auto;
        margin-right: auto;
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        transition: transform 0.2s ease;
        min-height: fit-content;
      }

      /* HEADINGS - seguindo o original */
      .promptiq-resume-text-user h1,
      .promptiq-positive-topics h1,
      .promptiq-negative-topics h1,
      .promptiq-sugestions-improve h1,
      .promptiq-prompt-improved h1,
      .promptiq-level-prompt h1 {
        font-family: "Zalando Sans SemiExpanded", sans-serif;
        color: #ffffff;
        font-weight: 600;
        margin-bottom: 1rem;
        text-align: center;
        text-shadow: 0 0 4px rgba(255,255,255,0.2);
        font-size: 1.2rem;
      }

      /* CARDS INTERNOS - seguindo o original */
      .promptiq-resume-text-user p,
      .promptiq-sugestions-improve,
      .promptiq-prompt-improved,
      .promptiq-level-prompt {
        background-image: linear-gradient(180deg, #4b4b4b, #6a6a6a, #4b4b4b);
        border-radius: 15px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      }

      .promptiq-resume-text-user {
        width: 90%;
        margin: 0 auto;
        padding: 1rem 1.5rem;
        color: white;
        min-height: fit-content;
      }

      .promptiq-resume-text-user p {
        width: 100%;
        margin: 0;
        padding: 1rem;
        color: white;
        font-size: 1rem;
        line-height: 1.5;
      }

      /* TOPICS - seguindo o original */
      .promptiq-topics {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 90%;
        margin: 0 auto;
        background-image: linear-gradient(180deg, #4b4b4b, #6a6a6a, #4b4b4b);
        border-radius: 15px;
        padding: 1rem;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        min-height: fit-content;
      }

      .promptiq-positive-topics,
      .promptiq-negative-topics {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .promptiq-positive-topics-background {
        background-image: linear-gradient(
          180deg,
          rgba(0, 200, 0, 0.5),
          rgba(0, 150, 0, 0.3)
        );
        border-radius: 8px;
        padding: 0.8rem;
        box-shadow: 0 2px 8px rgba(0,200,0,0.3);
        min-height: fit-content;
      }

      .promptiq-negative-topics-background {
        background-image: linear-gradient(
          180deg,
          rgba(200, 0, 0, 0.5),
          rgba(150, 0, 0, 0.3)
        );
        border-radius: 8px;
        padding: 0.8rem;
        box-shadow: 0 2px 8px rgba(200,0,0,0.3);
        min-height: fit-content;
      }

      .promptiq-positive-topics p,
      .promptiq-negative-topics p,
      .promptiq-sugestions-improve p,
      .promptiq-prompt-improved p,
      .promptiq-level-prompt #comentario-comparativo {
        font-family: "Montserrat", sans-serif;
        font-size: 1rem;
        color: white;
      }

      /* SEÇÕES INDIVIDUAIS - seguindo o original */
      .promptiq-sugestions-improve,
      .promptiq-prompt-improved,
      .promptiq-level-prompt {
        position: relative;
        width: 90%;
        margin: 0 auto;
        padding: 1rem 1.5rem;
        color: white;
        transition: transform 0.2s ease;
        min-height: fit-content;
      }

      /* Container específico para pontuação */
      .promptiq-level-prompt {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      /* Padding específico para o prompt melhorado para dar espaço ao botão */
      .promptiq-prompt-improved {
        padding-right: 3rem; /* Espaço reduzido para o botão menor */
      }

      .promptiq-img-copy {
        position: absolute;
        right: 0.8rem;
        top: 0.8rem;
        padding: 0.3rem;
        border-radius: 6px;
        background-image: linear-gradient(
          180deg,
          #4e4e4e 0%,  /* cinza bem claro em cima */
          #383838 100% /* cinza um pouco mais escuro em baixo */
        );
        border: 1.5px solid rgb(31, 31, 31);
        box-shadow: 0 0 6px rgb(29, 29, 29);
        z-index: 10; /* Garantir que fique acima do texto */
        cursor: pointer;
      }

      .promptiq-img-copy img {
        width: 20px;
      }

      .promptiq-img-copy:hover {
        opacity: 0.8;
      }

      /* PONTUAÇÃO - destacada e centralizada */
      .promptiq-level-prompt #pontuacao {
        text-align: center;
        font-family: "Zalando Sans SemiExpanded", sans-serif;
        font-weight: 900;
        margin: 1.5rem 0;
        font-size: 3.5rem;
        text-shadow: 0 0 15px rgba(255,255,255,0.4), 0 0 30px rgba(8, 146, 173, 0.3);
        color: #ffffff;
        display: block;
        width: 100%;
        line-height: 1;
        letter-spacing: -2px;
        background: linear-gradient(45deg, #ffffff, #0fd6ff, #ffffff);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: scoreGlow 2s ease-in-out infinite alternate;
      }

      /* Animação para destacar a pontuação */
      @keyframes scoreGlow {
        0% {
          text-shadow: 0 0 15px rgba(255,255,255,0.4), 0 0 30px rgba(8, 146, 173, 0.3);
        }
        100% {
          text-shadow: 0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(8, 146, 173, 0.5);
        }
      }

      /* Mensagem de erro */
      .promptiq-error {
        width: 100%;
        text-align: center;
        padding: 20px;
        color: white;
        font-weight: 600;
        border-radius: 10px;
        background: linear-gradient(180deg, rgba(200, 0, 0, 0.8), rgba(241, 1, 1, 0.8));
        box-shadow: 0 2px 8px rgba(200, 0, 0, 0.5);
        transition: transform 0.2s ease;
      }

      .promptiq-error:hover {
        transform: translateY(-2px);
      }

      /* Scrollbar personalizada */
      .promptiq-content::-webkit-scrollbar {
        width: 8px;
      }

      .promptiq-content::-webkit-scrollbar-track {
        background: #2a2a2a;
        border-radius: 4px;
      }

      .promptiq-content::-webkit-scrollbar-thumb {
        background: #0892ad;
        border-radius: 4px;
        border: 1px solid #0fd6ff;
      }

      .promptiq-content::-webkit-scrollbar-thumb:hover {
        background: #0fd6ff;
        border: 1px solid #0892ad;
      }

      /* Garantir que o scroll funcione em todos os navegadores */
      .promptiq-content {
        scrollbar-width: thin;
        scrollbar-color: #0892ad #2a2a2a;
      }

      /* Responsividade */
      @media (max-width: 480px) {
        #promptiq-floating-window {
          width: calc(100vw - 40px);
          right: 20px;
          left: 20px;
        }
      }

      /* Animações */
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      #promptiq-floating-window {
        animation: slideIn 0.3s ease-out;
      }

      /* Notificação de cópia */
      .promptiq-copy-notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(180deg, #4CAF50, #45a049);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-family: "Montserrat", sans-serif;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        z-index: 10001;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
      }

      .promptiq-copy-notification.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      /* Efeito de carregamento na janela flutuante */
      .promptiq-loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background-image: linear-gradient(180deg, #4b4b4b, #6a6a6a, #4b4b4b);
        border-radius: 15px;
        margin: 1rem auto;
        width: 90%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      }

      .promptiq-loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #0892ad;
        border-top: 4px solid #0fd6ff;
        border-radius: 50%;
        animation: promptiqSpin 1s linear infinite;
        margin-bottom: 1rem;
      }

      .promptiq-loading-text {
        font-family: "Montserrat", sans-serif;
        color: #0fd6ff;
        font-size: 1.1rem;
        font-weight: 600;
        text-align: center;
        margin-bottom: 0.5rem;
      }

      .promptiq-loading-subtext {
        font-family: "Montserrat", sans-serif;
        color: #e6e6e6;
        font-size: 0.9rem;
        text-align: center;
        opacity: 0.8;
      }

      @keyframes promptiqSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Animação de fade in para resultados na janela flutuante */
      .promptiq-results-fade-in {
        animation: promptiqFadeIn 0.5s ease-in-out;
      }

      @keyframes promptiqFadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Estilos para limite da API atingido na janela flutuante */
      .promptiq-limit-reached-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background: linear-gradient(180deg, #1f1f1f, #3b3b3b, #1f1f1f);
        border-radius: 15px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        text-align: center;
        margin: 1rem auto;
        animation: promptiqLimitFadeIn 0.5s ease-in-out;
      }

      .promptiq-limit-reached-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        animation: promptiqLimitPulse 2s ease-in-out infinite;
      }

      .promptiq-limit-reached-title {
        font-family: "Zalando Sans SemiExpanded", sans-serif;
        color: #ff6b6b;
        font-weight: 700;
        font-size: 1.5rem;
        margin-bottom: 1rem;
        text-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
      }

      .promptiq-limit-reached-message {
        font-family: "Montserrat", sans-serif;
        color: #e6e6e6;
        font-size: 1rem;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .promptiq-limit-reached-details {
        font-family: "Montserrat", sans-serif;
        color: #ffc20b;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        font-weight: 600;
      }

      .promptiq-limit-reached-info {
        background: linear-gradient(180deg, #4b4b4b, #6a6a6a, #4b4b4b);
        border-radius: 8px;
        padding: 0.8rem;
        margin-bottom: 1rem;
        border-left: 3px solid #ffc20b;
      }

      .promptiq-limit-reached-info p {
        font-family: "Montserrat", sans-serif;
        color: #e6e6e6;
        font-size: 0.8rem;
        margin: 0;
        line-height: 1.3;
      }

      .promptiq-limit-reached-retry {
        margin-top: 0.5rem;
      }

      .promptiq-retry-button {
        background: linear-gradient(180deg, #ff6b6b, #ff5252, #ff6b6b);
        color: white;
        border: none;
        padding: 0.6rem 1.5rem;
        border-radius: 6px;
        font-family: "Montserrat", sans-serif;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
      }

      .promptiq-retry-button:hover {
        background: linear-gradient(180deg, #ff5252, #ff1744, #ff5252);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(255, 107, 107, 0.6);
      }

      .promptiq-retry-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
      }

      @keyframes promptiqLimitFadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes promptiqLimitPulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  createWindow() {
    // Verificar se a janela já existe
    if (document.getElementById('promptiq-floating-window')) {
      return;
    }

    // Criar elemento da janela
    this.window = document.createElement('div');
    this.window.id = 'promptiq-floating-window';
    this.window.innerHTML = this.getWindowHTML();
    
    // Adicionar ao body
    document.body.appendChild(this.window);
    
    // Configurar eventos
    this.setupEvents();
    
    // Carregar dados salvos
    this.loadSavedData();
    
    this.isVisible = true;
  }

  getWindowHTML() {
    return `
      <div class="promptiq-header">
        <div class="promptiq-header-left">
          <img src="https://messier.com.br/wp-content/uploads/2023/10/logo-messier.svg" alt="Logo" class="promptiq-logo">
          <h1 class="promptiq-title">PromptIQ</h1>
        </div>
        <div class="promptiq-controls">
          <button class="promptiq-btn" id="promptiq-minimize" title="Minimizar">−</button>
          <button class="promptiq-btn" id="promptiq-close" title="Fechar">×</button>
        </div>
      </div>
      <div class="promptiq-content">
        <div class="promptiq-text-user">
          <div class="promptiq-text-display">
            <p id="promptiq-texto">Me informe uma receita de bolo</p>
          </div>
          <button class="promptiq-analyze-btn" id="promptiq-btn-avaliar">Analisar</button>
        </div>
        <div class="promptiq-results" id="promptiq-areaResultados">
          <!-- Resultados serão inseridos aqui -->
        </div>
      </div>
    `;
  }

  setupEvents() {
    // Botões de controle
    const minimizeBtn = this.window.querySelector('#promptiq-minimize');
    const closeBtn = this.window.querySelector('#promptiq-close');
    const analyzeBtn = this.window.querySelector('#promptiq-btn-avaliar');
    const header = this.window.querySelector('.promptiq-header');

    // Minimizar/Restaurar
    minimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMinimize();
    });

    // Fechar
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hide();
    });

    // Arrastar janela
    this.setupDrag(header);

    // Botão de análise
    analyzeBtn.addEventListener('click', () => {
      this.analyzePrompt();
    });

    // Escutar mudanças no texto do ChatGPT
    this.setupTextListener();
  }

  setupDrag(header) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.promptiq-controls')) return;
      
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === header || header.contains(e.target)) {
        isDragging = true;
        this.window.style.cursor = 'grabbing';
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        this.window.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    });

    document.addEventListener('mouseup', () => {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
      this.window.style.cursor = 'default';
    });
  }

  setupTextListener() {
    // Não fazer captura em tempo real - apenas configurar o botão de captura
    this.setupCaptureButton();
  }

  setupCaptureButton() {
    // Adicionar botão de captura na interface
    const textUserDiv = this.window.querySelector('.promptiq-text-user');
    if (textUserDiv) {
      const captureBtn = document.createElement('button');
      captureBtn.className = 'promptiq-capture-btn';
      captureBtn.textContent = 'Capturar Texto do ChatGPT';
      
      captureBtn.addEventListener('click', () => {
        this.captureTextFromChatGPT();
      });
      
      textUserDiv.insertBefore(captureBtn, textUserDiv.querySelector('.promptiq-analyze-btn'));
    }
  }

  captureTextFromChatGPT() {
    // Procurar pelo campo de texto do ChatGPT
    const campo = document.querySelector("div[contenteditable='true']");
    
    if (campo && campo.innerText) {
      const texto = campo.innerText.trim();
      
      // Verificar se o texto capturado é válido (não vazio e não apenas espaços)
      if (texto && texto !== "") {
        this.updateText(texto);
        
        // Salvar no storage
        chrome.storage.local.set({ ultimoTexto: texto });
        
        // Atualizar também a interface principal se existir
        this.updateMainInterface(texto);
        
        // Mostrar feedback visual
        this.showCaptureNotification('✅ Texto capturado com sucesso!');
      } else {
        this.showCaptureNotification('⚠️ Campo do ChatGPT está vazio ou contém apenas espaços');
      }
    } else {
      this.showCaptureNotification('⚠️ Nenhum texto encontrado no campo do ChatGPT');
    }
  }

  updateMainInterface(texto) {
    // Atualizar a interface principal se ela existir
    const mainTextElement = document.getElementById("texto");
    if (mainTextElement) {
      mainTextElement.innerText = texto;
      
      // Limpar mensagens de erro se existirem
      this.clearErrorMessages();
    }
  }

  clearErrorMessages() {
    // Limpar mensagens de erro da interface principal
    const areaInfo = document.getElementById('areaResultados');
    if (areaInfo) {
      const errorMessage = areaInfo.querySelector('.without-question');
      if (errorMessage) {
        areaInfo.innerHTML = '';
      }
    }
  }

  showCaptureNotification(message) {
    // Remover notificação anterior se existir
    const existingNotification = document.querySelector('.promptiq-capture-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Criar notificação
    const notification = document.createElement('div');
    notification.className = 'promptiq-capture-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(180deg, #17a2b8, #138496, #17a2b8);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-family: "Montserrat", sans-serif;
      font-weight: 600;
      font-size: 12px;
      box-shadow: 0 4px 12px rgba(23, 162, 184, 0.4);
      z-index: 10001;
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: none;
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificação
    setTimeout(() => notification.style.opacity = '1', 10);
    
    // Remover após 2 segundos
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  updateText(text) {
    const textElement = this.window.querySelector('#promptiq-texto');
    if (textElement) {
      textElement.textContent = text || "Veja como a IA pode dar vida aos seus pedidos!";
    }
  }

  loadSavedData() {
    chrome.storage.local.get("ultimoTexto", (data) => {
      const texto = data.ultimoTexto || "Veja como a IA pode dar vida aos seus pedidos!";
      this.updateText(texto);
    });
  }

  toggleMinimize() {
    const minimizeBtn = this.window.querySelector('#promptiq-minimize');
    
    if (this.isMinimized) {
      // Restaurar janela
      this.window.classList.remove('minimized');
      this.window.style.height = 'auto';
      this.window.style.maxHeight = '80vh';
      this.window.style.minHeight = 'auto';
      
      this.isMinimized = false;
      minimizeBtn.textContent = '−';
      minimizeBtn.title = 'Minimizar';
      
      // Ajustar altura após restaurar
      setTimeout(() => {
        this.adjustWindowHeight();
      }, 100);
    } else {
      // Minimizar janela - apenas o header fica visível
      this.window.classList.add('minimized');
      this.window.style.height = '60px';
      this.window.style.maxHeight = '60px';
      this.window.style.minHeight = '60px';
      
      this.isMinimized = true;
      minimizeBtn.textContent = '+';
      minimizeBtn.title = 'Restaurar';
    }
  }

  hide() {
    if (this.window) {
      this.window.style.display = 'none';
      this.isVisible = false;
    }
  }

  show() {
    if (this.window) {
      this.window.style.display = 'block';
      this.isVisible = true;
    }
  }

  async analyzePrompt() {
    const textElement = this.window.querySelector('#promptiq-texto');
    const resultsArea = this.window.querySelector('#promptiq-areaResultados');
    const analyzeBtn = this.window.querySelector('#promptiq-btn-avaliar');
    
    const promptText = textElement.textContent;
    
    // Verificar se há texto válido (não vazio, não apenas espaços, e não é o texto padrão)
    if (!promptText || 
        promptText.trim() === "" || 
        promptText === "Veja como a IA pode dar vida aos seus pedidos!") {
      resultsArea.innerHTML = `
        <div class="promptiq-error">
          <p>Digite uma pergunta primeiro!</p>
        </div>
      `;
      return;
    }

    // Desabilitar botão durante análise
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analisando...';

    try {
      // Mostrar tela de carregamento
      resultsArea.innerHTML = `
        <div class="promptiq-loading-container">
          <div class="promptiq-loading-spinner"></div>
          <div class="promptiq-loading-text">Analisando seu prompt...</div>
          <div class="promptiq-loading-subtext">Conectando com IA e processando dados</div>
        </div>
      `;

      // Adicionar tempo mínimo de carregamento para efeito visual
      const startTime = Date.now();
      const minLoadingTime = 2500; // 2.5 segundos mínimo
      
      // Mensagens dinâmicas durante o carregamento
      const loadingMessages = [
        "Conectando com IA...",
        "Analisando estrutura do prompt...",
        "Avaliando especificidade...",
        "Calculando pontuação...",
        "Finalizando análise..."
      ];
      
      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        if (messageIndex < loadingMessages.length) {
          const subtextElement = resultsArea.querySelector('.promptiq-loading-subtext');
          if (subtextElement) {
            subtextElement.textContent = loadingMessages[messageIndex];
          }
          messageIndex++;
        }
      }, 500);

      // Fazer requisição para o backend OpenRouter
      const response = await fetch(`http://localhost:3000/health?parametro=${encodeURIComponent(promptText)}`);
      const data = await response.json();

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      // Aguardar o tempo restante para completar o tempo mínimo
      setTimeout(() => {
        // Limpar intervalo das mensagens
        clearInterval(messageInterval);
        
        // Exibir resultados com animação
        this.displayResults(data, promptText);
      }, remainingTime);
      
    } catch (error) {
      console.error('Erro na análise:', error);
      
      // Verificar se é erro de limite da API
      if (error.response && error.response.status === 429 && error.response.data.error === 'LIMIT_REACHED') {
        const retryAfter = error.response.data.retryAfter || 300;
        const minutes = Math.ceil(retryAfter / 60);
        
        resultsArea.innerHTML = `
          <div class="promptiq-limit-reached-container">
            <div class="promptiq-limit-reached-icon">🚫</div>
            <h1 class="promptiq-limit-reached-title">Limite da API Atingido</h1>
            <p class="promptiq-limit-reached-message">A API comunitária atingiu seu limite de uso.</p>
            <p class="promptiq-limit-reached-details">Aguarde ${minutes} minutos antes de tentar novamente.</p>
            <div class="promptiq-limit-reached-info">
              <p>💡 <strong>Dica:</strong> APIs comunitárias têm limites para manter o serviço gratuito para todos.</p>
            </div>
            <div class="promptiq-limit-reached-retry">
              <button class="promptiq-retry-button" onclick="location.reload()">Tentar Novamente</button>
            </div>
          </div>
        `;
      } else {
        // Outros erros
        resultsArea.innerHTML = `
          <div class="promptiq-error">
            <p>Erro ao analisar o prompt. Verifique se o backend está rodando.</p>
          </div>
        `;
      }
    } finally {
      // Reabilitar botão
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'Analisar';
    }
  }

  displayResults(data, originalPrompt) {
    const resultsArea = this.window.querySelector('#promptiq-areaResultados');
    
    resultsArea.innerHTML = `
      <div class="promptiq-container-fix promptiq-results-fade-in">
        <div class="promptiq-resume-text-user">
          <h1>Resumo:</h1>
          <p id="promptiq-resumo">${data.resumo}</p>
        </div>

        <div class="promptiq-level-prompt">
          <h1>Sua pontuação:</h1>
          <p id="promptiq-pontuacao" style="font-weight=700">0</p>
          <p id="promptiq-comentario-comparativo"></p>
        </div>
      </div>
    `;

    // Preencher dados
    this.populateResults(data, originalPrompt);
    
    // Ajustar altura da janela após carregar o conteúdo
    this.adjustWindowHeight();
  }

  adjustWindowHeight() {
    // Aguardar um pouco para o DOM ser renderizado
    setTimeout(() => {
      const content = this.window.querySelector('.promptiq-content');
      const container = this.window.querySelector('.promptiq-container-fix');
      
      if (content && container) {
        // Calcular altura necessária
        const contentHeight = container.scrollHeight;
        const maxHeight = window.innerHeight * 0.8; // 80% da altura da tela
        
        // Ajustar altura da janela
        if (contentHeight > maxHeight) {
          this.window.style.maxHeight = maxHeight + 'px';
        } else {
          this.window.style.maxHeight = (contentHeight + 200) + 'px'; // +200 para header e padding
        }
      }
    }, 100);
  }

  populateResults(data, originalPrompt) {
    // Usar pontuação inteligente do OpenRouter
    const aiScore = data.pontuacao.nota;
    const aiComment = data.pontuacao.comentario;
    const aiResumo = data.resumo;
    
    const pontuacaoElement = document.getElementById('promptiq-pontuacao');
    const comentarioElement = document.getElementById('promptiq-comentario-comparativo');
    const resumoElement = document.getElementById('promptiq-resumo');
    
    if (pontuacaoElement) pontuacaoElement.textContent = aiScore;
    if (comentarioElement) comentarioElement.textContent = aiComment;
    if (resumoElement) resumoElement.textContent = aiResumo;
  }


  // Funções de pontuação offline removidas - agora usamos pontuação inteligente do ChatGPT
  
  // Todas as funções de pontuação offline foram removidas
  // Agora usamos apenas a pontuação inteligente do ChatGPT
  // Funções de pontuação offline completamente removidas
  // Sistema 100% baseado na pontuação inteligente do ChatGPT
  /*
  calculateLengthScore(prompt) {
    const length = prompt.length;
    let score = 0;
    
    if (length <= 20) {
      score = Math.max(length / 4, 1);
    } else if (length <= 50) {
      score = 3 + (length - 20) / 10;
    } else if (length <= 100) {
      score = 6 + (length - 50) / 12;
    } else if (length <= 200) {
      score = 10 + (length - 100) / 20;
    } else if (length <= 400) {
      score = 15;
    } else if (length <= 800) {
      score = 15 - (length - 400) / 50;
    } else {
      score = Math.max(7 - (length - 800) / 100, 3);
    }
    
    return Math.max(Math.min(Math.round(score), 15), 1);
  }

  calculateClarityScore(prompt) {
    let score = 0;
    if (prompt.length > 10) score += 2;
    if (prompt.includes('?')) score += 3;
    
    const questionWords = ['como', 'o que', 'quando', 'onde', 'por que', 'quem', 'qual'];
    const hasQuestionWords = questionWords.some(word => prompt.toLowerCase().includes(word));
    if (hasQuestionWords) score += 2;
    
    return Math.min(score, 12);
  }

  calculateSpellingScore(prompt) {
    let score = 0;
    if (prompt.length > 5) score += 3;
    
    const commonMistakes = ['vc', 'pq', 'tb', 'q', 'n', 'eh', 'ta', 'to'];
    let mistakeCount = 0;
    commonMistakes.forEach(mistake => {
      const regex = new RegExp(`\\b${mistake}\\b`, 'gi');
      const matches = prompt.match(regex);
      if (matches) mistakeCount += matches.length;
    });
    
    score -= mistakeCount * 1;
    if (mistakeCount === 0) score += 2;
    
    return Math.max(score, 1);
  }

  calculateSpecificityScore(prompt) {
    let score = 0;
    if (prompt.length > 10) score += 2;
    if (/\d+/.test(prompt)) score += 3;
    
    const exampleWords = ['exemplo', 'como', 'tipo', 'categoria'];
    const hasExamples = exampleWords.some(word => prompt.toLowerCase().includes(word));
    if (hasExamples) score += 3;
    
    return Math.min(score, 12);
  }

  calculateStructureScore(prompt) {
    let score = 0;
    if (prompt.length > 10) score += 2;
    
    const paragraphCount = (prompt.match(/\n/g) || []).length;
    if (paragraphCount > 0) score += 4;
    
    const punctuationCount = (prompt.match(/[.!?]/g) || []).length;
    if (punctuationCount > 0) score += 3;
    
    const words = prompt.split(' ').length;
    if (words > 20) score += 3;
    else if (words > 10) score += 1;
    
    return Math.min(score, 12);
  }

  calculateContextScore(prompt) {
    let score = 0;
    if (prompt.length > 10) score += 2;
    
    const objectiveWords = ['objetivo', 'meta', 'finalidade', 'propósito', 'quero', 'preciso'];
    const hasObjective = objectiveWords.some(word => prompt.toLowerCase().includes(word));
    if (hasObjective) score += 3;
    
    return Math.min(score, 8);
  }

  calculateFormatScore(prompt) {
    let score = 0;
    if (prompt.length > 10) score += 1;
    
    const formatWords = ['artigo', 'redação', 'lista', 'tabela', 'gráfico', 'resumo'];
    const hasFormat = formatWords.some(word => prompt.toLowerCase().includes(word));
    if (hasFormat) score += 3;
    
    return Math.min(score, 4);
  }

  calculateAmbiguityScore(prompt) {
    let score = 2;
    
    const ambiguousWords = ['coisa', 'algo', 'qualquer coisa', 'talvez'];
    const ambiguousCount = ambiguousWords.filter(word => prompt.toLowerCase().includes(word)).length;
    score -= ambiguousCount * 1;
    
    if (prompt.length > 20 && ambiguousCount === 0) {
      score += 2;
    }
    
    return Math.max(score, 1);
  }

  calculateObjectivityScore(prompt) {
    let score = 0;
    if (prompt.length > 10) score += 2;
    
    const actionVerbs = ['resuma', 'faça', 'crie', 'escreva', 'explique', 'descreva', 'analise'];
    const foundVerbs = actionVerbs.filter(verb => prompt.toLowerCase().includes(verb));
    if (foundVerbs.length > 0) {
      score += Math.min(foundVerbs.length * 2, 8);
    }
    
    return Math.min(score, 12);
  }

  calculateFormalStructureScore(prompt) {
    let score = 0;
    if (prompt.length > 20) score += 1;
    
    const structureWords = ['contexto', 'tarefa', 'restrições', 'formato', 'objetivo', 'meta'];
    const foundWords = structureWords.filter(word => prompt.toLowerCase().includes(word));
    score += foundWords.length;
    
    if (foundWords.length >= 3) score += 2;
    
    return Math.min(score, 6);
  }

  calculateIntentionScore(prompt) {
    let score = 0;
    if (prompt.length > 20) score += 1;
    
    const intentionWords = ['para estudo', 'para trabalho', 'para mim', 'pessoal', 'profissional'];
    const foundWords = intentionWords.filter(word => prompt.toLowerCase().includes(word));
    if (foundWords.length > 0) {
      score += Math.min(foundWords.length, 3);
    }
    
    return Math.min(score, 3);
  }

  generateScoreComment(score) {
    if (score >= 90) {
      return "Excelente! Seu prompt está muito bem estruturado e específico.";
    } else if (score >= 80) {
      return "Muito bom! Seu prompt tem boa qualidade com pequenos ajustes possíveis.";
    } else if (score >= 70) {
      return "Bom! Seu prompt está bem, mas pode ser mais específico.";
    } else if (score >= 60) {
      return "Regular. Tente ser mais claro e específico em suas solicitações.";
    } else if (score >= 50) {
      return "Precisa melhorar. Adicione mais detalhes e seja mais específico.";
    } else {
      return "Muito básico. Tente reformular com mais clareza e especificidade.";
    }
  }
  */
}

// Inicializar a janela flutuante quando o script for carregado
const promptIQWindow = new PromptIQFloatingWindow();
