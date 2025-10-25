import { db } from '../lib/db';
import { suppliers, ingredients } from '../lib/db/schema';
import { sql, eq, ilike } from 'drizzle-orm';
import * as fs from 'fs';

async function importIngredientSupplierMapping() {
  console.log('🔗 Starting ingredient-supplier mapping import...');
  
  try {
    const filePath = process.argv[2] || '/home/ubuntu/upload/pasted_content_4.txt';
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
    
    console.log(`Found ${lines.length} ingredient-supplier mappings`);
    
    let suppliersCreated = 0;
    let ingredientsLinked = 0;
    let ingredientsNotFound = 0;
    const supplierCache = new Map<string, number>();
    
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 2) continue;
      
      const ingredientName = parts[0].trim();
      const supplierName = parts[1].trim();
      const skuCode = parts[2]?.trim() || null;
      
      if (!ingredientName || !supplierName) continue;
      
      // Get or create supplier
      let supplierId: number;
      
      if (supplierCache.has(supplierName)) {
        supplierId = supplierCache.get(supplierName)!;
      } else {
        const existingSupplier = await db.select()
          .from(suppliers)
          .where(eq(suppliers.companyName, supplierName))
          .limit(1);
        
        if (existingSupplier.length > 0) {
          supplierId = existingSupplier[0].id;
        } else {
          const [newSupplier] = await db.insert(suppliers).values({
            companyName: supplierName,
            status: 'Active',
          }).returning();
          
          supplierId = newSupplier.id;
          suppliersCreated++;
          console.log(`  ✓ Created supplier: ${supplierName}`);
        }
        
        supplierCache.set(supplierName, supplierId);
      }
      
      // Find and link ingredient
      // Try exact match first
      let matchingIngredients = await db.select()
        .from(ingredients)
        .where(eq(ingredients.ingredientName, ingredientName))
        .limit(1);
      
      // If no exact match, try case-insensitive partial match
      if (matchingIngredients.length === 0) {
        matchingIngredients = await db.select()
          .from(ingredients)
          .where(ilike(ingredients.ingredientName, `%${ingredientName}%`))
          .limit(1);
      }
      
      // Try matching by common name
      if (matchingIngredients.length === 0 && ingredientName.length > 5) {
        matchingIngredients = await db.select()
          .from(ingredients)
          .where(ilike(ingredients.commonName, `%${ingredientName}%`))
          .limit(1);
      }
      
      if (matchingIngredients.length > 0) {
        const ingredient = matchingIngredients[0];
        
        await db.update(ingredients)
          .set({
            supplierId: supplierId,
            supplierName: supplierName,
            notes: skuCode ? `SKU: ${skuCode}${ingredient.notes ? ' | ' + ingredient.notes : ''}` : ingredient.notes,
            updatedAt: new Date(),
          })
          .where(eq(ingredients.id, ingredient.id));
        
        ingredientsLinked++;
        
        if (ingredientsLinked % 50 === 0) {
          console.log(`  → Linked ${ingredientsLinked} ingredients so far...`);
        }
      } else {
        ingredientsNotFound++;
        if (ingredientsNotFound <= 10) {
          console.log(`  ⚠ No match found for: "${ingredientName}" (Supplier: ${supplierName})`);
        }
      }
    }
    
    console.log('\n✅ Import complete!');
    console.log(`   - Suppliers created: ${suppliersCreated}`);
    console.log(`   - Ingredients linked: ${ingredientsLinked}`);
    console.log(`   - Ingredients not found: ${ingredientsNotFound}`);
    
    // Show supplier summary
    const allSuppliers = await db.select().from(suppliers);
    console.log(`\n📊 Total suppliers in database: ${allSuppliers.length}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

importIngredientSupplierMapping()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

