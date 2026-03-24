import { db, Inventory } from 'astro:db';

// CONFIGURATION: Change this to the set you want to track
const SET_NUM = '42089-1'; // Power Boat (UCS)
const API_KEY = process.env.REBRICKABLE_API_KEY;

export default async function seed() {
  if (!API_KEY) {
    console.error("❌ Error: REBRICKABLE_API_KEY is not set in your .env file.");
    return;
  }

  console.log(`fetching inventory for set: ${SET_NUM}...`);

  try {
    // 1. Fetch data from Rebrickable
    // Note: Rebrickable paginates. For huge sets, we'd need to loop, 
    // but this gets the first 100 parts to get you started.
    const response = await fetch(
      `https://rebrickable.com/api/v3/lego/sets/${SET_NUM}/parts/?page_size=100`,
      { headers: { 'Authorization': `key ${API_KEY}` } }
    );

    const data = await response.json();

    if (!data.results) {
      console.error("❌ Error: No parts found. Check your Set Number.");
      return;
    }

    console.log(`Found ${data.results.length} unique parts. Inserting into DB...`);

    // 2. Map and Insert into Astro DB
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
    console.error("❌ Seeding failed:", error);
  }
}
