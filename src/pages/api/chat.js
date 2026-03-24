export const POST = async ({ request }) => {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    const body = await request.json();
    const { message, imageBase64 } = body;

    // Use the model that we know works for your account
    const selectedModel = "gemini-2.5-flash"; 
    const chatUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${API_KEY}`;
    
    // Build the "Parts" list. We always start with the text prompt.
    let parts = [
      { text: "You are the 'Brick Finder General'. Identify the LEGO part in this image. Provide the Name and if possible the Part Number (e.g., 'Brick 2x4', '3001'). Be enthusiastic!" },
      { text: message }
    ];

    // If the user sent a photo, add it to the message
    if (imageBase64) {
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: imageBase64.split(",")[1] // Strip the header
        }
      });
    }

    const chatResponse = await fetch(chatUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    const chatData = await chatResponse.json();

    if (chatData.error) {
       return new Response(JSON.stringify({ text: `⚠️ AI Error: ${chatData.error.message}` }));
    }

    const aiText = chatData.candidates[0]?.content?.parts?.[0]?.text;
    
    return new Response(JSON.stringify({ text: aiText }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ text: "❌ App Crash: " + e.message }), { status: 500 });
  }
};
