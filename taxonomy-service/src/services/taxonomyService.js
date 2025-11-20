import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getSpeciesStats = async () => {
  const speciesList = await prisma.species.findMany({ include: { observations: true } });
  return speciesList.map(s => ({
    id: s.id,
    name: s.name,
    family: s.family || "Unknown",
    subSpecies: s.subSpecies || "Unknown",
    observationCount: s.observations.filter(o => !o.deletedAt).length
  }));
};
