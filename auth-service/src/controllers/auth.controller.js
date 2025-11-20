const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'USER'
      }
    });

    res.status(201).json({ message: 'Utilisateur créé', userId: newUser.id });
  } catch (error) {
    res.status(400).json({ error: 'Erreur création (Email déjà pris ?)' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Utilisateur inconnu' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, username: true, role: true, reputation: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true }
  });
  res.json(users);
};

exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: 'Erreur update rôle' });
  }
};

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