import { defineDb, defineTable, column } from 'astro:db';

const Inventory = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    set_num: column.text(),        // e.g., "75192-1"
    part_num: column.text(),       // e.g., "3001" (The LDraw ID)
    name: column.text(),           // e.g., "Brick 2 x 4"
    color: column.text(),          // e.g., "Red"
    quantity_needed: column.number(),
    quantity_found: column.number({ default: 0 }),
    image_url: column.text(),      // From Rebrickable API
  }
});

export default defineDb({
  tables: { Inventory },
});
