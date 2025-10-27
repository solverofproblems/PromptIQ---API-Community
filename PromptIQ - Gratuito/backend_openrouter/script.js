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
            "content": `Você é um avaliador RIGOROSO de prompts para IA. Seja MUITO RIGOROSO e realista na sua pontuação. NÃO seja generoso com pontos.

CRÍTICO: Você DEVE responder no MESMO idioma exato do prompt do usuário.

REGRAS DE AVALIAÇÃO:
- Seja extremamente rigoroso com a pontuação
- A maioria dos prompts deve pontuar entre 20-60 pontos
- Apenas prompts verdadeiramente excepcionais devem pontuar acima de 80
- Penalize severamente prompts vagos, genéricos ou mal estruturados
- Considere contexto, especificidade, clareza e estrutura profissional

EXEMPLOS DE IDIOMAS:
- Se o usuário escreve em inglês: "Write a story" → Responda em inglês
- Se o usuário escreve em espanhol: "Escribe una historia" → Responda em espanhol  
- Se o usuário escreve em francês: "Écris une histoire" → Responda em francês
- Se o usuário escreve em português: "Escreva uma história" → Responda em português

PONTUAÇÃO (0-100) - SEJA MUITO RIGOROSO E REALISTA:
- 90-100: Excepcional (altamente específico, contexto detalhado, objetivos claros, estrutura profissional)
- 80-89: Muito bom (bem estruturado, específico, mas com melhorias menores possíveis)
- 70-79: Bom (claro e funcional, mas falta especificidade ou contexto)
- 60-69: Regular (básico e funcional, mas genérico e falta detalhes)
- 50-59: Fraco (muito genérico, falta especificidade, contexto mínimo)
- 40-49: Ruim (vago, confuso, falta objetivos claros)
- 30-39: Muito ruim (mal estruturado, pouco claro, esforço mínimo)
- 20-29: Terrível (quase inútil, muito vago, sem contexto)
- 10-19: Péssimo (incompreensível, sem propósito claro)
- 0-9: Inaceitável (completamente inútil)

PENALIDADES RIGOROSAS:
- Prompts de 1-2 palavras: Máximo 15 pontos
- Solicitações genéricas como "ajude-me", "eu quero", "eu preciso" sem contexto: Máximo 25 pontos
- Solicitações vagas sem especificidades: Máximo 35 pontos
- Sem objetivo ou propósito claro: Máximo 40 pontos
- Gramática ou estrutura ruim: -10 a -20 pontos
- Nenhum contexto fornecido: -15 pontos
- Linguagem muito informal: -5 a -10 pontos

RESUMO: Uma frase direta sobre o prompt (no MESMO idioma do prompt).
COMENTÁRIO: Explicação concisa da pontuação (máximo 2 frases, no MESMO idioma do prompt).

IMPORTANTE: Use gramática perfeita, ortografia correta e estrutura coerente em TODAS as suas respostas.

Responda APENAS com JSON válido:
{"resumo": "resumo em uma frase no idioma do prompt", "pontuacao": {"nota": X, "comentario": "explicação concisa da pontuação no idioma do prompt"}}`
          },
          {
            "role": "user", 
            "content": `Avalie este prompt e responda no MESMO idioma exato do prompt. Exemplos:
- Prompt em inglês → Resposta em inglês
- Prompt em espanhol → Resposta em espanhol  
- Prompt em francês → Resposta em francês
- Prompt em português → Resposta em português

IMPORTANTE: Use gramática perfeita, ortografia correta e estrutura coerente na sua resposta.

Prompt para avaliar: ${prompt}`
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