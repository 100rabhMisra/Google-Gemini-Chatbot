import express from 'express';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Initialize Gemini model
const gemini_api_key = process.env.GEMINI_API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);
const geminiModel = googleAI.getGenerativeModel({
  model: 'gemini-2.5-flash'
});

// Utility function to call Gemini API
const generateGeminiResponse = async (prompt) => {
  try {
    const result = await geminiModel.generateContent({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    });

    const candidates = result.response?.candidates;
    if (
      Array.isArray(candidates) &&
      candidates.length > 0 &&
      candidates[0].content &&
      candidates[0].content.parts &&
      candidates[0].content.parts.length > 0
    ) {
      return candidates[0].content.parts[0].text;
    }
    return "";
  } catch (error) {
    console.error('Gemini API error:', error);
    return "";
  }
};

// Main API route
app.post('/api/content', async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Invalid or empty question.' });
  }
  const result = await generateGeminiResponse(question);
  res.json({ result });
});

// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));
