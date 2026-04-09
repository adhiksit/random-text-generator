export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, model, max_new_tokens, temperature, top_p } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const modelName = model || 'meta-llama/Llama-3.2-1B-Instruct';

  try {
    // Vercel environment variables
    const hfToken = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN;
    
    if (!hfToken) {
      return res.status(500).json({ error: 'Hugging Face API token is not configured on the server.' });
    }

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        max_tokens: max_new_tokens || 250,
        temperature: temperature || 0.7,
        top_p: top_p || 0.9
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Hugging Face API returned status ${response.status}`);
    }

    let generatedText = '';
    if (data.choices && data.choices.length > 0) {
      generatedText = data.choices[0].message.content;
    } else {
      generatedText = JSON.stringify(data);
    }

    res.status(200).json({ generated_text: generatedText });

  } catch (error) {
    console.error('Text Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate text.', details: error.message });
  }
}
