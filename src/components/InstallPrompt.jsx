import { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  // Don't show if already installed or on iOS (iOS has different install flow)
  if (isStandalone || !showPrompt) return null;

  return (
    <div className="install-prompt">
      <div className="install-content">
        <div className="install-icon">
          <span>📱</span>
        </div>
        <div className="install-text">
          <h3>Install Lift A Kids</h3>
          <p>Get the app experience with faster access</p>
        </div>
        <div className="install-actions">
          <button onClick={handleInstall} className="install-btn">
            Install
          </button>
          <button onClick={handleDismiss} className="dismiss-btn">
            Later
          </button>
        </div>
      </div>

      <style jsx>{`
        .install-prompt {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
          z-index: 1000;
          max-width: 320px;
          animation: slideIn 0.3s ease-out;
        }

        .install-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .install-icon {
          text-align: center;
          font-size: 24px;
        }

        .install-text h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .install-text p {
          margin: 0;
          font-size: 14px;
          color: #64748b;
        }

        .install-actions {
          display: flex;
          gap: 8px;
        }

        .install-btn {
          flex: 1;
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .install-btn:hover {
          background: #1d4ed8;
        }

        .dismiss-btn {
          flex: 1;
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .dismiss-btn:hover {
          background: #e2e8f0;
        }

        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .install-prompt {
            bottom: 10px;
            left: 10px;
            right: 10px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default InstallPrompt;