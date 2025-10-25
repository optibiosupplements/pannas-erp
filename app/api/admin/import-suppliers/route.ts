import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers, ingredients } from '@/lib/db/schema';
import { eq, ilike } from 'drizzle-orm';
import { SUPPLIER_MAPPINGS } from '@/lib/data/supplier-mappings';

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Starting supplier and ingredient import...');
    
    let suppliersCreated = 0;
    let ingredientsLinked = 0;
    let ingredientsNotFound = 0;
    const supplierCache = new Map<string, number>();
    const logs: string[] = [];
    
    logs.push(`Found ${SUPPLIER_MAPPINGS.length} ingredient-supplier mappings`);
    
    for (const mapping of SUPPLIER_MAPPINGS) {
      const { 
        ingredient: ingredientName, 
        supplier: supplierName, 
        sku: ingredientId,
        category,
        price,
        potency,
        active,
        supplierType
      } = mapping;
      
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
            supplierType: supplierType || 'Raw Material Supplier',
            status: 'Active',
          }).returning();
          
          supplierId = newSupplier.id;
          suppliersCreated++;
          if (suppliersCreated <= 10) {
            logs.push(`✓ Created supplier: ${supplierName} (${supplierType})`);
          }
        }
        
        supplierCache.set(supplierName, supplierId);
      }
      
      // Find and update or create ingredient
      let matchingIngredients = await db.select()
        .from(ingredients)
        .where(eq(ingredients.ingredientName, ingredientName))
        .limit(1);
      
      if (matchingIngredients.length === 0 && ingredientId) {
        // Try matching by ingredient ID
        matchingIngredients = await db.select()
          .from(ingredients)
          .where(eq(ingredients.ingredientId, ingredientId))
          .limit(1);
      }
      
      if (matchingIngredients.length === 0) {
        // Fuzzy match by name
        matchingIngredients = await db.select()
          .from(ingredients)
          .where(ilike(ingredients.ingredientName, `%${ingredientName}%`))
          .limit(1);
      }
      
      const priceNum = price ? parseFloat(price.replace('$', '').replace(',', '')) : null;
      const potencyNum = potency ? parseFloat(potency) : null;
      
      if (matchingIngredients.length > 0) {
        // Update existing ingredient
        const ingredient = matchingIngredients[0];
        
        await db.update(ingredients)
          .set({
            ingredientId: ingredientId || ingredient.ingredientId,
            supplierId: supplierId,
            supplierName: supplierName,
            category: category || ingredient.category,
            costPerKg: priceNum ? priceNum.toString() : ingredient.costPerKg,
            assayPercentage: potencyNum ? potencyNum.toString() : ingredient.assayPercentage,
            notes: active === 'TRUE' ? 'Active ingredient' : ingredient.notes,
            updatedAt: new Date(),
          })
          .where(eq(ingredients.id, ingredient.id));
        
        ingredientsLinked++;
      } else {
        // Create new ingredient
        await db.insert(ingredients).values({
          ingredientId: ingredientId,
          ingredientName: ingredientName,
          category: category,
          supplierId: supplierId,
          supplierName: supplierName,
          costPerKg: priceNum ? priceNum.toString() : null,
          assayPercentage: potencyNum ? potencyNum.toString() : null,
          notes: active === 'TRUE' ? 'Active ingredient' : null,
        });
        
        ingredientsLinked++;
      }
      
      if (ingredientsLinked % 50 === 0) {
        logs.push(`→ Processed ${ingredientsLinked} ingredients so far...`);
      }
    }
    
    logs.push('');
    logs.push('✅ Import complete!');
    logs.push(`   - Suppliers created: ${suppliersCreated}`);
    logs.push(`   - Ingredients processed: ${ingredientsLinked}`);
    logs.push(`   - Ingredients not found: ${ingredientsNotFound}`);
    
    const allSuppliers = await db.select().from(suppliers);
    const allIngredients = await db.select().from(ingredients);
    logs.push(`   - Total suppliers in database: ${allSuppliers.length}`);
    logs.push(`   - Total ingredients in database: ${allIngredients.length}`);
    
    return NextResponse.json({
      success: true,
      suppliersCreated,
      ingredientsLinked,
      ingredientsNotFound,
      totalSuppliers: allSuppliers.length,
      totalIngredients: allIngredients.length,
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

