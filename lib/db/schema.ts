import { pgTable, serial, text, timestamp, integer, decimal, jsonb } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  role: text('role').notNull().default('USER'), // USER, ADMIN
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Customers table
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  contactName: text('contact_name'),
  email: text('email').notNull(),
  phone: text('phone'),
  address: text('address'),
  notes: text('notes'),
  status: text('status').notNull().default('Active'), // Active, Inactive
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Suppliers table
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  contactName: text('contact_name'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  website: text('website'),
  notes: text('notes'),
  status: text('status').notNull().default('Active'), // Active, Inactive
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Manufacturers table
export const manufacturers = pgTable('manufacturers', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  contactName: text('contact_name'),
  email: text('email').notNull(),
  phone: text('phone'),
  address: text('address'),
  capabilities: jsonb('capabilities'), // Array of capabilities
  notes: text('notes'),
  status: text('status').notNull().default('Active'), // Active, Inactive
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// RFQs table
export const rfqs = pgTable('rfqs', {
  id: serial('id').primaryKey(),
  rfqNumber: text('rfq_number').notNull().unique(),
  customerId: integer('customer_id').references(() => customers.id),
  status: text('status').notNull().default('New'), // New, In Review, Quoted, Closed
  productDescription: text('product_description'),
  originalEmailSubject: text('original_email_subject'),
  originalEmailBody: text('original_email_body'),
  emailAttachmentUrls: jsonb('email_attachment_urls'), // Array of S3 URLs
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Product Specifications table
export const productSpecifications = pgTable('product_specifications', {
  id: serial('id').primaryKey(),
  specNumber: text('spec_number').notNull().unique(),
  rfqId: integer('rfq_id').references(() => rfqs.id),
  productName: text('product_name').notNull(),
  productFormat: text('product_format'), // Capsule, Tablet, Powder, Gummy, Softgel
  servingSize: text('serving_size'),
  servingsPerContainer: integer('servings_per_container'),
  orderQuantity: integer('order_quantity'),
  packagingType: text('packaging_type'), // Bulk, Bottled
  bottleSize: text('bottle_size'),
  labelType: text('label_type'),
  formulaJson: jsonb('formula_json'), // Array of ingredients with dosages
  totalRawMaterialCost: decimal('total_raw_material_cost', { precision: 10, scale: 2 }),
  manufacturingCost: decimal('manufacturing_cost', { precision: 10, scale: 2 }),
  packagingCost: decimal('packaging_cost', { precision: 10, scale: 2 }),
  totalCostPerUnit: decimal('total_cost_per_unit', { precision: 10, scale: 2 }),
  customerPrice: decimal('customer_price', { precision: 10, scale: 2 }),
  marginPercentage: decimal('margin_percentage', { precision: 5, scale: 2 }),
  notes: text('notes'),
  status: text('status').notNull().default('Draft'), // Draft, Approved, Quoted
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Master Ingredients table
export const ingredients = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  ingredientName: text('ingredient_name').notNull(),
  commonName: text('common_name'),
  synonyms: jsonb('synonyms'), // Array of alternative names/aliases
  category: text('category'), // Vitamin, Mineral, Herb, Amino Acid, etc.
  form: text('form'), // Powder, Liquid, Extract, etc.
  assayPercentage: decimal('assay_percentage', { precision: 5, scale: 2 }),
  costPerKg: decimal('cost_per_kg', { precision: 10, scale: 2 }),
  supplierId: integer('supplier_id').references(() => suppliers.id), // Foreign key to suppliers
  supplierName: text('supplier_name'), // Denormalized for quick access
  moq: integer('moq'), // Minimum Order Quantity
  leadTimeDays: integer('lead_time_days'),
  casNumber: text('cas_number'), // Chemical Abstracts Service number for precise identification
  notes: text('notes'),
  searchVector: text('search_vector'), // For full-text search optimization
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Opportunities table
export const opportunities = pgTable('opportunities', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id),
  rfqId: integer('rfq_id').references(() => rfqs.id),
  title: text('title').notNull(),
  value: decimal('value', { precision: 12, scale: 2 }),
  stage: text('stage').notNull().default('Lead'), // Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
  probability: integer('probability').default(0), // 0-100
  expectedCloseDate: timestamp('expected_close_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Email Logs table
export const emailLogs = pgTable('email_logs', {
  id: serial('id').primaryKey(),
  rfqId: integer('rfq_id').references(() => rfqs.id),
  direction: text('direction').notNull(), // Inbound, Outbound
  fromEmail: text('from_email').notNull(),
  toEmail: text('to_email').notNull(),
  subject: text('subject'),
  body: text('body'),
  status: text('status').notNull().default('Sent'), // Sent, Failed, Queued
  sentAt: timestamp('sent_at').defaultNow().notNull(),
});

// Background Jobs table
export const backgroundJobs = pgTable('background_jobs', {
  id: serial('id').primaryKey(),
  jobType: text('job_type').notNull(), // process_rfq, send_confirmation, send_quote
  payload: jsonb('payload'),
  status: text('status').notNull().default('Pending'), // Pending, Processing, Completed, Failed
  attempts: integer('attempts').default(0),
  error: text('error'),
  scheduledFor: timestamp('scheduled_for'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});



// Relations
import { relations } from 'drizzle-orm';

export const rfqsRelations = relations(rfqs, ({ one }) => ({
  customer: one(customers, {
    fields: [rfqs.customerId],
    references: [customers.id],
  }),
}));

export const opportunitiesRelations = relations(opportunities, ({ one }) => ({
  customer: one(customers, {
    fields: [opportunities.customerId],
    references: [customers.id],
  }),
  rfq: one(rfqs, {
    fields: [opportunities.rfqId],
    references: [rfqs.id],
  }),
}));

export const productSpecificationsRelations = relations(productSpecifications, ({ one }) => ({
  rfq: one(rfqs, {
    fields: [productSpecifications.rfqId],
    references: [rfqs.id],
  }),
}));

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  rfq: one(rfqs, {
    fields: [emailLogs.rfqId],
    references: [rfqs.id],
  }),
}));

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [ingredients.supplierId],
    references: [suppliers.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  ingredients: many(ingredients),
}));

