import { db } from '../lib/db';
import { suppliers, ingredients } from '../lib/db/schema';
import { sql, eq } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

async function importSuppliers() {
  console.log('📦 Starting supplier import from Excel...');
  
  try {
    // Read the Excel file
    const filePath = process.argv[2] || '/home/ubuntu/upload/use_supplierlist.xlsx';
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${data.length} suppliers in Excel file`);
    
    let createdCount = 0;
    let updatedCount = 0;
    let ingredientLinkCount = 0;
    
    for (const row of data as any[]) {
      const supplierName = row['Supplier Name'];
      
      if (!supplierName) continue;
      
      // Check if supplier already exists
      const existing = await db.select()
        .from(suppliers)
        .where(eq(suppliers.companyName, supplierName))
        .limit(1);
      
      let supplierId: number;
      
      if (existing.length > 0) {
        // Update existing supplier
        await db.update(suppliers)
          .set({
            contactName: row['Contact Name'] || existing[0].contactName,
            email: row['Email'] || existing[0].email,
            phone: row['Phone'] || existing[0].phone,
            address: row['Address'] || existing[0].address,
            notes: row['Notes'] || existing[0].notes,
            status: 'Active',
            updatedAt: new Date(),
          })
          .where(eq(suppliers.id, existing[0].id));
        
        supplierId = existing[0].id;
        updatedCount++;
        console.log(`  ↻ Updated: ${supplierName}`);
      } else {
        // Create new supplier
        const [newSupplier] = await db.insert(suppliers).values({
          companyName: supplierName,
          contactName: row['Contact Name'] || null,
          email: row['Email'] || null,
          phone: row['Phone'] || null,
          address: row['Address'] || null,
          notes: row['Notes'] || null,
          status: 'Active',
        }).returning();
        
        supplierId = newSupplier.id;
        createdCount++;
        console.log(`  ✓ Created: ${supplierName}`);
      }
      
      // Link ingredients to this supplier
      if (row['Ingredients']) {
        const ingredientList = String(row['Ingredients'])
          .split(',')
          .map(i => i.trim())
          .filter(i => i.length > 0);
        
        for (const ingredientName of ingredientList) {
          // Find ingredient by name (case-insensitive partial match)
          const matchingIngredients = await db.select()
            .from(ingredients)
            .where(sql`LOWER(${ingredients.ingredientName}) LIKE LOWER(${'%' + ingredientName + '%'})`)
            .limit(5);
          
          if (matchingIngredients.length > 0) {
            // Link to the best match
            await db.update(ingredients)
              .set({
                supplierId: supplierId,
                supplierName: supplierName,
                updatedAt: new Date(),
              })
              .where(eq(ingredients.id, matchingIngredients[0].id));
            
            ingredientLinkCount++;
            console.log(`    → Linked ingredient: ${matchingIngredients[0].ingredientName}`);
          } else {
            console.log(`    ⚠ No match found for: ${ingredientName}`);
          }
        }
      }
    }
    
    console.log('\n✅ Supplier import complete!');
    console.log(`   - Created: ${createdCount} suppliers`);
    console.log(`   - Updated: ${updatedCount} suppliers`);
    console.log(`   - Linked: ${ingredientLinkCount} ingredients`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

importSuppliers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

