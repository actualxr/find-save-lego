export const POST = async ({ request }) => {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return new Response(JSON.stringify({ text: "⚠️ Missing API Key in Netlify." }));

    const { message } = await request.json();

    // STEP 1: Ask Google which models this specific key is allowed to use
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();

    if (listData.error) {
      return new Response(JSON.stringify({ text: `⚠️ Google Account Error: ${listData.error.message}` }));
    }

    // Get the list of model names
    const availableModels = listData.models.map(m => m.name.replace('models/', ''));
    
    // STEP 2: Pick the best available model
    // We look for Flash first, then Pro.
    let selectedModel = "";
    if (availableModels.includes("gemini-1.5-flash")) selectedModel = "gemini-1.5-flash";
    else if (availableModels.includes("gemini-1.5-flash-latest")) selectedModel = "gemini-1.5-flash-latest";
    else if (availableModels.includes("gemini-pro")) selectedModel = "gemini-pro";
    else if (availableModels.length > 0) selectedModel = availableModels[0]; // Take whatever they give us

    if (!selectedModel) {
      return new Response(JSON.stringify({ text: `⚠️ No models available for this key. Found: ${availableModels.join(', ')}` }));
    }

    // STEP 3: Call the model that actually exists
    const chatUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${API_KEY}`;
    
    const chatResponse = await fetch(chatUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
    });

    const chatData = await chatResponse.json();

    if (chatData.error) {
       return new Response(JSON.stringify({ text: `⚠️ Error with ${selectedModel}: ${chatData.error.message}` }));
    }

    const aiText = chatData.candidates[0]?.content?.parts?.[0]?.text;
    
    // We add a system note so you can see which model it chose!
    return new Response(JSON.stringify({ 
      text: aiText + `\n\n(System: Connected via ${selectedModel}. Available: ${availableModels.length} models)` 
    }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ text: "❌ App Crash: " + e.message }), { status: 500 });
  }
};
