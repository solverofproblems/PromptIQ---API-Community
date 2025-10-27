import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const prompt = req.query.parametro;
    
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt não fornecido" });
    }

    console.log(`🔍 Iniciando análise - UMA requisição à API OpenRouter`);
    console.log(`📝 Prompt: "${prompt}"`);
    
    // ÚNICA requisição à API - tudo em uma chamada
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        model: "tngtech/deepseek-r1t2-chimera:free",
        messages: [
            {
            "role": "system",
            "content": `Você avalia prompts para IA.

REGRAS:
1. Responda no MESMO idioma do prompt
2. Use gramática correta
3. Seja objetivo e claro

PONTUAÇÃO:
- 90-100: Excelente (muito específico e detalhado)
- 80-89: Muito bom (bem feito)
- 70-79: Bom (funciona, mas pode melhorar)
- 60-69: Regular (básico demais)
- 50-59: Fraco (genérico)
- 40-49: Ruim (confuso)
- 30-39: Muito ruim
- 20-29: Terrível
- 10-19: Péssimo
- 0-9: Muito ruim

IMPORTANTE: Retorne APENAS um JSON válido, sem texto adicional.

FORMATO:
{
  "resumo": "frase sobre o prompt no mesmo idioma",
  "pontuacao": {
    "nota": número_entre_0_e_100,
    "comentario": "explicação no mesmo idioma, máximo 2 frases"
  }
}

EXEMPLO:
"Quero um bolo" → {
  "resumo": "Solicitação genérica de receita sem especificações",
  "pontuacao": {
    "nota": 18,
    "comentario": "Prompt muito vago, não especifica tipo de bolo, tamanho ou ingredientes preferidos"
  }
}`
          },
          {
            "role": "user", 
            "content": `Avalie este prompt:

${prompt}

Responda no mesmo idioma do prompt.`
          }
        ],
        temperature: 0.5
    })
});

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
    }

    console.log(`✅ Requisição única concluída - modelo: tngtech/deepseek-r1t2-chimera:free`);
    
    // Extrair e limpar o conteúdo da resposta
    let content = data.choices[0].message.content;
    
    // Limpeza robusta do JSON
    content = content.trim();
    
    // Remover markdown se presente
    if (content.includes('```json')) {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        content = jsonMatch[1].trim();
      }
    } else if (content.includes('```')) {
      const jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        content = jsonMatch[1].trim();
      }
    }
    
    // Encontrar o JSON válido
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      content = content.substring(jsonStart, jsonEnd + 1);
    }
    
    // Limpeza final
    content = content.replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim();
    content = content.replace(/[^\x20-\x7E]/g, '');
    
    let respostaJson;
    try {
      respostaJson = JSON.parse(content);
      console.log("✅ JSON parseado com sucesso");
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse do JSON:", parseError);
      console.log("📝 Conteúdo problemático:", content);
      
      // Criar resposta de fallback rigorosa
      const promptLength = prompt.length;
      let fallbackScore = Math.max(5, Math.min(35, promptLength * 1.5));
      let fallbackComment = "Prompt básico sem especificações adequadas";
      
      if (promptLength < 10) {
        fallbackScore = 8;
        fallbackComment = "Prompt muito curto e vago - pontuação baixa";
      } else if (promptLength < 30) {
        fallbackScore = 18;
        fallbackComment = "Prompt curto, precisa de mais detalhes e contexto";
      } else if (promptLength < 50) {
        fallbackScore = 28;
        fallbackComment = "Prompt básico, mas falta especificidade";
      }
      
      respostaJson = {
        resumo: "Análise básica realizada com base no comprimento do prompt",
        pontuacao: {
          nota: fallbackScore,
          comentario: fallbackComment
        }
      };
    }
    
    // Garantir que a resposta tenha a estrutura correta
    const finalResponse = {
      resumo: respostaJson.resumo || "Análise não disponível no momento",
      pontuacao: {
        nota: respostaJson.pontuacao?.nota || 0,
        comentario: respostaJson.pontuacao?.comentario || "Comentário não disponível no momento"
      }
    };
    
    res.json(finalResponse);
    console.log(`📊 Resultado: ${finalResponse.pontuacao.nota} pontos`);
    
  } catch (error) {
    console.error("❌ Erro na análise:", error);
    
    // Detectar limites da API (mesmo sendo ilimitada, manter para consistência)
    if (error.message && (
      error.message.includes('rate limit') ||
      error.message.includes('quota') ||
      error.message.includes('limit') ||
      error.message.includes('exceeded') ||
      error.message.includes('429') ||
      error.message.includes('too many requests')
    )) {
      console.log("🚫 Limite da API atingido");
      return res.status(429).json({ 
        error: "LIMIT_REACHED",
        message: "Limite da API atingido",
        details: "Aguarde alguns minutos antes de tentar novamente.",
        retryAfter: 300 // 5 minutos
      });
    }
    
    // Outros erros
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Servidor PromptIQ OpenRouter rodando na porta 3000");
  console.log("📡 Usando OpenRouter AI (DeepSeek) para análise de prompts");
  console.log("🔥 API ILIMITADA - Sem restrições de uso!");
});