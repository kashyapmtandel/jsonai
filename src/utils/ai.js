const formatNetworkError = (provider) => (
  `${provider} request failed. Check your API key, internet connection, browser ad-blocker, and Content Security Policy settings.`
);
export const callGemini = async (apiKey, systemPrompt, userMessage) => {
  try {
  // 1. Dynamically fetch available models for this specific API Key
  const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  if (!modelsRes.ok) {
    const err = await modelsRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error during model lookup: ${modelsRes.status}`);
  }
  
  const modelsData = await modelsRes.json();
  const availableModels = modelsData.models || [];
  
  // 2. Find the best available model that supports text generation
  let targetModel = '';
  const supportsGenerate = (m) => m.supportedGenerationMethods?.includes('generateContent');
  
  if (availableModels.some(m => m.name === 'models/gemini-1.5-flash' && supportsGenerate(m))) {
    targetModel = 'models/gemini-1.5-flash';
  } else if (availableModels.some(m => m.name === 'models/gemini-1.5-pro' && supportsGenerate(m))) {
    targetModel = 'models/gemini-1.5-pro';
  } else if (availableModels.some(m => m.name === 'models/gemini-pro' && supportsGenerate(m))) {
    targetModel = 'models/gemini-pro';
  } else {
    // Fallback: pick the first model that supports generateContent
    const fallback = availableModels.find(supportsGenerate);
    if (fallback) {
      targetModel = fallback.name;
    } else {
      throw new Error("Your API key does not have access to any models that support text generation (generateContent).");
    }
  }

  // 3. Construct the payload. Note: older models like gemini-pro don't support systemInstruction
  // We can merge system prompt into the user message for older models if needed, but for now we try the standard structure.
  const isLegacyModel = targetModel === 'models/gemini-pro';
  
  const payload = isLegacyModel 
    ? {
        contents: [{ parts: [{ text: `System Instruction: ${systemPrompt}\n\nUser Input: ${userMessage}` }] }],
      }
    : {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userMessage }] }],
      };

  // 4. Call the dynamically selected model
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
  } catch (error) {
    if (error instanceof TypeError) throw new Error(formatNetworkError('Gemini'));
    throw error;
  }
};

export const callOpenAI = async (apiKey, systemPrompt, userMessage) => {
  try {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
  } catch (error) {
    if (error instanceof TypeError) throw new Error(formatNetworkError('OpenAI'));
    throw error;
  }
};
