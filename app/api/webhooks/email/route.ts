import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rfqs, customers, backgroundJobs, emailLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract email data from SendGrid webhook
    const { from, to, subject, text, html, attachments } = body;
    
    console.log('Received email webhook:', { from, to, subject });
    
    // Find or create customer
    let customer = await db.query.customers.findFirst({
      where: eq(customers.email, from),
    });
    
    if (!customer) {
      const [newCustomer] = await db.insert(customers).values({
        companyName: from.split('@')[0], // Temporary, will be updated later
        contactName: from.split('@')[0],
        email: from,
        status: 'Active',
      }).returning();
      customer = newCustomer;
    }
    
    // Generate RFQ number
    const rfqCount = await db.query.rfqs.findMany();
    const rfqNumber = `RFQ-${String(rfqCount.length + 1).padStart(3, '0')}`;
    
    // Create RFQ record
    const [rfq] = await db.insert(rfqs).values({
      rfqNumber,
      customerId: customer.id,
      status: 'New',
      originalEmailSubject: subject,
      originalEmailBody: text || html,
      emailAttachmentUrls: attachments || [],
    }).returning();
    
    // Log the inbound email
    await db.insert(emailLogs).values({
      rfqId: rfq.id,
      direction: 'Inbound',
      fromEmail: from,
      toEmail: to,
      subject,
      body: text || html,
      status: 'Received',
    });
    
    // Create background job to process RFQ with AI
    await db.insert(backgroundJobs).values({
      jobType: 'process_rfq',
      payload: { rfqId: rfq.id },
      status: 'Pending',
    });
    
    // Create background job to send confirmation email (delayed by 10 minutes)
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
    await db.insert(backgroundJobs).values({
      jobType: 'send_confirmation',
      payload: { rfqId: rfq.id, customerEmail: from },
      status: 'Pending',
      scheduledFor: tenMinutesFromNow,
    });
    
    return NextResponse.json({ 
      success: true, 
      rfqNumber,
      message: 'Email received and RFQ created' 
    });
    
  } catch (error) {
    console.error('Email webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process email' },
      { status: 500 }
    );
  }
}

