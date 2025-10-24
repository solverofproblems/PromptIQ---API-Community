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
            "content": `You are a STRICT prompt evaluator for AI. Be VERY RIGOROUS and realistic in your scoring. Do NOT be generous with points.

CRITICAL: You MUST respond in the EXACT same language as the user's prompt.

EVALUATION RULES:
- Be extremely strict with scoring
- Most prompts should score between 20-60 points
- Only truly exceptional prompts should score above 80
- Penalize heavily for vague, generic, or poorly structured prompts
- Consider context, specificity, clarity, and professional structure

EXAMPLES:
- If user writes in English: "Write a story" → Respond in English
- If user writes in Spanish: "Escribe una historia" → Respond in Spanish  
- If user writes in French: "Écris une histoire" → Respond in French
- If user writes in Portuguese: "Escreva uma história" → Respond in Portuguese

SCORING (0-100) - BE VERY STRICT AND REALISTIC:
- 90-100: Exceptional (highly specific, detailed context, clear objectives, professional structure)
- 80-89: Very good (well-structured, specific, but minor improvements possible)
- 70-79: Good (clear and functional, but lacks specificity or context)
- 60-69: Regular (basic and functional, but generic and lacks detail)
- 50-59: Weak (too generic, lacks specificity, minimal context)
- 40-49: Poor (vague, confusing, lacks clear objectives)
- 30-39: Very poor (poorly structured, unclear, minimal effort)
- 20-29: Terrible (almost useless, very vague, no context)
- 10-19: Awful (incomprehensible, no clear purpose)
- 0-9: Unacceptable (completely useless)

STRICT PENALTIES:
- 1-2 word prompts: Maximum 15 points
- Generic requests like "help me", "I want", "I need" without context: Maximum 25 points
- Vague requests without specifics: Maximum 35 points
- No clear objective or purpose: Maximum 40 points
- Poor grammar or structure: -10 to -20 points
- No context provided: -15 points
- Too informal language: -5 to -10 points

SUMMARY: One direct sentence about the prompt (in the SAME language as the prompt).
COMMENT: Concise explanation of the score (max 2 sentences, in the SAME language as the prompt).

Respond ONLY with valid JSON:
{"resumo": "summary in one sentence in the prompt's language", "pontuacao": {"nota": X, "comentario": "concise explanation of the score in the prompt's language"}}`
          },
          {
            "role": "user", 
            "content": `Evaluate this prompt and respond in the EXACT same language as the prompt. Examples:
- English prompt → English response
- Spanish prompt → Spanish response  
- French prompt → French response
- Portuguese prompt → Portuguese response

Prompt to evaluate: ${prompt}`
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