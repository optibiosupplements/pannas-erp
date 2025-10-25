import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers, ingredients } from '@/lib/db/schema';
import { sql, eq, ilike } from 'drizzle-orm';

// Hardcoded ingredient-supplier mappings (from pasted_content_4.txt)
const INGREDIENT_SUPPLIER_MAPPINGS = `Hydrangea  Root powder	Amazonicas	RM001
Coral calcium	A Better Ingredient, LLC	RM002
Coral Calcium Powder (Food Grade)	A Better Ingredient, LLC	RM003
Berberine HCL 97%	Abinopharma Inc	RM004
Nicotinamide Riboside Chloride Powder	Abinopharma Inc	RM005
Trans-Pterostilbene 99%	Abinopharma Inc	RM006
Vitamin B12 (as Hydroxocobalamin)	Accobio USA, Inc.	RM007
Iron (Bisglycinate) 20%	Actylis/Talus Mineral Company	RM008
Magnesium (Magnesium Glycinate 20%)	Actylis/Talus Mineral Company	RM009
Magnesium as (Magnesium Citrate) 30%	Actylis/Talus Mineral Company	RM010
Sodium Selenite 1%	Actylis/Talus Mineral Company	RM011
Magnesium (Magnesium Glycinate 30%)	Actylis/Talus Mineral Company	RM012
Organic Monk Fruit Extract V50%	Agroindustrias Amazonicas, N.A	RM013
Sarsaparilla (Smilax Glabra) Root Powder	Agroindustrias Amazonicas, N.A	RM014`.split('\n');

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Starting supplier import...');
    
    const lines = INGREDIENT_SUPPLIER_MAPPINGS.filter(line => line.trim().length > 0);
    
    let suppliersCreated = 0;
    let ingredientsLinked = 0;
    let ingredientsNotFound = 0;
    const supplierCache = new Map<string, number>();
    const logs: string[] = [];
    
    logs.push(`Found ${lines.length} ingredient-supplier mappings`);
    
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
          logs.push(`✓ Created supplier: ${supplierName}`);
        }
        
        supplierCache.set(supplierName, supplierId);
      }
      
      // Find and link ingredient
      let matchingIngredients = await db.select()
        .from(ingredients)
        .where(eq(ingredients.ingredientName, ingredientName))
        .limit(1);
      
      if (matchingIngredients.length === 0) {
        matchingIngredients = await db.select()
          .from(ingredients)
          .where(ilike(ingredients.ingredientName, `%${ingredientName}%`))
          .limit(1);
      }
      
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
          logs.push(`→ Linked ${ingredientsLinked} ingredients so far...`);
        }
      } else {
        ingredientsNotFound++;
        if (ingredientsNotFound <= 10) {
          logs.push(`⚠ No match found for: "${ingredientName}" (Supplier: ${supplierName})`);
        }
      }
    }
    
    logs.push('');
    logs.push('✅ Import complete!');
    logs.push(`   - Suppliers created: ${suppliersCreated}`);
    logs.push(`   - Ingredients linked: ${ingredientsLinked}`);
    logs.push(`   - Ingredients not found: ${ingredientsNotFound}`);
    
    const allSuppliers = await db.select().from(suppliers);
    logs.push(`   - Total suppliers in database: ${allSuppliers.length}`);
    
    return NextResponse.json({
      success: true,
      suppliersCreated,
      ingredientsLinked,
      ingredientsNotFound,
      totalSuppliers: allSuppliers.length,
      logs,
    });
    
  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

