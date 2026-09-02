import { useState, useEffect } from 'react';
import { FiX, FiMonitor, FiTablet, FiSmartphone, FiMinus, FiPlus, FiCommand } from 'react-icons/fi';
import ScaledPreview from './ScaledPreview';

export default function FullPreviewModal({ html, device, onDeviceChange, onClose }) {
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        const order = ['mobile', 'tablet', 'desktop'];
        const idx = order.indexOf(device);
        if (idx > 0) onDeviceChange(order[idx - 1]);
      }
      if (e.key === 'ArrowRight') {
        const order = ['mobile', 'tablet', 'desktop'];
        const idx = order.indexOf(device);
        if (idx < order.length - 1) onDeviceChange(order[idx + 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, device, onDeviceChange]);

  const zoomLevels = [50, 75, 100, 125, 150];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px'
    }} onClick={onClose}>
      
      {/* Frosted Glass Header Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1400px', marginBottom: '16px',
        background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '14px', padding: '12px 20px', border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Left: Browser chrome dots + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56', display: 'inline-block', cursor: 'pointer' }} onClick={onClose} title="Close" />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
          </div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em' }}>
            Inspect Output
          </div>
        </div>

        {/* Center: Device Toggle + Zoom */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Device Toggle */}
          <div style={{ display: 'flex', gap: '3px', background: 'rgba(255,255,255,0.08)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { key: 'desktop', icon: FiMonitor },
              { key: 'tablet', icon: FiTablet },
              { key: 'mobile', icon: FiSmartphone },
            ].map(({ key, icon: Icon }) => (
              <button 
                key={key}
                onClick={() => onDeviceChange(key)}
                style={{ 
                  padding: '7px 12px', 
                  background: device === key ? 'rgba(255,255,255,0.95)' : 'transparent', 
                  color: device === key ? '#0f172a' : 'rgba(255,255,255,0.6)', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  transition: 'all 0.2s',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'rgba(255,255,255,0.08)', padding: '3px 6px', borderRadius: '10px', 
            border: '1px solid rgba(255,255,255,0.1)' 
          }}>
            <button 
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              disabled={zoom <= 50}
              style={{ 
                padding: '6px', background: 'transparent', color: zoom <= 50 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', 
                border: 'none', borderRadius: '6px', cursor: zoom <= 50 ? 'not-allowed' : 'pointer', 
                display: 'flex', alignItems: 'center', transition: 'all 0.2s' 
              }}
            >
              <FiMinus size={13} />
            </button>
            <div style={{ 
              display: 'flex', gap: '2px', padding: '0 4px'
            }}>
              {zoomLevels.map((z) => (
                <button 
                  key={z} 
                  onClick={() => setZoom(z)}
                  style={{
                    padding: '4px 8px',
                    background: zoom === z ? 'rgba(255,255,255,0.9)' : 'transparent',
                    color: zoom === z ? '#0f172a' : 'rgba(255,255,255,0.5)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    minWidth: '36px'
                  }}
                >
                  {z}%
                </button>
              ))}
            </div>
            <button 
              onClick={() => setZoom(Math.min(150, zoom + 25))}
              disabled={zoom >= 150}
              style={{ 
                padding: '6px', background: 'transparent', color: zoom >= 150 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', 
                border: 'none', borderRadius: '6px', cursor: zoom >= 150 ? 'not-allowed' : 'pointer', 
                display: 'flex', alignItems: 'center', transition: 'all 0.2s' 
              }}
            >
              <FiPlus size={13} />
            </button>
          </div>
        </div>

        {/* Right: Keyboard hints + Close */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Keyboard Hints */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ 
              display: 'flex', alignItems: 'center', gap: '4px', 
              fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 
            }}>
              <kbd style={{ 
                padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', 
                border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.62rem', fontWeight: 600, 
                fontFamily: 'inherit', color: 'rgba(255,255,255,0.5)' 
              }}>ESC</kbd>
              close
            </span>
            <span style={{ 
              display: 'flex', alignItems: 'center', gap: '4px', 
              fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 
            }}>
              <kbd style={{ 
                padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', 
                border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.62rem', fontWeight: 600, 
                fontFamily: 'inherit', color: 'rgba(255,255,255,0.5)' 
              }}>←→</kbd>
              device
            </span>
          </div>

          <button 
            onClick={onClose}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
              background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', 
              borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', 
              transition: 'all 0.2s', backdropFilter: 'blur(4px)' 
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            Close <FiX size={16} />
          </button>
        </div>
      </div>

      {/* Modal Content */}
      <div style={{
        position: 'relative',
        width: device === 'desktop' ? '100%' : 'auto',
        height: device === 'desktop' ? '100%' : '85vh',
        maxWidth: '100%',
        maxHeight: '100%',
        aspectRatio: device === 'mobile' ? '390/844' : device === 'tablet' ? '768/1024' : 'auto',
        background: 'white', 
        borderRadius: '14px', 
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)', 
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        flexShrink: 1,
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top center'
      }} onClick={(e) => e.stopPropagation()}>
        <ScaledPreview html={html} device={device} title="Full Preview" />
      </div>
      
    </div>
  );
}
