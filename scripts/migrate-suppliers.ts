import { db } from '../lib/db';
import { ingredients, suppliers } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

async function migrateSuppliers() {
  console.log('Starting supplier migration...');
  
  try {
    // Step 1: Get all unique supplier names from existing ingredients
    const allIngredients = await db.select().from(ingredients);
    const uniqueSuppliers = [...new Set(allIngredients.map(i => i.supplierName).filter(Boolean))];
    
    console.log(`Found ${uniqueSuppliers.length} unique suppliers`);
    
    // Step 2: Create supplier records
    const supplierMap = new Map<string, number>();
    
    for (const supplierName of uniqueSuppliers) {
      const [supplier] = await db.insert(suppliers).values({
        companyName: supplierName as string,
        status: 'Active',
      }).returning();
      
      supplierMap.set(supplierName as string, supplier.id);
      console.log(`Created supplier: ${supplierName} (ID: ${supplier.id})`);
    }
    
    // Step 3: Update ingredients to link to suppliers
    let updatedCount = 0;
    for (const ingredient of allIngredients) {
      if (ingredient.supplierName) {
        const supplierId = supplierMap.get(ingredient.supplierName);
        if (supplierId) {
          await db.update(ingredients)
            .set({ supplierId })
            .where(sql`${ingredients.id} = ${ingredient.id}`);
          updatedCount++;
        }
      }
    }
    
    console.log(`✅ Migration complete!`);
    console.log(`   - Created ${uniqueSuppliers.length} supplier records`);
    console.log(`   - Linked ${updatedCount} ingredients to suppliers`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

migrateSuppliers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

