import { useState, useEffect, useCallback } from 'react';

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
  const [currentVersion, setCurrentVersion] = useState('v1');

  // Check if app is installed
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsStandalone(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Install prompt handler
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Don't show install prompt if already installed or update available
      if (!isStandalone && !updateAvailable) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isStandalone, updateAvailable]);

  // Service Worker and Auto Update Setup
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
          
          // Check for updates every 5 minutes
          setInterval(() => {
            registration.update();
            console.log('🔄 Checking for updates...');
          }, 5 * 60 * 1000);
          
          // Listen for new service worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🆕 New service worker found');
            
            setUpdateProgress(30);
            
            newWorker.addEventListener('statechange', () => {
              console.log('🔄 Service Worker state:', newWorker.state);
              
              if (newWorker.state === 'installed') {
                setUpdateProgress(60);
                
                if (navigator.serviceWorker.controller) {
                  // New version available
                  console.log('✨ New version available!');
                  setUpdateAvailable(true);
                  setWaitingWorker(newWorker);
                  setShowUpdatePrompt(true);
                  setUpdateProgress(100);
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message from SW:', event.data);
        
        if (event.data && event.data.type === 'SW_UPDATED') {
          setCurrentVersion(event.data.payload.version);
        }
      });

      // Handle controller change (after update)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Controller changed, reloading...');
        window.location.reload();
      });
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('✅ User accepted install');
          setShowPrompt(false);
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Install failed:', error);
      }
    }
  };

  const handleDismiss = () => {
    setDeferredPrompt(null);
    setShowPrompt(false);
    // Store in localStorage to not show again for a while
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Auto Update Handlers
  const handleUpdate = useCallback(() => {
    if (waitingWorker) {
      setUpdateProgress(50);
      
      // Send message to service worker
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      setUpdateProgress(100);
      
      setTimeout(() => {
        setShowUpdatePrompt(false);
        setUpdateAvailable(false);
      }, 500);
    }
  }, [waitingWorker]);

  const handleUpdateLater = () => {
    setShowUpdatePrompt(false);
    // Next visit এ আপডেট হবে
  };

  // Manual update check
  const checkForUpdates = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        registration.update();
        setUpdateProgress(20);
      });
    }
  }, []);

  // Don't show if installed
  if (isStandalone) {
    return (
      <>
        {updateAvailable && showUpdatePrompt && (
          <div className="update-prompt">
            <div className="update-content">
              <div className="update-icon">🔄</div>
              <div className="update-text">
                <h3>New Update Available!</h3>
                <p>Version {currentVersion} → New Version</p>
                <p className="update-description">New features and improvements</p>
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
      </>
    );
  }

  return (
    <>
      {/* Update Available Prompt */}
      {updateAvailable && showUpdatePrompt && (
        <div className="update-prompt">
          <div className="update-content">
            <div className="update-icon">🔄</div>
            <div className="update-text">
              <h3>New Update Available!</h3>
              <p>Version {currentVersion} → New Version</p>
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

      {/* Manual Update Check (optional) */}
      {!updateAvailable && !showPrompt && (
        <div className="update-check" onClick={checkForUpdates}>
          <span>🔄</span>
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
          background: linear-gradient(to bottom right, white, #f8fafc);
        }

        .install-content, .update-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .install-icon, .update-icon {
          text-align: center;
          font-size: 32px;
          animation: pulse 2s infinite;
        }

        .install-text h3, .update-text h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .install-text p, .update-text p {
          margin: 0;
          font-size: 14px;
          color: #64748b;
        }

        .update-description {
          font-size: 12px;
          color: #2563eb;
          margin-top: 4px;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          margin-top: 8px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #3b82f6, #2563eb);
          transition: width 0.3s ease;
          border-radius: 3px;
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
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
          transition: all 0.2s;
        }

        .install-btn:hover, .update-btn:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
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
          transition: all 0.2s;
        }

        .dismiss-btn:hover, .update-later-btn:hover {
          background: #e2e8f0;
          transform: translateY(-2px);
        }

        .update-check {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s;
          z-index: 1000;
        }

        .update-check:hover {
          transform: rotate(180deg);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
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

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
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