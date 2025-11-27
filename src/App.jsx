import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './components/home/HomePage';
import ViewPage from './components/view/ViewPage';
import AdminPage from './components/admin/AdminPage';
import './App.css';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+Shift+A or Cmd+Shift+A to open admin
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        navigate('/admin');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/stone/:id' element={<ViewPage />} />
      <Route path='/admin' element={<AdminPage />} />
    </Routes>
  );
}

export default App;
