import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import QuestionDetail from './pages/QuestionDetail';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route pour la page d'accueil */}
        <Route path="/" element={<Home />} />
        
        {/* Route pour les détails d'une question */}
        <Route path="/question/:id" element={<QuestionDetail />} />
        
        {/* Routes d'authentification */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Redirection pour les routes non trouvées */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;