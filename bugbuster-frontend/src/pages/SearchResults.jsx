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

  // Charger les questions
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
            // TODO: Implémenter la recherche par tags quand les tags seront liés aux questions
            return false;
          default: // 'all'
            return title.toLowerCase().includes(searchLower) || 
                   content.toLowerCase().includes(searchLower);
        }
      });
    }

    // Filtre par tags
    if (filters.tags && filters.tags.length > 0) {
      // TODO: Implémenter le filtrage par tags quand les tags seront liés aux questions
      // Pour l'instant, on simule avec des données factices
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

    // Tri
    if (filters.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (filters.sortBy) {
          case 'oldest':
            return new Date(a.CreatedAt || a.createdAt) - new Date(b.CreatedAt || b.createdAt);
          case 'most-votes':
            return (b.votes || 0) - (a.votes || 0);
          case 'most-answers':
            return (b.answerCount || 0) - (a.answerCount || 0);
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

  const handleSearch = (newQuery) => {
    if (newQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(newQuery)}`);
    } else {
      navigate('/');
    }
  };

  if (!searchQuery) {
    return null; // Redirection en cours
  }

  return (
    <div className="search-results-page">
      {/* Header */}
      <div className="search-header">
        <div className="search-title-section">
          <TitleCard />
        </div>
        <div className="search-mini-search-section">
          <MiniSearchBar />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="search-content">
        {/* Sidebar des filtres */}
        <div className="search-sidebar">
          <FilterSidebar
            onFiltersChange={handleFiltersChange}
            initialFilters={{
              searchType: 'all',
              sortBy: 'newest'
            }}
          />
        </div>

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

          {/* Liste des questions */}
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
                  Essayez de modifier vos termes de recherche ou vos filtres.
                </p>
                <div className="no-results-suggestions">
                  <h4>Suggestions :</h4>
                  <ul>
                    <li>Vérifiez l'orthographe de vos mots-clés</li>
                    <li>Utilisez des termes plus généraux</li>
                    <li>Essayez différents mots-clés</li>
                    <li>Supprimez certains filtres</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchResults;