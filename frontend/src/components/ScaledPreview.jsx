import { useRef, useEffect } from 'react';

const DEVICE_SIZES = {
  desktop: { w: 1200, h: 800 },
  tablet:  { w: 768,  h: 1024 },
  mobile:  { w: 390,  h: 844 },
};

export default function ScaledPreview({ html, device = 'desktop', title = "Preview" }) {
  const wrapperRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current && html) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [html]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const iframe = iframeRef.current;
    if (!wrapper || !iframe || !html) return;

    const recalc = () => {
      const vw = DEVICE_SIZES[device]?.w || DEVICE_SIZES.desktop.w;
      const cw = wrapper.clientWidth;
      const ch = wrapper.clientHeight;
      if (cw === 0 || ch === 0) return;

      // Real responsive scaling:
      // The viewport width is strictly the device width (e.g. 390px for mobile).
      // We scale it so the 390px perfectly fills the container width (cw).
      const scale = cw / vw;
      
      // To fill the container height exactly without white margins, 
      // the iframe's height must be the container height divided by the scale.
      const vh = ch / scale;

      iframe.style.width = vw + 'px';
      iframe.style.height = vh + 'px';
      iframe.style.transform = `scale(${scale})`;
      iframe.style.transformOrigin = 'top left';
      
      // No margins needed since it perfectly fills the container
      iframe.style.marginLeft = '0px';
      iframe.style.marginTop = '0px';
    };

    const ro = new ResizeObserver(recalc);
    ro.observe(wrapper);
    requestAnimationFrame(recalc);
    return () => ro.disconnect();
  }, [device, html]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: 'white' }}>
      {html ? (
        <iframe
          ref={iframeRef}
          title={title}
          sandbox="allow-scripts allow-same-origin"
          scrolling="no"
          style={{ position: 'absolute', top: 0, left: 0, border: 'none', pointerEvents: 'none' }}
        />
      ) : null}
    </div>
  );
}
