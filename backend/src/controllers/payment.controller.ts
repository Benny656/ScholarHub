import { Response, Request } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getSupabaseForUser } from '../config/supabase.js';
import crypto from 'crypto';

export const paymentController = {
  async createOrder(req: Request | any, res: Response) {
    try {
      const { amount } = req.body;

      const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;

      if (!key_id || !key_secret) {
        console.error('[Payment] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET env variables.');
        return res.status(500).json({ error: 'Payment gateway is not configured on the server.' });
      }

      // Use btoa() — the Web-standard Base64 encoder available in Cloudflare Workers & modern Node.
      const basicAuth = btoa(`${key_id}:${key_secret}`);

      const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount || 50000, // Amount in paise (500 INR)
          currency: 'INR',
          receipt: 'receipt_' + Date.now(),
        }),
      });

      const order = await razorpayResponse.json() as any;

      if (!razorpayResponse.ok) {
        // Log the exact Razorpay error body for debugging
        console.error('[Payment] Razorpay order creation failed:', JSON.stringify(order.error ?? order, null, 2));
        return res.status(razorpayResponse.status).json({
          error: order.error?.description || order.error || 'Failed to create Razorpay order.',
        });
      }



      // Return the fields the frontend PaymentButton expects
      return res.status(201).json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    } catch (error: any) {
      console.error('[Payment] createOrder unexpected error:', error);
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  // POST /api/payments/verify
  async verifyPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const { orderId, razorpayPaymentId, razorpaySignature, courseId } = req.body;
      const userId = req.user!.id;
      const userClient = getSupabaseForUser(req.user!.token);

      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      let isValid = true;

      if (keySecret && razorpaySignature && razorpayPaymentId) {
        const generatedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(`${orderId}|${razorpayPaymentId}`)
          .digest('hex');
        
        isValid = generatedSignature === razorpaySignature;
      }

      if (isValid) {
        // Update payment status in database
        const { error: updateError } = await userClient
          .from('payments')
          .update({ status: 'captured' })
          .eq('razorpay_order_id', orderId);

        if (updateError) {
          console.error('Failed to update payment status:', updateError.message);
        }

        // Enroll the student in the course
        const { error: enrollError } = await userClient
          .from('enrollments')
          .insert({
            student_id: userId,
            course_id: courseId,
            progress: 0
          });

        if (enrollError) {
          console.error('Failed to enroll student after payment:', enrollError.message);
        }

        res.json({ success: true, enrolled: true });
      } else {
        res.status(400).json({ success: false, error: 'Signature verification failed' });
      }
    } catch (error: any) {
      console.error('verifyPayment error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
};
