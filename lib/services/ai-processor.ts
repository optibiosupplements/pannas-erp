import OpenAI from 'openai';
import { db } from '@/lib/db';
import { rfqs, productSpecifications, ingredients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processRFQWithAI(rfqId: number) {
  try {
    // Get RFQ data
    const rfq = await db.query.rfqs.findFirst({
      where: eq(rfqs.id, rfqId),
      with: {
        customer: true,
      },
    });
    
    if (!rfq) {
      throw new Error(`RFQ ${rfqId} not found`);
    }
    
    // Get all ingredients for matching
    const allIngredients = await db.query.ingredients.findMany();
    
    // Prepare prompt for OpenAI
    const prompt = `You are an expert nutraceutical formulation analyst. Analyze the following customer email and extract product specification details.

Email Subject: ${rfq.originalEmailSubject}
Email Body: ${rfq.originalEmailBody}

Available Ingredients Database (for matching):
${JSON.stringify(allIngredients.map(i => ({ 
  id: i.id, 
  name: i.ingredientName, 
  commonName: i.commonName,
  category: i.category,
  form: i.form,
  costPerKg: i.costPerKg 
})), null, 2)}

Extract and return a JSON object with the following structure:
{
  "products": [
    {
      "productName": "string",
      "productFormat": "Capsule|Tablet|Powder|Gummy|Softgel",
      "servingSize": "string (e.g., '2 capsules')",
      "servingsPerContainer": number,
      "orderQuantity": number,
      "packagingType": "Bulk|Bottled",
      "bottleSize": "string (e.g., '60 count')",
      "formula": [
        {
          "ingredientId": number (match from available ingredients),
          "ingredientName": "string",
          "dosagePerServing": "string (e.g., '500mg')",
          "dosageValue": number (numeric value in mg),
          "notes": "string (optional)"
        }
      ]
    }
  ],
  "customerNotes": "string (any special requests or notes)"
}

If the email mentions an existing product (e.g., Amazon link, supplement facts panel), try to reverse-engineer the formula from the description.
If ingredient names don't match exactly, use fuzzy matching to find the closest match from the available ingredients database.
If you cannot determine certain fields, use reasonable defaults or null.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert nutraceutical formulation analyst. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });
    
    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Create product specifications for each product found
    const createdSpecs = [];
    for (const [index, product] of (result.products || []).entries()) {
      const specNumber = `${rfq.rfqNumber}-${String.fromCharCode(65 + index)}`; // RFQ-001-A, RFQ-001-B, etc.
      
      // Calculate costs
      let totalRawMaterialCost = 0;
      for (const ing of product.formula || []) {
        const ingredient = allIngredients.find(i => i.id === ing.ingredientId);
        if (ingredient && ingredient.costPerKg) {
          // Convert dosage to kg and calculate cost
          const dosageKg = (ing.dosageValue || 0) / 1000000; // mg to kg
          const costPerServing = dosageKg * parseFloat(ingredient.costPerKg.toString());
          totalRawMaterialCost += costPerServing;
        }
      }
      
      const [spec] = await db.insert(productSpecifications).values({
        specNumber,
        rfqId: rfq.id,
        productName: product.productName,
        productFormat: product.productFormat,
        servingSize: product.servingSize,
        servingsPerContainer: product.servingsPerContainer,
        orderQuantity: product.orderQuantity,
        packagingType: product.packagingType,
        bottleSize: product.bottleSize,
        formulaJson: product.formula,
        totalRawMaterialCost: totalRawMaterialCost.toFixed(2),
        status: 'Draft',
      }).returning();
      
      createdSpecs.push(spec);
    }
    
    // Update RFQ status
    await db.update(rfqs)
      .set({ 
        status: 'In Review',
        productDescription: result.products?.map((p: any) => p.productName).join(', '),
      })
      .where(eq(rfqs.id, rfqId));
    
    return {
      success: true,
      specsCreated: createdSpecs.length,
      specs: createdSpecs,
    };
    
  } catch (error) {
    console.error('AI processing error:', error);
    throw error;
  }
}

