import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TitleCard from '../components/TitleCard';
import MiniSearchBar from '../components/MiniSearchBar';
import FilterSidebar from '../components/FilterSidebar';
import QuestionList from '../components/QuestionList';
import questionService from '../services/questionService';
import { useNotification } from '../hooks/useNotification';
import '../css/SearchResults.css';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showError, showInfo } = useNotification();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  // Récupérer la recherche depuis l'URL
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    } else {
      // Si pas de recherche, rediriger vers l'accueil
      navigate('/');
    }
  }, [searchParams, navigate]);

  // Charger les questions avec statistiques
  useEffect(() => {
    if (searchQuery) {
      loadQuestions();
    }
  }, [searchQuery]);

  // Appliquer les filtres
  useEffect(() => {
    applyFilters();
  }, [questions, filters]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      // MODIFICATION : Utiliser le même service avec statistiques
      const result = await questionService.getAllQuestions();
      
      if (result.success) {
        setQuestions(result.data);
      } else {
        showError('Erreur lors du chargement des questions');
        setQuestions([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      showError('Erreur de connexion au serveur');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = questions;

    // Filtre de recherche textuelle
    if (searchQuery.trim()) {
      filtered = filtered.filter(question => {
        const title = question.Title || question.title || '';
        const content = question.Content || question.content || '';
        const searchLower = searchQuery.toLowerCase();

        switch (filters.searchType) {
          case 'title':
            return title.toLowerCase().includes(searchLower);
          case 'content':
            return content.toLowerCase().includes(searchLower);
          case 'tags':
            // TODO: Implémenter la recherche par tags
            return false;
          default: // 'all'
            return title.toLowerCase().includes(searchLower) || 
                   content.toLowerCase().includes(searchLower);
        }
      });
    }

    // NOUVEAU: Filtre par statut de résolution
    if (filters.isResolved !== undefined) {
      filtered = filtered.filter(question => {
        const hasAcceptedAnswer = question.stats?.hasAcceptedAnswer || false;
        return filters.isResolved ? hasAcceptedAnswer : !hasAcceptedAnswer;
      });
    }

    // NOUVEAU: Filtre par nombre de réponses
    if (filters.hasAnswers !== undefined) {
      filtered = filtered.filter(question => {
        const answerCount = question.stats?.answerCount || 0;
        return filters.hasAnswers ? answerCount > 0 : answerCount === 0;
      });
    }

    // Filtre par date
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(question => {
        const questionDate = new Date(question.CreatedAt || question.createdAt);
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

        if (fromDate && questionDate < fromDate) return false;
        if (toDate && questionDate > toDate) return false;
        return true;
      });
    }

    // Tri avec nouvelles options
    if (filters.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (filters.sortBy) {
          case 'oldest':
            return new Date(a.CreatedAt || a.createdAt) - new Date(b.CreatedAt || b.createdAt);
          case 'most-votes':
            const scoreA = a.stats?.score || 0;
            const scoreB = b.stats?.score || 0;
            return scoreB - scoreA;
          case 'most-answers':
            const answersA = a.stats?.answerCount || 0;
            const answersB = b.stats?.answerCount || 0;
            return answersB - answersA;
          case 'unanswered':
            const hasAnswersA = (a.stats?.answerCount || 0) > 0 ? 1 : 0;
            const hasAnswersB = (b.stats?.answerCount || 0) > 0 ? 1 : 0;
            return hasAnswersA - hasAnswersB;
          default: // 'newest'
            return new Date(b.CreatedAt || b.createdAt) - new Date(a.CreatedAt || a.createdAt);
        }
      });
    }

    setFilteredQuestions(filtered);
    setTotalResults(filtered.length);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="search-results-page">
      <div className="header-section">
        <div className="title-section">
          <TitleCard />
        </div>
        <div className="mini-search-section">
          <MiniSearchBar initialValue={searchQuery} />
        </div>
      </div>

      <div className="search-content">
        {/* Sidebar de filtres */}
        <FilterSidebar 
          onFiltersChange={handleFiltersChange}
          totalResults={totalResults}
        />

        {/* Résultats */}
        <div className="search-main">
          {/* Header des résultats */}
          <div className="results-header">
            <h1 className="results-title">
              Résultats pour "{searchQuery}"
            </h1>
            <div className="results-info">
              {loading ? (
                'Recherche en cours...'
              ) : (
                `${totalResults} résultat${totalResults > 1 ? 's' : ''} trouvé${totalResults > 1 ? 's' : ''}`
              )}
            </div>
          </div>

          {/* Liste des questions avec statistiques */}
          <div className="results-list">
            {loading ? (
              <div className="loading-results">
                <p>Chargement des résultats...</p>
              </div>
            ) : filteredQuestions.length > 0 ? (
              <QuestionList 
                questions={filteredQuestions}
                showAsResults={true}
              />
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3 className="no-results-title">Aucun résultat trouvé</h3>
                <p className="no-results-message">
                  Essayez de modifier vos critères de recherche ou filtres.
                </p>
                <button 
                  className="back-to-home-btn"
                  onClick={() => navigate('/')}
                >
                  Retour à l'accueil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchResults;