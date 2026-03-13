const axios = require("axios");

async function analyzeText(text) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are an emotion analysis assistant. Analyze the given text and return ONLY a valid JSON object with emotion, keywords (array), and summary. No additional text. No markdown, no code blocks.",
          },
          {
            role: "user",
            content: `Analyze this journal entry and return JSON: {"emotion": "<emotion>", "keywords": ["keyword1", "keyword2"], "summary": "<brief summary>"}. Text: "${text}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 256,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let content = response.data.choices[0].message.content;
    
    // Clean up any markdown code blocks
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return content;
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    throw new Error(`LLM API Error: ${error.message}`);
  }
}

module.exports = analyzeText;
