import React, { useState, useEffect } from 'react';
import { X, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import Button from './Button';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './PaymentModal.css';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const PaymentModal = ({ isOpen, onClose, course, onConfirm }) => {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
    }
  }, [isOpen]);

  if (!isOpen || !course) return null;

  const handlePayment = async () => {
    try {
      setProcessing(true);

      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setProcessing(false);
        return;
      }

      // 1. Create order on our backend
      const amount = course.price || 49.99;
      const orderResponse = await api.post('/payments/create-order', {
        amount,
        course_id: course.id
      });

      if (!orderResponse.data.success) {
        alert('Failed to initialize payment. Please try again.');
        setProcessing(false);
        return;
      }

      const orderData = orderResponse.data.data;

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourFallbackKey', // Add key to your .env
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LMS Platform',
        description: `Enrollment for ${course.title}`,
        image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Optional logo
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              course_id: course.id
            });

            if (verifyRes.data.success) {
              setSuccess(true);
              setTimeout(async () => {
                await onConfirm(course);
                setSuccess(false);
              }, 1500);
            }
          } catch (err) {
            alert(err.response?.data?.message || 'Payment Verification Failed!');
            setProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#6366f1' // Brand primary color
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        alert(response.error.description || 'Payment Failed');
        setProcessing(false);
      });

      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert('Something went wrong during payment.');
      setProcessing(false);
    }
  };

  return (
    <div className="payment-modal-overlay animate-fade-in" onClick={!processing ? onClose : undefined}>
      <div className="payment-modal-container glass animate-slide-up" onClick={e => e.stopPropagation()}>
        {!processing && !success && (
          <div className="modal-close" onClick={onClose}><X size={24} /></div>
        )}
        
        {success ? (
          <div className="payment-success-state animate-fade-in">
            <CheckCircle size={64} color="#10b981" />
            <h2>Payment Successful!</h2>
            <p>Enrollment Confirmed!</p>
          </div>
        ) : (
          <>
            <div className="payment-header">
              <h2>Complete Your Purchase</h2>
              <p>You are about to enroll in <strong>{course.title}</strong></p>
            </div>

            <div className="payment-details">
              <div className="payment-row">
                <span>Course Price:</span>
                <span className="payment-amount">₹{course.price || '49.99'}</span>
              </div>
              <div className="payment-row">
                <span>Tax & Fees:</span>
                <span className="payment-amount">₹0.00</span>
              </div>
              <div className="payment-row total">
                <span>Total to Pay:</span>
                <span className="payment-total">₹{course.price || '49.99'}</span>
              </div>
            </div>

            <div className="payment-actions">
              <Button variant="primary" size="lg" className="full-width-btn" onClick={handlePayment} disabled={processing}>
                {processing ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing Payment...</>
                ) : (
                  <><CreditCard size={18} /> Pay ₹{course.price || '49.99'} & Enroll</>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
