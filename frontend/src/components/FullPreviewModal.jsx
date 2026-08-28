import { useEffect } from 'react';
import { FiX, FiMonitor, FiTablet, FiSmartphone } from 'react-icons/fi';
import ScaledPreview from './ScaledPreview';

export default function FullPreviewModal({ html, device, onDeviceChange, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px'
    }} onClick={onClose}>
      
      {/* Modal Actions */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1400px', marginBottom: '20px'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ color: 'white', fontWeight: 600, fontSize: '18px' }}>
          Inspect Output
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => onDeviceChange('desktop')}
              style={{ padding: '8px', background: device === 'desktop' ? 'white' : 'transparent', color: device === 'desktop' ? '#0f172a' : 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
            ><FiMonitor size={16} /></button>
            <button 
              onClick={() => onDeviceChange('tablet')}
              style={{ padding: '8px', background: device === 'tablet' ? 'white' : 'transparent', color: device === 'tablet' ? '#0f172a' : 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
            ><FiTablet size={16} /></button>
            <button 
              onClick={() => onDeviceChange('mobile')}
              style={{ padding: '8px', background: device === 'mobile' ? 'white' : 'transparent', color: device === 'mobile' ? '#0f172a' : 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
            ><FiSmartphone size={16} /></button>
          </div>
          
          <button 
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            Close <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Modal Content */}
      <div style={{
        position: 'relative',
        width: device === 'desktop' ? '100%' : 'auto',
        height: device === 'desktop' ? '100%' : '80vh', /* fill vertically for mobile/tablet */
        maxWidth: '100%',
        maxHeight: '100%',
        aspectRatio: device === 'mobile' ? '390/844' : device === 'tablet' ? '768/1024' : 'auto',
        background: 'white', 
        borderRadius: '16px', 
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)', 
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
        flexShrink: 1
      }} onClick={(e) => e.stopPropagation()}>
        <ScaledPreview html={html} device={device} title="Full Preview" />
      </div>
      
    </div>
  );
}
