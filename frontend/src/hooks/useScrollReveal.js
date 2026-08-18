import { useEffect, useRef } from 'react';

/**
 * Custom hook that applies scroll-reveal animations using Intersection Observer.
 * Adds 'reveal-visible' class to elements with 'reveal' class when they enter viewport.
 * Respects prefers-reduced-motion.
 */
export default function useScrollReveal(containerRef, options = {}) {
  const observerRef = useRef(null);

  useEffect(() => {
    // Respect reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Immediately show all reveal elements
      const container = containerRef?.current || document;
      const elements = container.querySelectorAll('.reveal');
      elements.forEach(el => el.classList.add('reveal-visible'));
      return;
    }

    const { threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = options;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    const container = containerRef?.current || document;
    const elements = container.querySelectorAll('.reveal');
    elements.forEach(el => observerRef.current.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [containerRef, options.threshold, options.rootMargin]);
}
