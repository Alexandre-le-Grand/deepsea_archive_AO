const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001/auth/internal/reputation';

const REPUTATION_POINTS = {
  OBSERVATION_VALIDATED: 3,
  VALIDATOR: 1,
  OBSERVATION_REJECTED: -1,
};

const USER_ROLES = {
  EXPERT: 'EXPERT',
  ADMIN: 'ADMIN',
};

const hasValidatorRole = (user) => [USER_ROLES.EXPERT, USER_ROLES.ADMIN].includes(user.role);

async function updateUserReputation(userId, points) {
  try {
    await axios.patch(AUTH_SERVICE_URL, { userId, points });
  } catch (error) {
    console.error("Erreur communication Auth-Service:", error.message);

  }
}


async function updateSpeciesRarity(speciesId) {

  const count = await prisma.observation.count({
    where: { speciesId, status: 'VALIDATED' }
  });


  const rarityScore = 1 + (count / 5);

  await prisma.species.update({
    where: { id: speciesId },
    data: { rarityScore }
  });
}



exports.createSpecies = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = await prisma.species.findUnique({ where: { name } });
    if (existing) return res.status(400).json({ message: "Cette espèce existe déjà" });

    const species = await prisma.species.create({
      data: {
        name,
        description: description || "Aucune description",
        authorId: req.user.id
      }
    });
    res.status(201).json(species);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllSpecies = async (req, res) => {
  const { sort } = req.query;
  
  const orderBy = sort === 'rarity' 
    ? { rarityScore: 'desc' }
    : { createdAt: 'desc' };

  const list = await prisma.species.findMany({
    include: { observations: true },
    orderBy: orderBy
  });
  res.json(list);
};

exports.getSpeciesById = async (req, res) => {
  try {
    const { id } = req.params;
    const species = await prisma.species.findUnique({
      where: { id },
      include: { observations: true } // optionnel, si tu veux aussi les observations
    });
    if (!species) return res.status(404).json({ message: "Espèce introuvable" });
    res.json(species);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getObservationsBySpecies = async (req, res) => {
  try {
    const { id } = req.params;
    const observations = await prisma.observation.findMany({
      where: { speciesId: id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(observations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createObservation = async (req, res) => {
  try {
    const { speciesId, description, dangerLevel } = req.body;
    const authorId = req.user.id;

    if (!description) return res.status(400).json({ message: 'Description obligatoire' });

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingObs = await prisma.observation.findFirst({
      where: {
        authorId: authorId,
        speciesId: speciesId,
        createdAt: { gt: fiveMinutesAgo }
      }
    });

    if (existingObs) {
      return res.status(429).json({ message: 'Veuillez attendre 5 min avant de reposter sur cette espèce.' });
    }

    const obs = await prisma.observation.create({
      data: {
        speciesId,
        authorId,
        description,
        status: 'PENDING'
      }
    });

    res.status(201).json(obs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.validateObservation = async (req, res) => {
  try {
    const { id } = req.params;
    const validatorId = req.user.id;

    if (!hasValidatorRole(req.user)) {
      return res.status(403).json({ message: 'Rôle insuffisant' });
    }

    const obs = await prisma.observation.findUnique({ where: { id } });
    if (!obs) return res.status(404).json({ message: 'Introuvable' });
    if (obs.authorId === validatorId) return res.status(400).json({ message: 'Auto-validation interdite' });
    if (obs.status !== 'PENDING') return res.status(400).json({ message: `L'observation a déjà le statut : ${obs.status}` });

    const updated = await prisma.observation.update({
      where: { id },
      data: {
        status: 'VALIDATED',
        validatedBy: validatorId,
        validatedAt: new Date()
      }
    });

    await updateUserReputation(obs.authorId, REPUTATION_POINTS.OBSERVATION_VALIDATED);
    await updateUserReputation(validatorId, REPUTATION_POINTS.VALIDATOR);

    await updateSpeciesRarity(obs.speciesId);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectObservation = async (req, res) => {
  try {
    const { id } = req.params;
    const validatorId = req.user.id;

    if (!hasValidatorRole(req.user)) return res.status(403).json({ message: 'Rôle insuffisant' });

    const obs = await prisma.observation.findUnique({ where: { id } });
    if (!obs) return res.status(404).json({ message: 'Introuvable' });
    if (obs.status !== 'PENDING') return res.status(400).json({ message: `L'observation a déjà le statut : ${obs.status}` });

    const updated = await prisma.observation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        validatedBy: validatorId,
        validatedAt: new Date()
      }
    });

    await updateUserReputation(obs.authorId, REPUTATION_POINTS.OBSERVATION_REJECTED);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
