// src/pages/api/fetch-set.js
export const POST = async ({ request }) => {
  const { setNum } = await request.json();
  const apiKey = import.meta.env.REBRICKABLE_API_KEY;

  const url = `https://rebrickable.com/api/v3/lego/sets/${setNum}/parts/`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `key ${apiKey}`
      }
    });
    const data = await response.json();
    
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), { status: 500 });
  }
}
