import { supabase } from '../lib/supabase';

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export const paymentsService = {
  // Create Order function ready for Razorpay key integration
  async createOrder(courseId: string, amount: number): Promise<PaymentOrder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    console.log('[PaymentsService] Creating checkout order for Course:', courseId, 'Amount:', amount);

    // Mock API call to create Razorpay Order
    // In production, this would trigger an backend endpoint (or edge function):
    // POST https://api.razorpay.com/v1/orders
    // Authorization: Basic {base64(key_id:key_secret)}
    
    // Simulate server side order generation
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

    // Record the payment intent in Supabase database
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        amount,
        currency: 'INR',
        status: 'created',
        razorpay_order_id: mockOrderId,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: mockOrderId,
      amount,
      currency: 'INR',
      receipt: data.id,
      status: 'created',
    };
  },

  // Verify payment on successful response
  async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<boolean> {
    console.log('[PaymentsService] Verifying payment for Order:', razorpayOrderId, 'PaymentId:', razorpayPaymentId);
    
    // In production, you verify signature using HMAC SHA256:
    // const generated_signature = hmac_sha256(order_id + "|" + payment_id, secret);
    // if (generated_signature == signature) { payment is authentic }
    
    const isValid = razorpaySignature !== '';

    if (isValid) {
      // Update payment status in Supabase database
      const { error } = await supabase
        .from('payments')
        .update({ status: 'captured' })
        .eq('razorpay_order_id', razorpayOrderId);

      if (error) {
        console.error('Error updating payment status:', error);
      }
    }

    return isValid;
  }
};
