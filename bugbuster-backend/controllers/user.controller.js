import User from '../models/user.model.js';

// Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['PasswordHash'] } // Ne pas renvoyer les mots de passe
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer un utilisateur par son ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['PasswordHash'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vous pouvez ajouter des vérifications pour s'assurer que l'utilisateur 
    // connecté est autorisé à modifier cet utilisateur
    
    await user.update({ username, email });
    
    return res.status(200).json({
      message: 'Utilisateur mis à jour avec succès',
      user: {
        id: user.Id,
        username: user.Username,
        email: user.Email,
        createdAt: user.CreatedAt,
        updatedAt: user.UpdatedAt
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un utilisateur (suppression douce avec paranoid)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Supprimer l'utilisateur (soft delete si paranoid est activé)
    await user.destroy();
    
    return res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les questions d'un utilisateur
export const getUserQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      include: 'Questions' // Assurez-vous que l'association est correctement définie
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    return res.status(200).json(user.Questions || []);
  } catch (error) {
    console.error('Erreur lors de la récupération des questions de l\'utilisateur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};