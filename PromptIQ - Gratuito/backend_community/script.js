import Cerebras from '@cerebras/cerebras_cloud_sdk/index.mjs';
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const cerebras = new Cerebras({
  apiKey: process.env['CEREBRAS_API_KEY']
});

app.get('/health', async (req, res) => {
  try {
    const prompt = req.query.parametro;
    
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt não fornecido" });
    }

    console.log(`🔍 Iniciando análise - UMA requisição à API Cerebras`);
    console.log(`📝 Prompt: "${prompt}"`);
    
    // ÚNICA requisição à API - tudo em uma chamada
    const response = await cerebras.chat.completions.create({
      messages: [
        {
          "role": "system",
          "content": `Você é um avaliador rigoroso de prompts para IA. Seja crítico e realista na avaliação.

CRITÉRIOS DE PONTUAÇÃO (0-100):
- 90-100: Prompt excepcional (específico, contexto claro, formato definido, objetivo claro)
- 80-89: Muito bom (bem estruturado, mas pode melhorar)
- 70-79: Bom (claro, mas falta especificidade)
- 60-69: Regular (básico, mas funcional)
- 50-59: Fraco (muito genérico, pouco específico)
- 40-49: Ruim (confuso ou muito vago)
- 30-39: Muito ruim (mal estruturado)
- 20-29: Péssimo (quase inútil)
- 10-19: Terrível (incompreensível)
- 0-9: Inaceitável

PENALIZAÇÕES RÍGIDAS:
- Prompts de 1-2 palavras: máximo 20 pontos
- "Me ajude", "Quero", "Preciso" sem contexto: máximo 30 pontos
- Falta de especificidade: -20 pontos
- Sem contexto ou objetivo: -30 pontos
- Linguagem informal excessiva: -10 pontos
- Sem formato de saída definido: -15 pontos

RESUMO: Seja direto e objetivo. Apenas o essencial em 1 frase.

Responda em JSON: {"resumo": "resumo direto em 1 frase", "pontuacao": {"nota": X, "comentario": "explicação crítica da nota"}}`
        },
        {
          "role": "user", 
          "content": `Avalie rigorosamente este prompt: ${prompt}`
        }
      ],
      model: 'llama3.1-8b',
      temperature: 0.1
    });

    console.log(`✅ Requisição única concluída - tokens usados: ${response.usage?.total_tokens || 'N/A'}`);
    
    const respostaJson = JSON.parse(response.choices[0].message.content);
    res.json(respostaJson);
    console.log(`📊 Resultado: ${respostaJson.pontuacao?.nota || 'N/A'} pontos`);
    
  } catch (error) {
    console.error("❌ Erro na análise:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Servidor PromptIQ Community rodando na porta 3000");
  console.log("📡 Usando Cerebras AI para análise de prompts");
});