import React, { useState } from 'react';
import { shops } from '../utils/api.jsx';

const UpgradePlanModal = ({ shop, isOpen, onClose, onUpgrade }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  if (!isOpen) return null;
  if (!shop) return null;

  // Pricing based on country
  const pricing = {
    'India': { amount: 899, currency: '₹', period: 'per month' },
    'default': { amount: 20, currency: '$', period: 'per month' },
  };

  const price = pricing[shop.country] || pricing['default'];

  // Payment methods based on country
  const paymentMethods = shop.country === 'India'
    ? [
        { id: 'upi', name: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
        { id: 'card', name: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard' },
        { id: 'netbanking', name: 'Net Banking', icon: '🏦', desc: 'All major banks' },
      ]
    : [
        { id: 'card', name: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
      ];

  const features = [
    '✓ Unlimited Appointments',
    '✓ Multiple Barbers',
    '✓ Customer Management',
    '✓ Booking Analytics',
    '✓ Premium Support',
    '✓ WhatsApp Integration',
  ];

  const handlePaymentMethod = async (methodId) => {
    setIsLoading(true);
    try {
      handleRazorpayPayment(methodId);
    } catch (err) {
      alert('Payment gateway error: ' + err.message);
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleRazorpayPayment = async (methodId) => {
    try {
      const isIndia = shop.country === 'India';
      const currency = isIndia ? 'INR' : 'USD';
      const amount = price.amount * 100;
      const paymentMethod = isIndia && methodId === 'upi' ? 'upi' : 'card';

      const options = {
        key: 'rzp_test_RpvVPNs4PXPDQn',
        amount: amount,
        currency: currency,
        name: 'Meazebook',
        description: `Premium Plan - ${price.currency}${price.amount}/${price.period}`,
        prefill: {
          email: localStorage.getItem('email') || '',
        },
        method: paymentMethod,
        notes: {
          shop_id: shop.id,
          payment_method: methodId,
          gateway: 'razorpay',
        },
        handler: async (response) => {
          try {
            const result = await shops.recordPayment(shop.id, {
              payment_id: response.razorpay_payment_id,
              method: methodId,
              amount: price.amount,
              currency: isIndia ? 'INR' : 'USD',
              gateway: 'razorpay',
            });

            if (result.data.success) {
              alert('✓ Payment successful! Your premium access is now active.');
              setSelectedMethod(null);
              await onUpgrade();
            }
          } catch (err) {
            alert('Payment recorded but verification failed. Contact support.');
            console.error(err);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const razorpay = new window.Razorpay(options);
          razorpay.open();
        };
        document.body.appendChild(script);
      } else {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (err) {
      alert('Razorpay error: ' + err.message);
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666',
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
          <h2 style={{ color: '#2c3e50', marginBottom: '0.5rem', fontSize: '1.8rem' }}>
            Upgrade to Premium
          </h2>
          <p style={{ color: '#666', marginBottom: '0' }}>
            Unlock all features and grow your business
          </p>
        </div>

        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Premium Features:
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {features.map((feature, idx) => (
              <div key={idx} style={{ color: '#27ae60', fontSize: '0.95rem' }}>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          padding: '1.5rem',
          color: 'white',
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {price.currency}{price.amount}
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>
            {price.period}
          </div>
        </div>

        {!selectedMethod ? (
          <div>
            <h3 style={{ color: '#2c3e50', marginBottom: '1rem', fontSize: '1.05rem' }}>
              Choose Payment Method:
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  disabled={isLoading}
                  style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '1rem',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {method.icon}
                  </div>
                  <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#2c3e50' }}>
                    {method.name}
                  </strong>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    {method.desc}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                background: '#f5f5f5',
                color: '#666',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => handlePaymentMethod(selectedMethod)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '6px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '1rem',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Processing...' : `Continue to Payment`}
            </button>
            <button
              onClick={() => setSelectedMethod(null)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                background: '#f5f5f5',
                color: '#666',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradePlanModal;
