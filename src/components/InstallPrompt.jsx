import { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Auto Update States
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Install prompt handler
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    // Auto Update Check
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              setUpdateAvailable(true);
              setWaitingWorker(newWorker);
              setShowUpdatePrompt(true);
            }
          });
        });
      });

      // Listen for controller change (after update)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload(); // Auto reload after update
      });
    }

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

  // Auto Update Handlers
  const handleUpdate = () => {
    if (waitingWorker) {
      // Show progress
      setUpdateProgress(50);
      
      // Send skip waiting message
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Complete progress
      setUpdateProgress(100);
      
      // Hide update prompt
      setTimeout(() => {
        setShowUpdatePrompt(false);
        setUpdateAvailable(false);
      }, 1000);
    }
  };

  const handleUpdateLater = () => {
    setShowUpdatePrompt(false);
    // Next visit এ আপডেট হবে
  };

  // Periodic Update Check (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          registration.update();
        });
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <>
      {/* Update Available Prompt */}
      {showUpdatePrompt && (
        <div className="update-prompt">
          <div className="update-content">
            <div className="update-icon">🔄</div>
            <div className="update-text">
              <h3>New Update Available!</h3>
              <p>A new version of Lift A Kids is ready</p>
              {updateProgress > 0 && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${updateProgress}%` }}
                  />
                </div>
              )}
            </div>
            <div className="update-actions">
              <button onClick={handleUpdate} className="update-btn">
                Update Now
              </button>
              <button onClick={handleUpdateLater} className="update-later-btn">
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install Prompt */}
      {!updateAvailable && showPrompt && (
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
        </div>
      )}

      <style jsx>{`
        .install-prompt, .update-prompt {
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

        .update-prompt {
          border-left: 4px solid #2563eb;
        }

        .install-content, .update-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .install-icon, .update-icon {
          text-align: center;
          font-size: 24px;
        }

        .install-text h3, .update-text h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .install-text p, .update-text p {
          margin: 0;
          font-size: 14px;
          color: #64748b;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          margin-top: 8px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #3b82f6);
          transition: width 0.3s ease;
          border-radius: 2px;
        }

        .install-actions, .update-actions {
          display: flex;
          gap: 8px;
        }

        .install-btn, .update-btn {
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

        .install-btn:hover, .update-btn:hover {
          background: #1d4ed8;
        }

        .dismiss-btn, .update-later-btn {
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

        .dismiss-btn:hover, .update-later-btn:hover {
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
          .install-prompt, .update-prompt {
            bottom: 10px;
            left: 10px;
            right: 10px;
            max-width: none;
          }
        }
      `}</style>
    </>
  );
};

export default InstallPrompt;