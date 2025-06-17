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
    // Accepter les deux formats possibles de noms de champs
    const username = req.body.username || req.body.Username;
    const email = req.body.email || req.body.Email;
    const password = req.body.password || req.body.Password;
    
    // Vérifications
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
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
      return res.status(400).json({ error: "Cet utilisateur existe déjà" });
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
    
    // Créer un token JWT
    const token = jwt.sign(
      { id: user.Id, Username: user.Username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
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
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
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
