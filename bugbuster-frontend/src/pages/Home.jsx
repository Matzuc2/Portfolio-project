import React from 'react';
import { Link } from 'react-router-dom';
import TitleCard from '../components/TitleCard';
import '../css/Home.css'
import QuestionList from '../components/QuestionList';
import SearchBar from '../components/SearchBar';

function Home() {
  return (
    <div className="home-page">
      {/* AJOUT UNIQUEMENT - Navigation d'authentification */}
      <div className="auth-nav">
        <Link to="/login" className="auth-link login-link">
          🔑 Connexion
        </Link>
        <Link to="/register" className="auth-link register-link">
          📝 Inscription
        </Link>
      </div>

      {/* Votre code existant - AUCUN CHANGEMENT */}
      <div className="logo-section">
        <TitleCard />
      </div>

      <div className="search-section">
        <SearchBar />
      </div>

      <div className="questions-section">
        <QuestionList />
      </div>
    </div>
  );
}

export default Home;