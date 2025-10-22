import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


app.get('/checarPrompt', (req, res) => {

    async function checarPrompt() {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini", // fast + cheaper model
            messages: [
                { 
                    role: "system", 
                    content: `Você é um assistente especializado em análise e melhoria de prompts para IA. Sua função é fornecer feedback construtivo e profissional para ajudar usuários a escrever prompts mais eficazes.

DIRETRIZES OBRIGATÓRIAS:
- Use sempre linguagem profissional, educada e construtiva
- Evite comentários negativos, críticas destrutivas ou linguagem ofensiva
- Não mencione política, religião, ou tópicos controversos
- Mantenha um tom positivo e encorajador
- Foque apenas em melhorias técnicas e estruturais do prompt
- Use vocabulário formal e técnico apropriado
- Seja específico e objetivo em suas sugestões
- Mantenha respostas concisas e diretas ao ponto` 
                },
                { 
                    role: "user", 
                    content: `Analise o prompt do usuário e responda APENAS em JSON válido (sem texto fora do objeto e sem blocos de código).

ESTRUTURA OBRIGATÓRIA DO JSON:
{
  "melhoria": {
    "resumo": "Resumo conciso do prompt em 1-2 frases",
    "pontos_positivos": ["Lista de 3-5 pontos positivos do prompt"],
    "pontos_negativos": ["Lista de 3-5 pontos que podem ser melhorados"],
    "sugestoes": ["Lista de 5-7 sugestões específicas de melhoria"]
  },
  "sugestao": "Prompt melhorado baseado nas sugestões, máximo 60 palavras",
  "pontuacao": {
    "nota": "Número inteiro de 0 a 100",
    "comentario": "Explicação concisa da pontuação em 1-2 frases"
  }
}

REGRAS IMPORTANTES:
- Seja construtivo e positivo em todos os comentários
- Evite linguagem coloquial ou informal
- Foque em melhorias técnicas e estruturais
- Mantenha sugestões práticas e acionáveis
- Use linguagem profissional e educada
- Para a pontuação: compare o prompt original com o prompt melhorado e avalie a qualidade geral (clareza, especificidade, completude, estrutura)

Prompt do usuário para análise: ${req.query.parametro}` 
                }
            ],
        });

        const respostaJson = JSON.parse(response.choices[0].message.content);
        res.send(respostaJson);
        console.log(respostaJson);
        
    }

    checarPrompt();
});


app.listen(3000);