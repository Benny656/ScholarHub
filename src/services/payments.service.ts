import { apiClient } from '../lib/apiClient';

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export const paymentsService = {
  async createOrder(courseId: string, amount: number): Promise<PaymentOrder> {
    console.log('[PaymentsService] Creating checkout order via Backend for Course:', courseId, 'Amount:', amount);
    return apiClient.post<PaymentOrder>('/payments/order', { courseId, amount });
  },

  async verifyPayment(orderId: string, razorpayPaymentId?: string, razorpaySignature?: string, courseId?: string): Promise<boolean> {
    console.log('[PaymentsService] Verifying payment via Backend for Order:', orderId);
    try {
      const response = await apiClient.post<any>('/payments/verify', {
        orderId,
        razorpayPaymentId,
        razorpaySignature,
        courseId
      });
      return response.success === true;
    } catch (error) {
      console.error('Error verifying payment on backend:', error);
      return false;
    }
  }
};
