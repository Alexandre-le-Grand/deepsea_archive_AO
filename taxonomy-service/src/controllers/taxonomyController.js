import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// GET /taxonomy/stats
export const getStats = async (req, res) => {
  try {
    const species = await prisma.species.findMany({
      include: { observations: true }
    });

    const speciesStats = species.map(s => ({
      id: s.id,
      name: s.name,
      family: s.family || 'Unknown',
      subSpecies: s.subSpecies || 'Unknown',
      observationCount: s.observations.length
    }));

    const totalObservations = species.reduce((acc, s) => acc + s.observations.length, 0);
    const avgObservations = species.length ? totalObservations / species.length : 0;

    res.json({
      speciesCount: species.length,
      avgObservations,
      speciesStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /observations/:id/delete
export const deleteObservation = async (req, res) => {
  try {
    const { id } = req.params;

    const obs = await prisma.observation.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Observation supprimée', obs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /observations/:id/restore
export const restoreObservation = async (req, res) => {
  try {
    const { id } = req.params;

    const obs = await prisma.observation.update({
      where: { id },
      data: { deletedAt: null }
    });

    res.json({ message: 'Observation restaurée', obs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
