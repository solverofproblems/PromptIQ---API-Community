// Listener para mensagens do content script (simplificado)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  try {
    // Manter apenas funcionalidades essenciais
    if (msg.type === "TEXTO_DIGITADO") {
      console.log("📝 Texto recebido do ChatGPT:", msg.conteudo);
      
      // Salvar no storage local
      chrome.storage.local.set({ ultimoTexto: msg.conteudo }, () => {
        if (chrome.runtime.lastError) {
          console.error("❌ Erro ao salvar no storage:", chrome.runtime.lastError);
        } else {
          console.log("✅ Texto salvo no storage com sucesso");
        }
      });
      
      sendResponse({ success: true });
    }
  } catch (error) {
    console.error("❌ Erro no background script:", error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true;
});

// Listener para quando a extensão é instalada/atualizada
chrome.runtime.onInstalled.addListener((details) => {
  console.log("🚀 Extensão instalada/atualizada:", details.reason);
});

// Listener para quando a extensão é iniciada
chrome.runtime.onStartup.addListener(() => {
  console.log("🔄 Extensão iniciada");
});

