import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Op } from 'sequelize';

dotenv.config();

/**
 * Inscription d'un utilisateur
 */
export const register = async (req, res) => {
  try {
    console.log('Données reçues pour l\'inscription:', req.body);
    
    // Accepter les deux formats possibles de noms de champs
    const username = req.body.username || req.body.Username;
    const email = req.body.email || req.body.Email;
    const password = req.body.password || req.body.Password;
    
    console.log('Champs extraits:', { username, email, password: password ? '***' : 'undefined' });
    
    // Vérifications
    if (!username || !email || !password) {
      console.log('Champs manquants:', { username: !!username, email: !!email, password: !!password });
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Format d'email invalide" });
    }
    
    // Validation username
    if (username.length < 3) {
      return res.status(400).json({ error: "Le nom d'utilisateur doit contenir au moins 3 caractères" });
    }
    
    // Validation password
    if (password.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [
          { Username: username },
          { Email: email }
        ] 
      } 
    });
    
    if (existingUser) {
      if (existingUser.Username === username) {
        return res.status(400).json({ error: "Ce nom d'utilisateur est déjà pris" });
      }
      if (existingUser.Email === email) {
        return res.status(400).json({ error: "Cet email est déjà utilisé" });
      }
    }
    
    // Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Création de l'utilisateur
    const user = await User.create({
      Username: username,
      Email: email,
      PasswordHash: hashedPassword
    });
    
    console.log('Utilisateur créé:', { id: user.Id, username: user.Username, email: user.Email });
    
    // Créer un token JWT
    const token = jwt.sign(
      { id: user.Id, Username: user.Username },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: user.Id,
        username: user.Username,
        email: user.Email
      },
      token
    });
    
  } catch (error) {
    console.error("Erreur détaillée lors de l'inscription:", error);
    res.status(500).json({ 
      error: "Erreur lors de l'inscription.",
      details: error.message
    });
  }
};

/**
 * Connexion d'un utilisateur
 */
export const login = async (req, res) => {
  try {
    console.log('Données reçues pour la connexion:', req.body);
    
    const email = req.body.email || req.body.Email;
    const password = req.body.password || req.body.Password;

    console.log('Tentative de connexion pour:', email);

    // Vérifications
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe sont obligatoires" });
    }

    // Recherche de l'utilisateur par email
    const user = await User.findOne({ where: { Email: email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Vérifie le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Création du token JWT
    const token = jwt.sign(
      { id: user.Id, email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    console.log('Connexion réussie pour:', user.Username);

    res.status(200).json({
      message: 'Connexion réussie.',
      user: {
        id: user.Id,
        username: user.Username,
        email: user.Email
      },
      token
    });
  } catch (error) {
    console.error('Erreur dans login:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
};
