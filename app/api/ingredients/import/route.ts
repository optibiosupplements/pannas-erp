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
        ingredientName: ing.name || ing.ingredient_name || 'Unknown',
        commonName: ing.common_name || null,
        category: ing.category || 'Other',
        form: ing.form || null,
        supplier: ing.supplier || 'Unknown',
        costPerKg: ing.cost_per_kg ? String(ing.cost_per_kg) : '0',
        assayPercentage: ing.assay_percentage ? String(ing.assay_percentage) : '100',
        moq: ing.moq || null,
        leadTimeDays: ing.lead_time_days || null,
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

