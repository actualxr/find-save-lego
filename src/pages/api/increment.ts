import { db, Inventory, eq, sql } from 'astro:db';

export const POST = async ({ request }) => {
  try {
    const { id } = await request.json();

    // This command increments the quantity_found by 1 in the cloud
    await db.update(Inventory)
      .set({
        quantity_found: sql`${Inventory.quantity_found} + 1`
      })
      .where(eq(Inventory.id, id));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}