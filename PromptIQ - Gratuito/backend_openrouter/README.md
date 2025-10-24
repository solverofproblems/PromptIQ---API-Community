# PromptIQ OpenRouter Backend

Backend do PromptIQ usando OpenRouter AI com DeepSeek para análise de prompts - **API ILIMITADA**.

## 🚀 Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
OPENROUTER_API=sua_chave_openrouter_aqui
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
- **OpenRouter AI** (modelo deepseek/deepseek-chat-v3.1:free)
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

## 🔥 Vantagens da API OpenRouter

### ✅ API Ilimitada
- **Sem limites de uso** (diferente de APIs comunitárias)
- **Modelo DeepSeek** de alta qualidade
- **Performance consistente** 24/7
- **Disponibilidade garantida**

### ✅ Modelo DeepSeek
- **deepseek/deepseek-chat-v3.1:free** - Modelo gratuito
- **Alta qualidade** de análise
- **Respostas consistentes** e precisas
- **Suporte completo** a português

## 📝 Diferenças da Versão Community

- ✅ **API ilimitada**: Sem restrições de uso
- ✅ **Modelo premium**: DeepSeek de alta qualidade
- ✅ **Performance superior**: Respostas mais consistentes
- ✅ **Disponibilidade**: 24/7 sem interrupções
- ✅ **Mesma funcionalidade**: Sistema rigoroso mantido

## 🔗 Links Úteis

- **OpenRouter**: https://openrouter.ai/
- **DeepSeek**: https://www.deepseek.com/
- **Documentação**: https://openrouter.ai/docs

## 📞 Suporte

Para dúvidas, sugestões ou problemas:
- **GitHub Issues**: Abra uma issue no repositório
- **Email**: contato@messier.com.br
- **Website**: https://messier.com.br

---

**PromptIQ OpenRouter** - Análise inteligente de prompts com API ilimitada 🚀
