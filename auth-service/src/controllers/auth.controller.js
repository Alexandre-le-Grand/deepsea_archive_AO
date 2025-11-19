exports.updateReputation = async (req, res) => {

  const { userId, points } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const newReputation = user.reputation + points;
    

    let newRole = user.role;
    if (newReputation >= 10 && user.role === 'USER') {
      newRole = 'EXPERT';
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        reputation: newReputation,
        role: newRole
      }
    });

    res.json({ message: "Réputation mise à jour", newRole, newReputation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne auth-service" });
  }
};