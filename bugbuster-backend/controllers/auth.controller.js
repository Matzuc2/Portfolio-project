import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Inscription d'un utilisateur
 */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifie si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    // Création de l'utilisateur (le hash est fait dans le hook beforeCreate)
    const user = await User.create({ username, email, password });

    res.status(201).json({
      message: 'Utilisateur enregistré avec succès.',
      userId: user.id
    });
  } catch (error) {
    console.error('Erreur dans register:', error);
    res.status(500).json({ error: 'Erreur lors de l’inscription.' });
  }
};

/**
 * Connexion d'un utilisateur
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Recherche de l'utilisateur par email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet email.' });
    }

    // Vérifie le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    // Création du token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Connexion réussie.',
      token
    });
  } catch (error) {
    console.error('Erreur dans login:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
};
