export const POST = async ({ request }) => {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    // Safety check: Does the key even exist?
    if (!API_KEY) {
      return new Response(JSON.stringify({ text: "⚠️ System Error: The GEMINI_API_KEY variable is empty in Netlify." }));
    }

    const body = await request.json();
    const { message } = body;

    // Use the v1beta endpoint - very stable for Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
    });

    const data = await response.json();

    if (data.error) {
      // Diagnostic help: Shows the first 4 characters of the key we are using
      const keySnippet = API_KEY.substring(0, 4);
      return new Response(JSON.stringify({ 
        text: `⚠️ Google Error: ${data.error.message} (Using key starting with: ${keySnippet}...)` 
      }));
    }

    const aiText = data.candidates[0]?.content?.parts?.[0]?.text;
    return new Response(JSON.stringify({ text: aiText }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ text: "❌ Code Error: " + e.message }), { status: 500 });
  }
};
