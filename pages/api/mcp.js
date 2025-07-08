import fetch from 'node-fetch';
const {
  AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_KEY,
  AZURE_OPENAI_DEPLOYMENT_NAME
} = process.env;


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const MCP_SERVER_URL = 'https://learn.microsoft.com/api/mcp';

  const enhancedQuestion = `Please provide a comprehensive and detailed explanation about: ${message}. Include practical examples, best practices, and step-by-step guidance where applicable.`;

  const mcpPayload = {
    "jsonrpc": "2.0",
    "id": `chat-${Date.now()}`,
    "method": "tools/call",
    "params": {
      "name": "microsoft_docs_search",
      "arguments": {
        "question": enhancedQuestion
      }
    }
  };

  try {
    // Step 1: Call MCP Server
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
    const lines = responseText.split('\n').filter(line => line.trim() !== '');
    const dataLine = lines.find(line => line.trim().startsWith('data:') && line.includes('"jsonrpc"'));

    if (!dataLine) {
      console.error("Could not find JSON-RPC response in SSE stream:", responseText);
      throw new Error('Invalid response format from server.');
    }

    const jsonString = dataLine.substring(5).trim();
    const responseData = JSON.parse(jsonString);

    if (responseData.error) {
      console.error('MCP JSON-RPC Error:', responseData.error);
      throw new Error(`MCP error: ${responseData.error.message}`);
    }

    const toolResult = responseData.result;
    const retrievedText = toolResult.content
      .filter(part => part.type === 'text' && part.text)
      .map(part => part.text)
      .join('\n\n');

    if (!retrievedText.trim()) {
      return res.status(200).json({ reply: "I found some documentation, but it didn't contain any readable text to analyze." });
    }

    // Step 2: Call External AI Model for Summarization -Alternative Approach
    // const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer sk-proj-xxxxx`, // Replace with your API key
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4', // Use the appropriate model
    //     messages: [
    //       { role: 'system', content: 'You are an expert assistant. Synthesize helpful answers based on the provided context.' },
    //       { role: 'user', content: `Context:\n${retrievedText}\n\nQuestion:\n${message}` }
    //     ],
    //     max_tokens: 500,
    //     temperature: 0.7,
    //   }),
    // });

    // if (!aiResponse.ok) {
    //   const errorText = await aiResponse.text();
    //   console.error('AI Model Error:', errorText);
    //   throw new Error('Failed to get a response from the AI model.');
    // }
  const azureUrl = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2025-01-01-preview`;

  const aiResponse = await fetch(azureUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': AZURE_OPENAI_KEY
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are an expert assistant. Synthesize helpful answers based on the provided context.' },
        { role: 'user', content: `Context:\n${retrievedText}\n\nQuestion:\n${message}` }
      ],
      max_tokens: 500,
      temperature: 0.7
    }),
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    console.error('Azure OpenAI Error:', errorText);
    throw new Error('Failed to get a response from Azure OpenAI.');
  }

    const aiResponseData = await aiResponse.json();
    const synthesizedAnswer = aiResponseData.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    // Step 3: Send the Synthesized Answer Back to the Frontend
    res.status(200).json({ reply: synthesizedAnswer });

  } catch (error) {
    console.error('Error contacting MCP server or AI model:', error);
    res.status(500).json({ error: 'Failed to process the request.' });
  }
}