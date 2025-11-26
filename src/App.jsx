import { Routes, Route } from "react-router-dom";
import HomePage from "./components/home/HomePage";
import ViewPage from './components/view/ViewPage';
import './App.css';

function App() {
  return (
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stone/:id" element={<ViewPage />} />
      </Routes>
  );
}

export default App;
