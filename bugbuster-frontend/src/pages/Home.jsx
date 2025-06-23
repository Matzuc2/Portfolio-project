import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TitleCard from '../components/TitleCard';
import SearchBar from '../components/SearchBar';
import QuestionList from '../components/QuestionList';
import '../css/Home.css';

function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Récupérer la recherche depuis l'URL au chargement
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams]);

  const handleSearch = (query) => {
    // MODIFICATION : Cette fonction n'est plus utilisée pour la navigation
    // Elle sert maintenant uniquement pour la recherche en temps réel sur Home
    setSearchQuery(query);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="home-page">
      {/* Navigation d'authentification */}
      <div className="auth-nav">
        {isAuthenticated ? (
          <>
            <span className="user-welcome">
              Bonjour, {user?.username}
            </span>
            <button 
              onClick={handleLogout}
              className="auth-link logout-link"
            >
              🚪 Se déconnecter
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="auth-link login-link">
              🔑 Se connecter
            </Link>
            <Link to="/register" className="auth-link register-link">
              📝 S'inscrire
            </Link>
          </>
        )}
      </div>

      {/* Bouton pour poser une question */}
      {isAuthenticated && (
        <div className="ask-question-nav">
          <Link to="/ask" className="ask-question-btn">
            ❓ Poser une question
          </Link>
        </div>
      )}

      {/* Section du titre */}
      <div className="logo-section">
        <TitleCard />
      </div>

      {/* Section de recherche */}
      <div className="search-section">
        <SearchBar 
          onSearch={handleSearch} 
          initialValue={searchQuery}
        />
      </div>

      {/* Section des questions */}
      <div className="questions-section">
        <QuestionList searchQuery={searchQuery} />
      </div>
    </div>
  );
}

export default Home;