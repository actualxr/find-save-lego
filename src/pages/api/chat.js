export const POST = async ({ request }) => {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY || API_KEY === "") {
      return new Response(JSON.stringify({ text: "⚠️ System Error: GEMINI_API_KEY is missing from Netlify environment variables." }));
    }

    const body = await request.json();
    const { message, imageBase64 } = body;

    // We use the 'v1beta' endpoint which is the most compatible with Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    let parts = [{ text: message }];

    if (imageBase64) {
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: imageBase64.split(",")[1]
        }
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    const data = await response.json();

    // 1. Check for Google API Errors
    if (data.error) {
      return new Response(JSON.stringify({ 
        text: `⚠️ Google API Error (${data.error.code}): ${data.error.message}` 
      }));
    }

    // 2. Check for Safety Blocks (common with LEGO/images)
    if (!data.candidates || data.candidates.length === 0) {
      return new Response(JSON.stringify({ 
        text: "⚠️ The General is speechless. Google blocked the response (likely a safety filter)." 
      }));
    }

    // 3. Extract the text carefully
    const aiText = data.candidates[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return new Response(JSON.stringify({ 
        text: "⚠️ The General sent an empty response. Raw Data: " + JSON.stringify(data).substring(0, 100) 
      }));
    }

    return new Response(JSON.stringify({
      text: aiText,
      history: [] 
    }), { status: 200 });

  } catch (e) {
    // 4. Catch any code crashes
    return new Response(JSON.stringify({ 
      text: "❌ Internal App Error: " + e.message 
    }), { status: 500 });
  }
};
