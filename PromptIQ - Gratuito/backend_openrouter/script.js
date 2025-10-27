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
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
            {
            "role": "system",
            "content": `Avalie este prompt de forma rigorosa. Responda no MESMO idioma do prompt, ou seja, se for em português, responda em português, e assim por diante.

CRÍTICO: Forneça uma resposta clara e objetiva, além de gramaticalmente correta e direta.

PONTUAÇÃO RIGOROSA (0-100):
- 90-100: Excepcional (específico, contexto detalhado, objetivos claros)
- 80-89: Muito bom (bem estruturado e específico)
- 70-79: Bom (claro mas falta especificidade)
- 60-69: Regular (básico, genérico, falta detalhes)
- 50-59: Fraco (genérico, contexto mínimo)
- 40-49: Ruim (vago, confuso)
- 30-39: Muito ruim (mal estruturado)
- 20-29: Terrível (quase inútil)
- 10-19: Péssimo (incompreensível)
- 0-9: Inaceitável

FORMATO (JSON apenas):
{"resumo": "Uma frase sobre o prompt no mesmo idioma", "pontuacao": {"nota": X, "comentario": "Explicação da pontuação no mesmo idioma (max 2 frases)"}}`
          },
          {
            "role": "user", 
            "content": `Avalie e responda no MESMO idioma do prompt. Sobre a resposta, responda de forma clara e objetiva, além de gramaticalmente correta, evitando falhas de escrita.

Prompt: ${prompt}`
          }
        ],
        temperature: 0.0
    })
});

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
    }

    console.log(`✅ Requisição única concluída - modelo: mistralai/mistral-7b-instruct:free`);
    
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