# - Page d'authentification sécurisée avec Next.js -

Ce projet implémente une page d'authentification simplifiée initialement développée avec Remix, puis migrée vers Next.js App Router, avec gestion de session via cookie, vérification email, validation CSRF et base de données Prisma (SQLite).

---

## Installation

1. **Cloner le projet**

```bash
git clone https://github.com/thom-cr/Secure-Auth-Page-Next.js.git
cd Secure-Auth-Page-Next.js
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Initialiser la base de données**

```bash
npx prisma migrate dev --name init
```

4. **Créer le fichier `.env` à la racine**

```env
DATABASE_URL="file:C:/chemin/absolu/vers/dev.db"
COOKIE_SECRET="un_secret_aleatoire"
```

> Remplace le chemin par le **chemin absolu vers `dev.db`** sur votre machine.

5. **Lancer le serveur**

```bash
npm run dev
```

---

## Fonctionnalités principales

- Gestion des sessions via cookies (`HttpOnly`, `SameSite=Lax`)
- Inscription avec validation d'email par code à 6 chiffres
- Connexion et déconnexion sécurisées
- Vérification CSRF à chaque étape critique
- Protection des routes côté serveur
- Base de données SQLite (via Prisma)
- Interface utilisateur simple

---

## 🧾 Journal des versions

### ✅ Version 0.1
- Serveur HTTP fonctionnel de base

### ✅ Version 0.2
- Mise en place du HTTPS

### ✅ Version 0.3
- Dossier de certificat
- Création des pages principales : home, login, signup
- Mise en place du POST sur le formulaire d’inscription
- Apparition d’un bug d’inclusion CSS dans l’URL

### ✅ Version 0.4
- Correction du bug CSS
- Validation des formulaires
- Nettoyage du code

### ✅ Version 0.5
- Intégration temporaire de Prisma et SQLite
- Mise à jour de la validation avec la BDD
- Initialisation de TypeScript
- Nettoyage du code

### ✅ Version 0.6
- Ajout du logout
- Ajout du login connecté à la base de données
- Vérifications d’authentification

### ✅ Version 0.7
- Protection des routes si non authentifié
- Redirection si l'utilisateur est connecté
- Création de la page index

### ✅ Version 0.8
- Ajout des champs prénom et nom dans le formulaire
- Ajout d’un champ de confirmation de mot de passe
- Refactoring du code lié au `signup`

### ✅ Version 0.9
- Transfert de l'application de Remix vers Next.js

---

## 🛠️ Issues & Refactorings

### 🧩 Issue 1: Migration vers `CookieSessionStorage`
- Passage de `auth.server.ts` à `sessions.server.ts`
- Unification des cookies de session sur toutes les routes

### 🧩 Issue 3: Vérification Email
- Ajout d'une page de vérification `verify.{token}.tsx`
- Redirection de l’inscription vers la vérification
- Création du compte uniquement après vérification réussie
- Expiration du token pour empêcher les reouvertures

### 🧩 Issue 4: Migration vers SQLite
- Passage de PostgreSQL/MySQL à SQLite via Prisma
- Configuration simplifiée pour usage local

---