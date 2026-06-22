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

  // Absolute URL to the live Render backend — avoids 405s from the Cloudflare frontend domain
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://scholarhub-backend-bcij.onrender.com';

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

      // 2. Retrieve the active session token — required by the backend's auth middleware
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert('Your session has expired. Please log in again to complete your purchase.');
        setLoading(false);
        return;
      }

      // 3. Call backend to create a Razorpay order
      const response = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 50000 }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[PaymentButton] Order creation failed:', data.error);
        throw new Error(data.error || 'Failed to create payment order');
      }

      // 4. Initialize Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
        amount: data.amount, // Set automatically from order response
        currency: data.currency || 'INR',
        name: 'ScholarHub Premium Enrollment',
        description: 'Course Enrollment Fee',
        order_id: data.order_id, 
        theme: {
          color: '#9d95ff', // Amethyst Theme Color
        },
        handler: async function (rzpResponse: any) {
          // 4. Handle success — verify on the backend so it can flip status to 'captured'
          console.log('Razorpay Payment ID:', rzpResponse.razorpay_payment_id);

          try {
            await fetch(`${BACKEND_URL}/api/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: data.order_id,
                razorpayPaymentId: rzpResponse.razorpay_payment_id,
                razorpaySignature: rzpResponse.razorpay_signature,
                courseId,
              }),
            });
          } catch (e) {
            console.error('[PaymentButton] Verify call failed (non-fatal):', e);
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
      className="bg-[#9d95ff] hover:bg-[#9d95ff] text-[#E1DCC9] px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-[#9d95ff]/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-[#E1DCC9]/30 border-t-white rounded-full animate-spin" />
      ) : (
        <span className="text-sm">💰</span>
      )}
      {loading ? 'Processing...' : 'Enroll & Pay'}
    </button>
  );
}

export default PaymentButton;
