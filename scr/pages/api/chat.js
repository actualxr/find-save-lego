import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const POST = async ({ request }) => {
  try {
    const { message, history, imageBase64 } = await request.json();
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are the Brick Finder General. Help the user find LEGO parts. If they show an image, identify the part."
    });

    const chat = model.startChat({ history: history || [] });
    
    let contents = [message];
    if (imageBase64) {
      contents.push({
        inlineData: { mimeType: "image/jpeg", data: imageBase64.split(',')[1] }
      });
    }

    const result = await chat.sendMessage(contents);
    const response = await result.response;

    return new Response(JSON.stringify({
      text: response.text(),
      history: await chat.getHistory()
    }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
