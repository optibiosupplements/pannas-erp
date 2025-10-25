import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers, ingredients } from '@/lib/db/schema';
import { eq, ilike } from 'drizzle-orm';
import { SUPPLIER_MAPPINGS } from '@/lib/data/supplier-mappings';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Starting supplier import...');
    
    let suppliersCreated = 0;
    let ingredientsLinked = 0;
    let ingredientsNotFound = 0;
    const supplierCache = new Map<string, number>();
    const logs: string[] = [];
    
    logs.push(`Found ${SUPPLIER_MAPPINGS.length} ingredient-supplier mappings`);
    
    for (const mapping of SUPPLIER_MAPPINGS) {
      const { ingredient: ingredientName, supplier: supplierName, sku: skuCode } = mapping;
      
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
          if (suppliersCreated <= 10) {
            logs.push(`✓ Created supplier: ${supplierName}`);
          }
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
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

