import React, { useState } from 'react';
import { shops } from '../utils/api.jsx';

const UpgradeModal = ({ shop, isOpen, onClose, onUpgrade, isRenewal = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);

  // IMPORTANT: Return null immediately if not open - this prevents rendering completely
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
      // Get currency and amount based on country
      const isIndia = shop.country === 'India';
      const currency = isIndia ? 'INR' : 'USD';
      const amount = price.amount * 100; // Razorpay expects amount in paise (INR) or cents (USD)
      const paymentMethod = isIndia && methodId === 'upi' ? 'upi' : 'card';

      const options = {
        key: 'rzp_test_RpvVPNs4PXPDQn', // Razorpay Test Key ID
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
              setShowPaymentMethod(false);
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
      filter: 'none',
      backdropFilter: 'none',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {isRenewal ? '🔄' : '⏰'}
        </div>
        <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
          {isRenewal ? 'Subscription Expired' : 'Trial Period Expired'}
        </h2>
        
        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
          {isRenewal 
            ? 'Your premium subscription has ended. Renew now to continue using all features.'
            : 'Your 3-day free trial has ended. Upgrade to continue using Meazebook.'}
        </p>

        <div style={{
          backgroundColor: '#f9f9f9',
          border: '2px solid #3498db',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <p style={{ color: '#7f8c8d', marginBottom: '0.5rem' }}>Just</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3498db', margin: '0.5rem 0' }}>
            {price.currency}{price.amount}
          </div>
          <p style={{ color: '#7f8c8d', margin: 0 }}>{price.period}</p>
          {shop.country && (
            <small style={{ display: 'block', marginTop: '0.5rem', color: '#999' }}>
              Based on your location: {shop.country}
            </small>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <h4 style={{ color: '#2c3e50', marginBottom: '1rem' }}>What You Get:</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#666' }}>
            <li style={{ marginBottom: '0.75rem' }}>✓ Unlimited appointments</li>
            <li style={{ marginBottom: '0.75rem' }}>✓ Unlimited barbers</li>
            <li style={{ marginBottom: '0.75rem' }}>✓ Unlimited services</li>
            <li style={{ marginBottom: '0.75rem' }}>✓ Priority support</li>
            <li>✓ WhatsApp notifications</li>
          </ul>
        </div>

        {!showPaymentMethod ? (
          <>
            <button
              onClick={() => setShowPaymentMethod(true)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginBottom: '0.75rem',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Processing...' : `${isRenewal ? 'Renew' : 'Upgrade'} Now - ${price.currency}${price.amount}`}
            </button>

            <button
              onClick={() => {
                console.log('Cancel button clicked, calling onClose');
                onClose();
              }}
              disabled={false}
              style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: 1,
              }}
              title="Close modal (page stays blurred)"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h3 style={{ color: '#2c3e50', marginBottom: '1rem', fontSize: '1.1rem' }}>Select Payment Method</h3>
            <div style={{ marginBottom: '1rem' }}>
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethod(method.id)}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    marginBottom: '0.75rem',
                    backgroundColor: isLoading ? '#ecf0f1' : '#f9f9f9',
                    border: '2px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => !isLoading && (e.target.style.borderColor = '#3498db')}
                  onMouseLeave={(e) => !isLoading && (e.target.style.borderColor = '#bdc3c7')}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{method.icon}</div>
                  <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{method.name}</div>
                  <small style={{ color: '#7f8c8d' }}>{method.desc}</small>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPaymentMethod(false)} // Go back to main view
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: '2px solid #7f8c8d',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
              title="Go back to upgrade options"
            >
              ← Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UpgradeModal;
