import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { shops } from '../utils/api.jsx';
import UpgradeModal from './UpgradeModal.jsx';

const ProtectedRoute = ({ user, shop, children, allowedWhenTrialExpired = false }) => {
  const [trialInfo, setTrialInfo] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTrialStatus();
  }, [shop]);

  const checkTrialStatus = async () => {
    if (!shop) {
      setLoading(false);
      return;
    }

    try {
      const response = await shops.checkTrialStatus(shop.id);
      setTrialInfo(response.data);

      // Show modal if trial expired and this route is not allowed during trial expiry
      if (response.data.is_trial_expired && !response.data.is_premium && !allowedWhenTrialExpired) {
        setShowUpgradeModal(true);
      }
      
      // Show modal if premium subscription has expired and this route is not allowed during trial expiry
      if (response.data.is_premium_expired && !allowedWhenTrialExpired) {
        setShowUpgradeModal(true);
      }
    } catch (err) {
      console.error('Failed to check trial status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  // Show upgrade modal if trial expired or premium expired and not allowed
  if ((trialInfo?.is_trial_expired || trialInfo?.is_premium_expired) && !allowedWhenTrialExpired) {
    return (
      <>
        {showUpgradeModal && (
          <UpgradeModal
            shop={shop}
            isOpen={true}
            isRenewal={trialInfo?.is_premium_expired}
            onClose={() => setShowUpgradeModal(false)}
            onUpgrade={() => window.location.reload()}
          />
        )}
        <div 
          style={{ 
            filter: 'blur(8px)', 
            pointerEvents: 'auto',
            padding: '2rem',
            userSelect: 'none',
            cursor: 'pointer',
          }}
          onClick={() => setShowUpgradeModal(true)}
        >
          {children}
        </div>
      </>
    );
  }

  return children;
};

export default ProtectedRoute;
