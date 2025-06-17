import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import User from '../models/user.model.js';
import sequelize from '../config/db.js';

// Configuration initiale pour les tests
beforeAll(async () => {
  // Connexion à la base de données de test
  await sequelize.authenticate();
});

// Nettoyage après tous les tests
afterAll(async () => {
  // Supprimer les utilisateurs de test
  await User.destroy({
    where: {
      Email: {
        [Op.like]: '%@test.com'
      }
    },
    force: true // Suppression réelle, pas soft delete
  });
  
  // Fermer la connexion à la base de données
  await sequelize.close();
});

// Données de test
const testUser = {
  Username: 'testuser',
  Email: 'testuser@test.com',
  Password: 'Password123!'
};

let authToken;
let userId;

describe('User Authentication', () => {
  // Test d'inscription
  test('Should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.username).toBe(testUser.Username);
    
    // Stocker l'ID et le token pour les tests suivants
    userId = response.body.user.id;
    authToken = response.body.token;
  });
  
  // Test de tentative d'inscription avec un utilisateur existant
  test('Should not register a duplicate user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
  
  // Test de connexion
  test('Should login an existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        Email: testUser.Email,
        Password: testUser.Password
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
  });
  
  // Test de connexion avec des identifiants incorrects
  test('Should not login with incorrect password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        Email: testUser.Email,
        Password: 'wrongpassword'
      });
    
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});

describe('User Profile', () => {
  // Test de récupération du profil
  test('Should get user profile', async () => {
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('Username', testUser.Username);
    expect(response.body).toHaveProperty('Email', testUser.Email);
    expect(response.body).not.toHaveProperty('PasswordHash');
  });
  
  // Test de mise à jour du profil
  test('Should update user profile', async () => {
    const updatedData = {
      Username: 'updateduser'
    };
    
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedData);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.user).toHaveProperty('username', updatedData.Username);
    
    // Vérifier que la mise à jour est bien persistée
    const userCheck = await User.findByPk(userId);
    expect(userCheck.Username).toBe(updatedData.Username);
  });
});

describe('User Password Management', () => {
  // Test de changement de mot de passe
  test('Should change user password', async () => {
    const passwordData = {
      currentPassword: testUser.Password,
      newPassword: 'NewPassword456!',
      confirmPassword: 'NewPassword456!'
    };
    
    const response = await request(app)
      .post(`/api/users/${userId}/change-password`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(passwordData);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message');
    
    // Vérifier que le nouveau mot de passe fonctionne
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        Email: testUser.Email,
        Password: passwordData.newPassword
      });
    
    expect(loginResponse.statusCode).toBe(200);
  });
  
  // Test de demande de réinitialisation de mot de passe
  test('Should request password reset', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ Email: testUser.Email });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message');
  });
});

describe('User Questions and Activity', () => {
  // Test de récupération des questions d'un utilisateur
  test('Should get user questions', async () => {
    const response = await request(app)
      .get(`/api/users/${userId}/questions`);
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  
  // Test de récupération des réponses d'un utilisateur
  test('Should get user answers', async () => {
    const response = await request(app)
      .get(`/api/users/${userId}/answers`);
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('User Model Unit Tests', () => {
  // Test du hook de hachage de mot de passe
  test('Should hash password before create', async () => {
    const user = await User.create({
      Username: 'passwordtestuser',
      Email: 'passwordtest@test.com',
      PasswordHash: 'plainpassword123'
    });
    
    // Le mot de passe devrait être haché
    expect(user.PasswordHash).not.toBe('plainpassword123');
    
    // Vérifier que le hash fonctionne avec bcrypt
    const isMatch = await bcrypt.compare('plainpassword123', user.PasswordHash);
    expect(isMatch).toBe(true);
    
    // Nettoyer
    await user.destroy({ force: true });
  });
  
  // Test de validation d'email
  test('Should not create user with invalid email', async () => {
    try {
      await User.create({
        Username: 'invalidemail',
        Email: 'notanemail',
        PasswordHash: 'test123'
      });
      // Si on arrive ici, le test échoue
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeTruthy();
      expect(error.name).toBe('SequelizeValidationError');
    }
  });
  
  // Test d'unicité du nom d'utilisateur
  test('Should not create user with duplicate username', async () => {
    try {
      // Créer un premier utilisateur
      await User.create({
        Username: 'uniqueuser',
        Email: 'unique1@test.com',
        PasswordHash: 'test123'
      });
      
      // Tenter de créer un second utilisateur avec le même nom
      await User.create({
        Username: 'uniqueuser',
        Email: 'unique2@test.com',
        PasswordHash: 'test123'
      });
      
      // Si on arrive ici, le test échoue
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeTruthy();
      expect(error.name).toBe('SequelizeUniqueConstraintError');
    }
  });
});

describe('User Admin Functions', () => {
  // Test de soft delete d'un utilisateur
  test('Should soft delete a user', async () => {
    // Créer un utilisateur pour le test
    const deleteUser = await User.create({
      Username: 'deleteuser',
      Email: 'delete@test.com',
      PasswordHash: 'test123'
    });
    
    // Tester la suppression
    const response = await request(app)
      .delete(`/api/users/${deleteUser.Id}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.statusCode).toBe(200);
    
    // Vérifier que l'utilisateur est soft deleted
    const user = await User.findByPk(deleteUser.Id, { paranoid: false });
    expect(user.DeletedAt).not.toBeNull();
  });
  
  // Test de restauration d'un utilisateur supprimé
  test('Should restore a soft deleted user', async () => {
    // Créer et supprimer un utilisateur
    const restoreUser = await User.create({
      Username: 'restoreuser',
      Email: 'restore@test.com',
      PasswordHash: 'test123'
    });
    
    await restoreUser.destroy();
    
    // Tester la restauration
    const response = await request(app)
      .post(`/api/admin/users/${restoreUser.Id}/restore`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.statusCode).toBe(200);
    
    // Vérifier que l'utilisateur est restauré
    const user = await User.findByPk(restoreUser.Id);
    expect(user).not.toBeNull();
    expect(user.DeletedAt).toBeNull();
  });
});