import React, { useState } from 'react';

const TextGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(250);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setGeneratedText('');
    setCopied(false);

    try {
      const response = await fetch('/api/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          temperature: parseFloat(temperature),
          max_new_tokens: parseInt(maxTokens),
          model: 'meta-llama/Llama-3.2-1B-Instruct'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate text');
      }

      setGeneratedText(data.generated_text || '');
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setGeneratedText('');
    setError('');
  };

  return (
    <div className="generator-container">
      <div className="generator-card">
        <h2>AI Text Generator</h2>
        <p className="subtitle">Powered by Llama 3.2 1B Instruct</p>

        <div className="input-section">
          <label htmlFor="prompt">Your Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt here..."
            rows="5"
          />
        </div>

        <div className="parameters-section">
          <div className="param-group">
            <label htmlFor="temperature">Temperature: {temperature}</label>
            <input
              type="range"
              id="temperature"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </div>
          <div className="param-group">
            <label htmlFor="maxTokens">Max Tokens: {maxTokens}</label>
            <input
              type="number"
              id="maxTokens"
              min="10"
              max="1024"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
            />
          </div>
        </div>

        <div className="actions">
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
          >
            {loading ? <span className="spinner"></span> : 'Generate Text'}
          </button>
          <button className="clear-btn" onClick={handleClear} disabled={loading}>
            Clear
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className={`output-section ${generatedText ? 'visible' : ''}`}>
          <div className="output-header">
            <h3>Generated Response</h3>
            <button className="copy-btn" onClick={handleCopy} disabled={!generatedText}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="output-content">
            {generatedText ? (
              <p>{generatedText}</p>
            ) : (
              <p className="placeholder-text">Output will appear here...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextGenerator;
