import fetch from 'node-fetch';

// We will now use the Gemini API Key from your environment variables
const { GEMINI_API_KEY } = process.env;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // 1. Call the MCP server to fetch documentation
  const MCP_SERVER_URL = 'https://learn.microsoft.com/api/mcp';
  const enhancedQuestion = `Please provide a comprehensive and detailed explanation about: ${message}. Include practical examples, best practices, and step-by-step guidance where applicable.`;

  const mcpPayload = {
    jsonrpc: "2.0",
    id: `chat-${Date.now()}`,
    method: "tools/call",
    params: {
      name: "microsoft_docs_search",
      arguments: { question: enhancedQuestion }
    }
  };

  try {
    const mcpResponse = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'User-Agent': 'mcp-remote-client',
      },
      body: JSON.stringify(mcpPayload),
    });

    if (!mcpResponse.ok) {
      const errorText = await mcpResponse.text();
      console.error('MCP Server Error:', errorText);
      throw new Error(`MCP Server responded with status: ${mcpResponse.status}`);
    }

    const responseText = await mcpResponse.text();
    const lines = responseText.split('\n').filter(l => l.trim());
    const dataLine = lines.find(l => l.trim().startsWith('data:') && l.includes('"jsonrpc"'));

    if (!dataLine) {
      console.error("Invalid MCP response format:", responseText);
      throw new Error('Invalid response format from MCP server.');
    }

    const responseData = JSON.parse(dataLine.substring(5).trim());
    if (responseData.error) {
      console.error('MCP JSON-RPC Error:', responseData.error);
      throw new Error(`MCP error: ${responseData.error.message}`);
    }

    // 2. Extract and combine plain text parts
    const toolResult = responseData.result;
    const retrievedText = toolResult.content
      .filter(p => p.type === 'text' && p.text)
      .map(p => p.text)
      .join('\n\n');

    if (!retrievedText.trim()) {
      return res.status(200).json({
        reply: "I found some documentation, but it didn't contain any readable text to analyze."
      });
    }

    // 3. Call Google Gemini with an API Key
    // Note the new endpoint and how the API key is passed in the URL
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    // The payload is structured for the Generative Language API
    const geminiPayload = {
      "contents": [
        {
          "role": "user",
          "parts": [
            {
              "text": `You are an expert assistant. Synthesize a helpful answer based on the provided context.\n\nContext:\n${retrievedText}\n\nQuestion:\n${message}`
            }
          ]
        }
      ],
      "generationConfig": {
        "temperature": 0.7,
        "maxOutputTokens": 800 // Increased token limit slightly for better answers
      }
    };

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload)
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API Error:', errorText);
      throw new Error('Failed to get a response from Gemini API.');
    }

    const geminiData = await geminiResponse.json();
    const synthesizedAnswer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
      || "I'm sorry, I couldn't generate a response.";

    // 4. Return the synthesized answer
    res.status(200).json({ reply: synthesizedAnswer });

  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({ error: 'Failed to process the request.' });
  }
}