import { useEffect, useRef } from 'react';

export default function useIdleTimer(timeout, onIdle) {
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onIdle, timeout);
  };

  useEffect(() => {
    // Daftarkan event-event aktivitas pengguna (klik, gerakan mouse, dan keyboard)
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Set timer awal
    resetTimer();

    // Cleanup event listener pada unmount
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeout, onIdle]);
}