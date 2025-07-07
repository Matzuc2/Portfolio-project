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
  const [filters, setFilters] = useState({
    searchType: 'all',
    tags: [],
    sortBy: 'newest',
    dateFrom: '',
    dateTo: '',
    hasAnswers: undefined,
    isResolved: undefined
  });
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  // Récupérer la recherche depuis l'URL
  useEffect(() => {
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const tags = searchParams.get('tags');
    const sort = searchParams.get('sort');
    
    if (query || tags) { // MODIFICATION: Accepter aussi les recherches par tags uniquement
      if (query) setSearchQuery(query);
      
      // Appliquer les filtres depuis l'URL
      setFilters(prev => ({
        ...prev,
        searchType: type || 'all',
        sortBy: sort || 'newest',
        tags: tags ? tags.split(',') : []
      }));
    } else {
      // Si pas de recherche, rediriger vers l'accueil
      navigate('/');
    }
  }, [searchParams, navigate]);

  // Charger les questions avec statistiques
  useEffect(() => {
    loadQuestions();
  }, []);

  // Appliquer les filtres quand les questions ou filtres changent
  useEffect(() => {
    applyFilters();
  }, [questions, filters, searchQuery]);

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
    let filtered = [...questions];

    // Filtre de recherche textuelle OU tags depuis URL
    if (searchQuery && searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      
      filtered = filtered.filter(question => {
        const title = question.Title || question.title || '';
        const content = question.Content || question.content || '';
        
        // Recherche dans les tags si disponibles
        const tags = question.Tags || [];
        const tagNames = tags.map(tag => (tag.name || tag.Name || '').toLowerCase());

        switch (filters.searchType) {
          case 'title':
            return title.toLowerCase().includes(searchLower);
          case 'content':
            return content.toLowerCase().includes(searchLower);
          case 'tags':
            return tagNames.some(tagName => tagName.includes(searchLower));
          default: // 'all'
            return title.toLowerCase().includes(searchLower) || 
                   content.toLowerCase().includes(searchLower) ||
                   tagNames.some(tagName => tagName.includes(searchLower));
        }
      });
    }

    // Filtre par tags sélectionnés (priorité sur la recherche textuelle)
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(question => {
        const questionTags = question.Tags || [];
        const questionTagNames = questionTags.map(tag => tag.name || tag.Name || '');
        
        return filters.tags.some(filterTag => 
          questionTagNames.some(questionTag => 
            questionTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        );
      });
    }

    // Filtre par statut de résolution
    if (filters.isResolved !== undefined) {
      filtered = filtered.filter(question => {
        const hasAcceptedAnswer = question.stats?.hasAcceptedAnswer || false;
        return filters.isResolved ? hasAcceptedAnswer : !hasAcceptedAnswer;
      });
    }

    // Filtre par nombre de réponses
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

    // Tri (AMÉLIORÉ - sans options inutiles)
    if (filters.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (filters.sortBy) {
          case 'oldest':
            return new Date(a.CreatedAt || a.createdAt) - new Date(b.CreatedAt || b.createdAt);
          
          case 'most-votes':
            const scoreA = (a.stats?.questionUpvotes || 0) - (a.stats?.questionDownvotes || 0);
            const scoreB = (b.stats?.questionUpvotes || 0) - (b.stats?.questionDownvotes || 0);
            return scoreB - scoreA;
          
          case 'most-answers':
            const answersA = a.stats?.answerCount || 0;
            const answersB = b.stats?.answerCount || 0;
            return answersB - answersA;
          
          case 'unanswered':
            // D'abord les questions sans réponse, puis par date
            const hasAnswersA = (a.stats?.answerCount || 0) > 0 ? 1 : 0;
            const hasAnswersB = (b.stats?.answerCount || 0) > 0 ? 1 : 0;
            if (hasAnswersA !== hasAnswersB) {
              return hasAnswersA - hasAnswersB;
            }
            // Si même statut de réponse, trier par date (plus récent en premier)
            return new Date(b.CreatedAt || b.createdAt) - new Date(a.CreatedAt || a.createdAt);
          
          case 'activity':
            // Tri par activité globale (score total + réponses récentes)
            const activityScoreA = (a.stats?.totalScore || 0) + (a.stats?.answerCount || 0) * 2;
            const activityScoreB = (b.stats?.totalScore || 0) + (b.stats?.answerCount || 0) * 2;
            if (activityScoreA !== activityScoreB) {
              return activityScoreB - activityScoreA;
            }
            // Si même score d'activité, trier par date
            return new Date(b.CreatedAt || b.createdAt) - new Date(a.CreatedAt || a.createdAt);
          
          default: // 'newest'
            return new Date(b.CreatedAt || b.createdAt) - new Date(a.CreatedAt || a.createdAt);
        }
      });
    }

    setFilteredQuestions(filtered);
    setTotalResults(filtered.length);
  };

  const handleFiltersChange = (newFilters) => {
    console.log('Nouveaux filtres reçus:', newFilters);
    setFilters(newFilters);
  };

  // Fonction pour détecter si une section a des filtres actifs
  const getSectionActiveState = (sectionName) => {
    switch (sectionName) {
      case 'searchType':
        return filters.searchType && filters.searchType !== 'all';
      case 'tags':
        return filters.tags && filters.tags.length > 0;
      case 'status':
        return filters.isResolved !== undefined || filters.hasAnswers !== undefined;
      case 'sort':
        return filters.sortBy && filters.sortBy !== 'newest';
      default:
        return false;
    }
  };

  return (
    <div className="search-results-page">
      <div className="search-header">
        <div className="search-title-section">
          <TitleCard />
        </div>
        <div className="search-mini-search-section">
          <MiniSearchBar placeholder="Nouvelle recherche..." />
        </div>
      </div>

      <div className="search-content">
        {/* Sidebar de filtres */}
        <div className="search-sidebar">
          <FilterSidebar 
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />
        </div>

        {/* Résultats */}
        <div className="search-main">
          {/* Header des résultats */}
          <div className="results-header">
            <h1 className="results-title">
              {searchQuery ? (
                `Résultats pour "${searchQuery}"`
              ) : filters.tags.length > 0 ? (
                `Questions avec les tags: ${filters.tags.join(', ')}`
              ) : (
                'Résultats de recherche'
              )}
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
                  {searchQuery ? 
                    `Aucune question ne correspond à "${searchQuery}"` :
                    'Aucune question ne correspond aux critères sélectionnés'
                  }
                </p>
                <div className="no-results-suggestions">
                  <h4>Suggestions :</h4>
                  <ul>
                    <li>Vérifiez l'orthographe de vos mots-clés</li>
                    <li>Essayez des termes plus généraux</li>
                    <li>Supprimez certains filtres</li>
                    <li>Utilisez des synonymes</li>
                  </ul>
                </div>
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