# PromptIQ Community Backend

Backend simplificado do PromptIQ usando Cerebras AI para análise de prompts.

## 🚀 Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
CEREBRAS_API_KEY=sua_chave_cerebras_aqui
```

### 3. Iniciar o servidor
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📡 Endpoints

### GET /health
Analisa um prompt e retorna resumo e pontuação.

**Parâmetros:**
- `parametro`: O prompt a ser analisado

**Resposta:**
```json
{
  "resumo": "Resumo do prompt em 1-2 frases",
  "pontuacao": {
    "nota": 85,
    "comentario": "Explicação da pontuação"
  }
}
```

## 🔧 Tecnologias

- **Node.js** + **Express**
- **Cerebras AI** (modelo llama3.1-8b)
- **CORS** para cross-origin requests

## 📊 Sistema de Pontuação Rigoroso

### Critérios de Avaliação (0-100):
- **90-100**: Prompt excepcional (específico, contexto claro, formato definido)
- **80-89**: Muito bom (bem estruturado, mas pode melhorar)
- **70-79**: Bom (claro, mas falta especificidade)
- **60-69**: Regular (básico, mas funcional)
- **50-59**: Fraco (muito genérico, pouco específico)
- **40-49**: Ruim (confuso ou muito vago)
- **30-39**: Muito ruim (mal estruturado)
- **20-29**: Péssimo (quase inútil)
- **10-19**: Terrível (incompreensível)
- **0-9**: Inaceitável

### Penalizações Rígidas:
- Prompts de 1-2 palavras: **máximo 20 pontos**
- "Me ajude", "Quero", "Preciso" sem contexto: **máximo 30 pontos**
- Falta de especificidade: **-20 pontos**
- Sem contexto ou objetivo: **-30 pontos**
- Linguagem informal excessiva: **-10 pontos**
- Sem formato de saída definido: **-15 pontos**

## ⚡ Eficiência Máxima

### ✅ Uma Única Requisição
- **Resumo + Pontuação** em uma única chamada à API
- **Zero requisições desnecessárias**
- **Máxima velocidade** de resposta
- **Mínimo uso de tokens**

### 📊 Monitoramento
- Logs detalhados de cada requisição
- Contagem de tokens utilizados
- Tempo de resposta otimizado
- Zero desperdício de recursos

## 📝 Diferenças da versão original

- ✅ **Sem custos**: Usa Cerebras AI (gratuito)
- ✅ **Ultra simplificado**: Apenas resumo e pontuação
- ✅ **Mais rápido**: Menos processamento de dados
- ✅ **Economia**: Substitui OpenAI por Cerebras
- ✅ **Requisição simples**: Prompt direto e conciso
- ✅ **Pontuação rigorosa**: Sistema crítico e realista (0-100)
- ✅ **Resumo direto**: Apenas o essencial em 1 frase
- ✅ **Máxima eficiência**: Apenas UMA requisição à API
- ✅ **Zero desperdício**: Resumo + Pontuação em uma única chamada
