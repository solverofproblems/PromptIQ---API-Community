function observarCampo() {
  // Não fazer captura em tempo real - apenas log para debug
  const campo = document.querySelector("div[contenteditable='true']");
  if (campo) {
    console.log("Campo do ChatGPT detectado - captura manual disponível");
  }
}

// Verificar se estamos em um contexto válido antes de inicializar
function inicializarExtensao() {
  try {
    // Verificar se chrome.runtime está disponível
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      // Observar mudanças no DOM
      const observer = new MutationObserver(() => observarCampo());
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Rodar uma vez logo de cara
      observarCampo();
      
      console.log("✅ Extensão inicializada com sucesso");
    } else {
      console.warn("⚠️ Chrome runtime não disponível - aguardando...");
      // Tentar novamente em 1 segundo
      setTimeout(inicializarExtensao, 1000);
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar extensão:", error);
    // Tentar novamente em 2 segundos
    setTimeout(inicializarExtensao, 2000);
  }
}

// Inicializar a extensão
inicializarExtensao();
