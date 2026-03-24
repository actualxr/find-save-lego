export const POST = async ({ request }) => {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) throw new Error("GEMINI_API_KEY is missing.");

    const { message, imageBase64 } = await request.json();

    // This URL is the most compatible version for Gemini 1.5 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    let contents = [];
    
    // If an image is provided, we format it exactly how the raw API wants it
    if (imageBase64) {
      contents.push({
        parts: [
          { text: message },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageBase64.split(",")[1]
            }
          }
        ]
      });
    } else {
      contents.push({
        parts: [{ text: message }]
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Google says: ${data.error.message}`);
    }

    const aiText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({
      text: aiText,
      history: [] // Simplified for now
    }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
