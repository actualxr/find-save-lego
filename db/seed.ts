import { db, Inventory } from 'astro:db';

const SET_NUM = '75192-1';
const API_KEY = process.env.REBRICKABLE_API_KEY;

export default async function seed() {
  // DIAGNOSTIC: Check the key format
  if (!API_KEY) {
    console.error("❌ Error: REBRICKABLE_API_KEY is missing.");
    return;
  }
  
  console.log(`Key Check: Length is ${API_KEY.length} characters.`);
  console.log(`Key starts with: ${API_KEY.substring(0, 5)}...`);

  console.log(`fetching inventory for set: ${SET_NUM}...`);

  try {
    const response = await fetch(
      `https://rebrickable.com/api/v3/lego/sets/${SET_NUM}/parts/?page_size=100`,
      { 
        headers: { 
          // Rebrickable MUST have the word 'key' before the actual key
          'Authorization': `key ${API_KEY.trim()}`, 
          'Accept': 'application/json'
        } 
      }
    );

    const data = await response.json();

    if (!data.results) {
      console.log("--- REBRICKABLE REJECTED THE KEY ---");
      console.log(data); 
      return;
    }

    console.log(`✅ Success! Found ${data.results.length} parts. Inserting...`);

    const partsToInsert = data.results.map((item: any) => ({
      set_num: SET_NUM,
      part_num: item.part.part_num,
      name: item.part.name,
      color: item.color.name,
      quantity_needed: item.quantity,
      quantity_found: 0,
      image_url: item.part.part_img_url,
    }));

    await db.insert(Inventory).values(partsToInsert);
    console.log("✅ Database seeded successfully!");

  } catch (error) {
    console.error("❌ Script Error:", error);
  }
}