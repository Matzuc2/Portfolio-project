// wiki.js - Wiki route module.

import express from 'express';
import cors from 'cors';
import sequelize from './config/db.js';
import './models/associations.js';

// Import des routes
import authRoutes from './routes/auth.routes.js';
import questionRoutes from './routes/question.routes.js';
import answerRoutes from './routes/answer.routes.js';
import userRoutes from './routes/user.routes.js';
import tagRoutes from './routes/tag.routes.js';
import voteRoutes from './routes/vote.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3001',
      'http://127.0.0.1:3001'
    ];
    
    console.log('CORS - Origin:', origin);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS - Origin non autorisée:', origin);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // AJOUT de PATCH
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de logging pour debugger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes); // VÉRIFIER que cette ligne existe
app.use('/api/users', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/votes', voteRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API BugBuster en fonctionnement' });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  console.log(`Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie.');
    
    // Synchroniser les modèles
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés avec la base de données.');
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 API accessible sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur:', error);
    process.exit(1);
  }
};

startServer();

export default app;