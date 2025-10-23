import axios from "axios";

let respostaAi = "";

// Sistema de pontuação inteligente via ChatGPT (versão Premium)
// Funções de pontuação offline removidas - agora usamos pontuação inteligente do ChatGPT

// Função para mostrar notificação de texto copiado
function showCopyNotification() {
  // Remover notificação anterior se existir
  const existingNotification = document.querySelector('.copy-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Criar elemento de notificação
  const notification = document.createElement('div');
  notification.className = 'copy-notification';
  notification.innerHTML = '✅ Texto copiado!';
  
  // Adicionar estilos inline para a notificação
  notification.style.cssText = `
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
    z-index: 10000;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
  `;
  
  // Adicionar ao body
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);
  
  // Remover após 2 segundos
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 2000);
}

// Função para limpar a área de resultados
function clearResultsArea() {
  const areaInfo = document.getElementById('areaResultados');
  if (areaInfo) {
    areaInfo.innerHTML = '';
  }
}

// Função para verificar se há texto válido e limpar mensagens de erro
function checkAndClearErrorMessages() {
  const textoAtual = document.getElementById("texto").innerText;
  const areaInfo = document.getElementById('areaResultados');
  
  // Verificar se há texto válido
  const textoValido = textoAtual && 
                     textoAtual.trim() !== "" && 
                     textoAtual !== "Veja como a IA pode dar vida aos seus pedidos!";
  
  // Se há texto válido e existe mensagem de erro, limpar
  if (textoValido && areaInfo) {
    const errorMessage = areaInfo.querySelector('.without-question');
    if (errorMessage) {
      areaInfo.innerHTML = '';
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  chrome.storage.local.get("ultimoTexto", async (data) => {
    let inputUsuario = data.ultimoTexto || "Veja como a IA pode dar vida aos seus pedidos!";
    document.getElementById("texto").innerText = inputUsuario;
    const areaInfo = document.getElementById('areaResultados');
    console.log(inputUsuario);
    
    // Verificar e limpar mensagens de erro se houver texto válido
    checkAndClearErrorMessages();

    // Observar mudanças no texto para limpar mensagens de erro automaticamente
    const textElement = document.getElementById("texto");
    if (textElement) {
      const observer = new MutationObserver(() => {
        checkAndClearErrorMessages();
      });
      
      observer.observe(textElement, { 
        childList: true, 
        characterData: true, 
        subtree: true 
      });
    }

    document.getElementById('btn-avaliar').addEventListener('click', () => {

      // Buscar o texto atual do elemento DOM (que pode ter sido atualizado pela captura)
      const textoAtual = document.getElementById("texto").innerText;
      
      // Verificar se há texto válido (não vazio, não apenas espaços, e não é o texto padrão)
      const textoValido = textoAtual && 
                         textoAtual.trim() !== "" && 
                         textoAtual !== "Veja como a IA pode dar vida aos seus pedidos!";

      if (textoValido) {

        chrome.storage.local.get('ultimoTexto', async (data) => {
          let avaliarPergunta = data.ultimoTexto;

          // Verificar novamente se o texto do storage é válido
          if (!avaliarPergunta || avaliarPergunta.trim() === "" || avaliarPergunta === "Veja como a IA pode dar vida aos seus pedidos!") {
            areaInfo.innerHTML = `
              <div class="without-question">
                <p>Digite uma pergunta primeiro!</p>
              </div>
            `;
            return;
          }

          console.log(avaliarPergunta);

          // Mostrar tela de carregamento
          areaInfo.innerHTML = `
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <div class="loading-text">Analisando seu prompt...</div>
              <div class="loading-subtext">Conectando com IA e processando dados</div>
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
              const subtextElement = areaInfo.querySelector('.loading-subtext');
              if (subtextElement) {
                subtextElement.textContent = loadingMessages[messageIndex];
              }
              messageIndex++;
            }
          }, 500);

          axios({
            method: 'get',
            url: 'http://localhost:3000/health',
            params: {
              parametro: avaliarPergunta
            }
          })
            .then(function (response) {
              const elapsedTime = Date.now() - startTime;
              const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
              
              // Aguardar o tempo restante para completar o tempo mínimo
              setTimeout(() => {
                // Limpar intervalo das mensagens
                clearInterval(messageInterval);
                
                respostaAi = response.data;

                if (respostaAi) {

                  areaInfo.innerHTML = `
                  
                    <div class="container-fix results-fade-in">
                      <div class="resume-text-user">
                        <h1>Resumo:</h1>
                        <p id="resumo"></p>
                      </div>

                      <div class="level-prompt">
                        <h1>Sua pontuação:</h1>
                        <p id="pontuacao">40</p>
                        <p id="comentario-comparativo"></p>
                      </div> 
                    </div>

                  `

                  //Aqui estamos levando um breve resuminho do prompt.
                  document.getElementById('resumo').innerText = respostaAi.resumo;

                  //Aqui é a sessão que exibe a pontuação inteligente do Cerebras
                  const aiScore = respostaAi.pontuacao.nota;
                  const aiComment = respostaAi.pontuacao.comentario;
                  
                  document.getElementById('pontuacao').innerText = aiScore;
                  document.getElementById('comentario-comparativo').innerText = aiComment;

                }
              }, remainingTime); // Fechar o setTimeout
            });

        })
      } else {
        areaInfo.innerHTML = `
          
            <div class="without-question">
              <p>Digite uma pergunta primeiro!</p>
            </div>
          
          `
      }
    });

  });


});


//Captura o que o usuário digitou e, com o botão de "avaliar", manda pro backend.

// let texto_digitado = '';

// document.getElementById('btn-avaliar').addEventListener("click", () => {
//   texto_digitado = document.getElementById('texto').value;

//   //Função que realiza a comunicação do backend com o frontend.


//   async function apiAvaliacao(text) {

//     console.log(text);

//     axios({
//       method: 'get',
//       url: 'http://localhost:3000/checarPrompt',
//       params: {
//         parametro: text
//       }
//     })
//       .then(function (response) {
//         console.log(response);
//       });

//   }

//   apiAvaliacao(texto_digitado);

// });



//Função que realiza a comunicação do backend com o frontend.
// async function apiAvaliacao(text) {

//   console.log(text);

//   axios({
//     method: 'get',
//     url: 'http://localhost:3000/checarPrompt',
//     params: {
//       parametro: text
//     }
//   })
//     .then(function (response) {
//       console.log(response);
//     });

// }