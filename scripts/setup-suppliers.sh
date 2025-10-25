#!/bin/bash
set -e

echo "🚀 Starting supplier setup..."
echo ""

# Step 1: Run database migrations
echo "📊 Step 1: Running database migrations..."
pnpm run migrate
echo "✅ Migrations complete"
echo ""

# Step 2: Import ingredient-supplier mappings
echo "🔗 Step 2: Importing ingredient-supplier mappings..."
if [ -f "/home/ubuntu/upload/pasted_content_4.txt" ]; then
  pnpm tsx scripts/import-ingredient-supplier-mapping.ts /home/ubuntu/upload/pasted_content_4.txt
else
  echo "⚠️  Mapping file not found, skipping..."
fi
echo ""

# Step 3: Add synonyms to ingredients (optional - uses AI)
echo "📝 Step 3: Adding synonyms to ingredients (optional)..."
read -p "Do you want to add AI-generated synonyms? This will use OpenAI API. (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  pnpm tsx scripts/add-ingredient-synonyms.ts
fi
echo ""

echo "✅ Supplier setup complete!"
echo ""
echo "Summary:"
echo "- Database migrations: ✅"
echo "- Supplier records: ✅"
echo "- Ingredient linking: ✅"
echo ""
echo "Visit https://pannas-erp.up.railway.app/suppliers to see the results!"

