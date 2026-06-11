import { supabase } from '../lib/supabase';

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export const paymentsService = {
  async createOrder(courseId: string, amount: number): Promise<PaymentOrder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    console.log('[PaymentsService] Creating checkout order for Course:', courseId, 'Amount:', amount);

    const mockOrderId = `order_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

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
      .single() as any;

    if (error) throw error;

    return {
      id: mockOrderId,
      amount,
      currency: 'INR',
      receipt: data.id,
      status: 'created',
    };
  },

  async verifyPayment(orderId: string, _razorpayPaymentId?: string, _razorpaySignature?: string): Promise<boolean> {
    console.log('[PaymentsService] Verifying payment for Order:', orderId);
    
    const isValid = (_razorpaySignature !== undefined ? _razorpaySignature !== '' : true);

    if (isValid) {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'captured' })
        .eq('razorpay_order_id', orderId);

      if (error) {
        console.error('Error updating payment status:', error);
      }
    }

    return isValid;
  }
};
