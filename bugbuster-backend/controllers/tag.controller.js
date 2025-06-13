import Tag from '../models/tag.model.js';

/**
 * Récupérer tous les tags
 */
export const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.status(200).json(tags);
  } catch (error) {
    console.error('Erreur dans getAllTags:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tags' });
  }
};

/**
 * Récupérer un tag par ID
 */
export const getTagById = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    
    if (!tag) {
      return res.status(404).json({ error: 'Tag non trouvé' });
    }
    
    res.status(200).json(tag);
  } catch (error) {
    console.error('Erreur dans getTagById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du tag' });
  }
};

/**
 * Créer un nouveau tag
 */
export const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Vérifier si le tag existe déjà
    const existingTag = await Tag.findOne({ where: { name } });
    if (existingTag) {
      return res.status(409).json({ error: 'Ce tag existe déjà' });
    }

    const tag = await Tag.create({ name });

    res.status(201).json({
      message: 'Tag créé avec succès',
      tag
    });
  } catch (error) {
    console.error('Erreur dans createTag:', error);
    res.status(500).json({ error: 'Erreur lors de la création du tag' });
  }
};

/**
 * Mettre à jour un tag
 */
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const tag = await Tag.findByPk(id);
    
    if (!tag) {
      return res.status(404).json({ error: 'Tag non trouvé' });
    }
    
    // Vérifier si un autre tag avec le même nom existe déjà
    const existingTag = await Tag.findOne({ where: { name } });
    if (existingTag && existingTag.id !== parseInt(id)) {
      return res.status(409).json({ error: 'Un tag avec ce nom existe déjà' });
    }
    
    await tag.update({ name });
    
    res.status(200).json({
      message: 'Tag mis à jour avec succès',
      tag
    });
  } catch (error) {
    console.error('Erreur dans updateTag:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du tag' });
  }
};

/**
 * Supprimer un tag
 */
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await Tag.findByPk(id);
    
    if (!tag) {
      return res.status(404).json({ error: 'Tag non trouvé' });
    }
    
    await tag.destroy();
    
    res.status(200).json({
      message: 'Tag supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur dans deleteTag:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du tag' });
  }
};

/**
 * Récupérer les questions par tag
 */
export const getQuestionsByTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    
    const tag = await Tag.findByPk(tagId, {
      include: ['questions']  // Ceci suppose que vous avez défini les associations correctement
    });
    
    if (!tag) {
      return res.status(404).json({ error: 'Tag non trouvé' });
    }
    
    res.status(200).json(tag.questions);
  } catch (error) {
    console.error('Erreur dans getQuestionsByTag:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des questions par tag' });
  }
};