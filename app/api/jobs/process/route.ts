import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { backgroundJobs, emailLogs } from '@/lib/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { processRFQWithAI } from '@/lib/services/ai-processor';
import { sendConfirmationEmail } from '@/lib/services/email-service';

export async function POST(request: NextRequest) {
  try {
    // Get pending jobs that are ready to run
    const now = new Date();
    const pendingJobs = await db.query.backgroundJobs.findMany({
      where: and(
        eq(backgroundJobs.status, 'Pending'),
        lte(backgroundJobs.scheduledFor, now)
      ),
      limit: 10,
    });
    
    const results = [];
    
    for (const job of pendingJobs) {
      try {
        // Mark as processing
        await db.update(backgroundJobs)
          .set({ status: 'Processing' })
          .where(eq(backgroundJobs.id, job.id));
        
        let result;
        
        switch (job.jobType) {
          case 'process_rfq':
            result = await processRFQWithAI(job.payload.rfqId);
            break;
            
          case 'send_confirmation':
            result = await sendConfirmationEmail(
              job.payload.customerEmail,
              job.payload.rfqNumber || 'RFQ'
            );
            
            // Log the outbound email
            await db.insert(emailLogs).values({
              rfqId: job.payload.rfqId,
              direction: 'Outbound',
              fromEmail: process.env.BUSINESS_EMAIL || 'quotes@optibiosupplements.com',
              toEmail: job.payload.customerEmail,
              subject: `RFQ Received - ${job.payload.rfqNumber}`,
              body: 'Confirmation email sent',
              status: 'Sent',
            });
            break;
            
          default:
            throw new Error(`Unknown job type: ${job.jobType}`);
        }
        
        // Mark as completed
        await db.update(backgroundJobs)
          .set({ 
            status: 'Completed',
            completedAt: new Date(),
          })
          .where(eq(backgroundJobs.id, job.id));
        
        results.push({ jobId: job.id, status: 'completed', result });
        
      } catch (error: any) {
        // Mark as failed
        await db.update(backgroundJobs)
          .set({ 
            status: 'Failed',
            error: error.message,
            attempts: job.attempts + 1,
          })
          .where(eq(backgroundJobs.id, job.id));
        
        results.push({ jobId: job.id, status: 'failed', error: error.message });
      }
    }
    
    return NextResponse.json({ 
      success: true,
      processed: results.length,
      results,
    });
    
  } catch (error) {
    console.error('Job processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process jobs' },
      { status: 500 }
    );
  }
}

