# 🌊 DeepSea Archives - Projet Backend

**DeepSea Archives** est une plateforme backend basée sur une architecture microservices dédiée à l’étude et à la gestion d’un écosystème sous-marin fictif. Le projet gère l'authentification, la soumission d'espèces et d'observations, ainsi qu'un système de réputation et de rareté dynamique.

---

## 👥 Membres du groupe
THOMAS Alexandre
CHEKKOURI Omar

---

## 🏗️ Architecture Technique

Le projet est divisé en deux microservices distincts communiquant entre eux :

### 1. Auth-Service (Port 3001)
* **Rôle :** Gestion des utilisateurs, authentification et permissions.
* **Base de données :** MySQL (`deepsea_auth`).
* **Sécurité :** Hashage Bcrypt + JWT.
* **Logique métier :** Gestion de la réputation des utilisateurs (User -> Expert).

### 2. Observation-Service (Port 3002)
* **Rôle :** Gestion des espèces et des observations.
* **Base de données :** MySQL (`deepsea_obs`).
* **Logique métier :**
  * Calcul automatique de la rareté des espèces.
  * Validation/Rejet par les Experts/Admins.
  * Délai de 5 minutes entre deux observations.
  * Communication avec *Auth-Service* pour mettre à jour la réputation.

**Stack :** Node.js, Express, Prisma ORM, MySQL, Axios.

---

## 🚀 Installation et Configuration

### Pré-requis
* Node.js installé.
* Serveur MySQL lancé (via XAMPP, WAMP, Laragon ou Docker).

### 1. Installation des dépendances
Ouvrez un terminal à la racine et installez les paquets pour chaque service :

```bash
# Installation Auth-Service
cd auth-service
npm install

# Installation Observation-Service
cd ../observation-service
npm install