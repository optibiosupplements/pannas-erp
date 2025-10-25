import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ingredients } from '@/lib/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!Array.isArray(data.ingredients)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected { ingredients: [...] }' },
        { status: 400 }
      );
    }

    // Clear existing ingredients
    await db.delete(ingredients);

    // Insert new ingredients
    const imported = await db.insert(ingredients).values(
      data.ingredients.map((ing: any) => ({
        ingredientId: ing.ingredient_id || ing.ingredientId,
        name: ing.name || ing.ingredient_name,
        category: ing.category || 'Other',
        supplier: ing.supplier || 'Unknown',
        costPerKg: parseFloat(ing.cost_per_kg || ing.costPerKg || 0),
        assayPercentage: parseFloat(ing.assay_percentage || ing.assayPercentage || 100),
        labelClaimActive: ing.label_claim_active === true || ing.labelClaimActive === true,
        multiComponent: ing.multi_component === true || ing.multiComponent === true,
        notes: ing.notes || null,
      }))
    ).returning();

    return NextResponse.json({
      success: true,
      count: imported.length,
      message: `Successfully imported ${imported.length} ingredients`,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import ingredients' },
      { status: 500 }
    );
  }
}

