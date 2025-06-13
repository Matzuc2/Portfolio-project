// wiki.js - Wiki route module.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db.js';

// Import des routes
import authRoutes from './routes/auth.routes.js';
import questionRoutes from './routes/question.routes.js';
import answerRoutes from './routes/answer.routes.js';
import tagRoutes from './routes/tag.routes.js';
import voteRoutes from './routes/vote.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/votes', voteRoutes);

// Route de base
app.get('/', (req, res) => {
  res.send('API BugBuster est en ligne');
});

// Synchronisation avec la base de données et démarrage du serveur
sequelize
  .sync()
  .then(() => {
    console.log('Base de données synchronisée');
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erreur de connexion à la base de données:', err);
  });

module.exports = app;