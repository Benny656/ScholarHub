import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Return immediately if script is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    
    // Dynamically inject the Razorpay checkout script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

interface PaymentButtonProps {
  courseId?: string;
  onSuccess?: () => void;
}

export function PaymentButton({ courseId, onSuccess }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      
      if (!isScriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your connection.');
        setLoading(false);
        return;
      }

      // 2. Call backend to get order_id
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const data = await response.json();

      // 3. Initialize Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
        amount: data.amount, // Set automatically from order response
        currency: data.currency || 'INR',
        name: 'ScholarHub Premium Enrollment',
        description: 'Course Enrollment Fee',
        order_id: data.order_id, 
        theme: {
          color: '#7C3AED', // Amethyst Theme Color
        },
        handler: async function (response: any) {
          // 4. Handle success callback
          console.log('Razorpay Payment ID:', response.razorpay_payment_id);
          
          try {
            await supabase.from('payments').insert({
              course_id: courseId || null,
              amount: data.amount ? data.amount / 100 : 5000,
              currency: data.currency || 'INR',
              status: 'captured',
              razorpay_order_id: data.order_id,
            });
          } catch (e) {
            console.error('Failed to log payment to dashboard:', e);
          }

          alert('Payment Successful! Welcome to the course.');
          if (onSuccess) onSuccess();
        },
      };

      // 5. Open Razorpay modal
      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any) {
        console.error('Payment failed error:', response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      paymentObject.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('Could not initiate payment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <span className="text-sm">💰</span>
      )}
      {loading ? 'Processing...' : 'Enroll & Pay'}
    </button>
  );
}

export default PaymentButton;
