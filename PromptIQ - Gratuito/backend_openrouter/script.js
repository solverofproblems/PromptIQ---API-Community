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
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
          {
            "role": "system",
            "content": `Você é um avaliador de prompts para IA. Avalie rigorosamente e seja direto.

REGRA OBRIGATÓRIA: 
- Se o prompt estiver em INGLÊS, responda em INGLÊS
- Se o prompt estiver em ESPANHOL, responda em ESPANHOL  
- Se o prompt estiver em FRANCÊS, responda em FRANCÊS
- Se o prompt estiver em PORTUGUÊS, responda em PORTUGUÊS
- Se o prompt estiver em OUTRO IDIOMA, responda no MESMO idioma

PONTUAÇÃO (0-100):
- 90-100: Excepcional (específico, claro, objetivo)
- 80-89: Muito bom (bem estruturado)
- 70-79: Bom (claro, mas pode melhorar)
- 60-69: Regular (básico, funcional)
- 50-59: Fraco (genérico, pouco específico)
- 40-49: Ruim (confuso ou vago)
- 30-39: Muito ruim (mal estruturado)
- 20-29: Péssimo (quase inútil)
- 10-19: Terrível (incompreensível)
- 0-9: Inaceitável

RESUMO: Uma frase direta sobre o prompt (OBRIGATORIAMENTE no mesmo idioma do prompt).
COMENTÁRIO: Explicação concisa da nota (máximo 2 frases, OBRIGATORIAMENTE no mesmo idioma).

Responda APENAS com JSON válido:
{"resumo": "resumo em uma frase no idioma do prompt", "pontuacao": {"nota": X, "comentario": "explicação concisa da nota no mesmo idioma"}}`
          },
          {
            "role": "user", 
            "content": `Avalie rigorosamente este prompt e responda no MESMO idioma do prompt: ${prompt}`
          }
        ],
        temperature: 0.1
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
    }

    console.log(`✅ Requisição única concluída - modelo: deepseek/deepseek-chat-v3.1:free`);
    
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
      
      // Criar resposta de fallback simples
      const promptLength = prompt.length;
      let fallbackScore = Math.max(10, Math.min(50, promptLength * 2));
      let fallbackComment = "Prompt básico sem especificações adequadas";
      
      if (promptLength < 10) {
        fallbackScore = 15;
        fallbackComment = "Prompt muito curto e vago";
      } else if (promptLength < 30) {
        fallbackScore = 25;
        fallbackComment = "Prompt curto, precisa de mais detalhes";
      }
      
      respostaJson = {
        resumo: "Análise básica do prompt",
        pontuacao: {
          nota: fallbackScore,
          comentario: fallbackComment
        }
      };
    }
    
    // Garantir que a resposta tenha a estrutura correta
    const finalResponse = {
      resumo: respostaJson.resumo || "Análise não disponível",
      pontuacao: {
        nota: respostaJson.pontuacao?.nota || 0,
        comentario: respostaJson.pontuacao?.comentario || "Comentário não disponível"
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