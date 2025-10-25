import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Running database migrations...');
    
    // Run the migration SQL directly
    await db.execute(sql`ALTER TABLE "ingredients" ADD COLUMN IF NOT EXISTS "ingredient_id" text`);
    await db.execute(sql`ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "supplier_type" text`);
    await db.execute(sql`ALTER TABLE "ingredients" ADD CONSTRAINT IF NOT EXISTS "ingredients_ingredient_id_unique" UNIQUE("ingredient_id")`);
    
    console.log('✅ Migrations completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Database migrations completed successfully',
      migrations: [
        'Added ingredient_id column to ingredients table',
        'Added supplier_type column to suppliers table',
        'Added unique constraint on ingredient_id'
      ]
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
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

