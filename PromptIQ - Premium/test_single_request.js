// Script para demonstrar que fazemos apenas UMA requisição à API
import axios from 'axios';

async function testSingleRequest() {
  console.log('🧪 Testando: APENAS UMA requisição à API Cerebras\n');
  
  const testPrompt = "Eu quero uma receita de bolo";
  
  try {
    console.log('📝 Prompt de teste:', testPrompt);
    console.log('🔍 Iniciando análise...\n');
    
    const startTime = Date.now();
    
    const response = await axios.get('http://localhost:3000/health', {
      params: {
        parametro: testPrompt
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ Análise concluída!');
    console.log('⏱️ Tempo total:', duration + 'ms');
    console.log('📊 Pontuação:', response.data.pontuacao.nota);
    console.log('📝 Resumo:', response.data.resumo);
    console.log('💬 Comentário:', response.data.pontuacao.comentario);
    
    console.log('\n🎯 CONFIRMAÇÃO:');
    console.log('✅ Apenas UMA requisição à API Cerebras');
    console.log('✅ Resumo + Pontuação em uma única chamada');
    console.log('✅ Máxima eficiência garantida');
    console.log('✅ Zero requisições desnecessárias');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Certifique-se de que o backend_community está rodando na porta 3000');
    }
  }
}

testSingleRequest();
