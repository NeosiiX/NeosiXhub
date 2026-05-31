# DevHub — Forge Git Auto-hébergée

Interface moderne de gestion de dépôts Git, similaire à GitHub/Gitea. Construite avec Next.js 14, PostgreSQL et isomorphic-git.

## Fonctionnalités

- **Dépôts Git réels** — push, pull, clone via HTTP
- **Profils utilisateurs** — bio, avatar, projets épinglés, favoris
- **Organisations** — membres, équipes, permissions
- **Issues & commentaires** — suivi de bugs et fonctionnalités
- **Releases** — gestion des versions
- **Admin** — gestion des utilisateurs, organisations, paramètres du site
- **Rôles** — USER et ADMIN
- **Auth JWT** — connexion sécurisée par cookie httpOnly

## Stack technique

| Élément | Technologie |
|---------|-------------|
| Framework | Next.js 14 (App Router) |
| Base de données | PostgreSQL + Prisma ORM |
| Auth | JWT (jose) + bcryptjs |
| Git | isomorphic-git + git natif |
| UI | Tailwind CSS + Radix UI |
| Déploiement | Railway + Docker |

## Installation locale

```bash
# 1. Cloner et installer
git clone <votre-repo>
cd devhub
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Éditez .env.local avec vos valeurs

# 3. Base de données
npx prisma db push
npm run db:seed   # Crée admin/admin1234 et demo/demo1234

# 4. Initialiser le stockage Git
node scripts/init-git-storage.js

# 5. Lancer
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Déploiement sur Railway

### Prérequis
- Compte [Railway](https://railway.app)
- Compte [GitHub](https://github.com) pour le code source

### Étapes

1. **Pushez votre code sur GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOUS/devhub.git
git push -u origin main
```

2. **Créez un projet Railway**
   - Allez sur [railway.app/new](https://railway.app/new)
   - Choisissez "Deploy from GitHub repo"
   - Sélectionnez votre repo

3. **Ajoutez PostgreSQL**
   - Dans votre projet Railway : "+ New" → "Database" → "PostgreSQL"
   - La variable `DATABASE_URL` sera injectée automatiquement

4. **Configurez les variables d'environnement**
   Dans Railway → votre service → Variables :
   ```
   JWT_SECRET=votre-secret-tres-long-et-aleatoire
   GIT_ROOT=/git-repos
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://votre-app.railway.app
   ```

5. **Volume persistant pour Git**
   - Dans Railway → votre service → Volumes
   - Montez un volume sur `/git-repos`

6. **Déployez**
   Railway détecte automatiquement le `Dockerfile` et déploie.
   Les migrations Prisma sont appliquées au démarrage.

### Variables Railway

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `DATABASE_URL` | URL PostgreSQL (auto-injectée) | ✅ |
| `JWT_SECRET` | Secret JWT (min 32 chars) | ✅ |
| `GIT_ROOT` | Chemin stockage Git | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL publique | Recommandé |

## Structure du projet

```
devhub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, Register
│   │   ├── [username]/         # Profil utilisateur
│   │   │   └── [repo]/         # Page dépôt
│   │   ├── admin/              # Interface admin
│   │   ├── api/                # API Routes
│   │   │   ├── auth/           # login, register, logout
│   │   │   ├── repos/          # CRUD dépôts + star
│   │   │   ├── orgs/           # CRUD organisations
│   │   │   ├── users/          # Profil + follow
│   │   │   ├── admin/          # Actions admin
│   │   │   └── git/            # Smart HTTP Git
│   │   ├── dashboard/          # Tableau de bord
│   │   ├── explore/            # Découverte publique
│   │   ├── new-repo/           # Créer un dépôt
│   │   ├── new-org/            # Créer une org
│   │   ├── orgs/[org]/         # Page organisation
│   │   └── settings/           # Paramètres compte
│   ├── components/
│   │   ├── admin/              # Composants admin
│   │   ├── layout/             # AppNav, ThemeProvider
│   │   ├── repo/               # FileTree, RepoCard, etc.
│   │   └── ui/                 # Composants Radix/Tailwind
│   ├── hooks/                  # useToast
│   ├── lib/                    # prisma, session, auth, git, utils
│   ├── middleware.ts            # Protection des routes
│   └── types/                  # Types TypeScript
├── prisma/
│   ├── schema.prisma           # Schéma DB complet
│   └── seed.ts                 # Données initiales
├── scripts/
│   └── init-git-storage.js     # Init répertoire Git
├── Dockerfile                  # Image Docker
├── railway.toml                # Config Railway
└── .env.example                # Variables d'environnement
```

## Comptes par défaut (après seed)

| Rôle | Login | Mot de passe |
|------|-------|--------------|
| Admin | `admin` | `admin1234` |
| Démo | `demo` | `demo1234` |

⚠️ Changez ces mots de passe en production !

## À compléter / TODO

- [ ] Clés SSH pour push Git
- [ ] Tokens d'accès personnels
- [ ] Pull requests / merge requests
- [ ] Webhooks (notifications push)
- [ ] Upload d'avatar
- [ ] Vérification email
- [ ] Projets épinglés (drag & drop)
- [ ] Diff de commits avec syntax highlighting
- [ ] Recherche full-text sur le code
- [ ] Paramètres admin sauvegardés en DB
