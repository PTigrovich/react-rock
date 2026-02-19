import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useCallback } from 'react';
import HomePage from './components/home/HomePage';
import ViewPage from './components/view/ViewPage';
import AdminPage from './components/admin/AdminPage';
import VideoSplashPage from './components/video/VideoSplashPage';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 минут

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const idleTimerRef = useRef(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    const isMenuOrStone = location.pathname === '/menu' || /^\/stone\/\d+$/.test(location.pathname);
    if (!isMenuOrStone) return;

    idleTimerRef.current = setTimeout(() => {
      navigate('/', { replace: true });
    }, IDLE_TIMEOUT_MS);
  }, [navigate, location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+Shift+A or Cmd+Shift+A to open admin
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        navigate('/admin');
        return;
      }
      resetIdleTimer();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, resetIdleTimer]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'touchstart', 'click', 'scroll'];
    events.forEach((ev) => document.addEventListener(ev, resetIdleTimer));
    return () => events.forEach((ev) => document.removeEventListener(ev, resetIdleTimer));
  }, [resetIdleTimer]);

  return (
    <Routes>
      <Route path="/" element={<VideoSplashPage />} />
      <Route path="/menu" element={<HomePage />} />
      <Route path="/stone/:id" element={<ViewPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
