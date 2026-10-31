# Miss France Pronos

Petit site privé de pronostics entre amis pour l’édition affichée comme **Miss France 2027**. Les candidates actuellement chargées sont les données 2025, conservées provisoirement comme demandé.

## Fonctionnement

- Les votants ouvrent le site, saisissent leur nom et classent cinq candidates.
- Aucun compte, e-mail ou service SMTP n’est utilisé.
- Un nouveau vote portant le même nom normalisé remplace le précédent. Comme il n’y a pas de vérification d’identité, une personne peut techniquement utiliser le nom d’une autre.
- Avant la saisie des résultats officiels, seul l’administrateur peut consulter les pronostics.
- L’administrateur se connecte sur `/admin` avec le mot de passe défini dans `ADMIN_PASSWORD`.
- Après la saisie du Top 5 officiel, l’application calcule les points et révèle tous les pronostics à l’ensemble des votants.

### Barème

- 10 points par candidate du Top 5 retrouvée ;
- 15 points supplémentaires pour chaque position exacte ;
- 30 points de bonus pour un Top 5 entièrement exact ;
- maximum : 155 points.

Les pronostics se ferment à la date `startDate` de l’édition, configurée dans `prisma/seed.ts`. Cette date 2027 est provisoire et doit être vérifiée avant la mise en ligne.

## Stack

- Next.js 15, TypeScript, Tailwind CSS
- PostgreSQL 16 et Prisma
- Docker Compose, Caddy et TLS sur le VPS

## Développement local

1. Copier `.env.example` vers `.env` (Prisma CLI lit `.env`) et modifier `DATABASE_URL` pour utiliser `localhost` et le mot de passe local. Définir aussi un `ADMIN_PASSWORD` d’au moins 16 caractères.
2. Démarrer une base PostgreSQL locale. Avec Docker, le mot de passe ci-dessous est uniquement pour le développement local :

```bash
docker run --name mfp-local-postgres \
  -e POSTGRES_DB=miss_france_pronos \
  -e POSTGRES_USER=mfp_user \
  -e POSTGRES_PASSWORD=local_dev_password \
  -p 5432:5432 -d postgres:16-alpine
```

3. Dans `.env`, utiliser `postgresql://mfp_user:local_dev_password@localhost:5432/miss_france_pronos?schema=public`, puis lancer :

```bash
pnpm install
pnpm exec prisma db push
pnpm db:seed
pnpm dev
```

Le formulaire des votants est sur `http://localhost:3000` ; l’administration est sur `http://localhost:3000/admin`. En production dans Docker Compose, l’hôte PostgreSQL de `DATABASE_URL` doit être `postgres` au lieu de `localhost`. N’utilise pas ces identifiants de développement en production.

## Déploiement VPS

Le déploiement reste manuel et piloté par Antoine. Sur le VPS, le fichier `.env.production` doit contenir au minimum `DATABASE_URL`, `DB_PASSWORD`, `NEXT_PUBLIC_APP_URL` et un `ADMIN_PASSWORD` robuste d’au moins 16 caractères. **Aucune variable SMTP n’est nécessaire.**

```bash
# Générer séparément les secrets, puis les placer dans .env.production
openssl rand -base64 32

# Après transfert des fichiers du projet sur le VPS
docker compose up --build -d
```

Ne partage pas les valeurs de `.env.production` dans le chat. Le schéma Prisma est synchronisé par le service `schema` de Compose avant le démarrage de l’application.

## Vérifications

```bash
pnpm test
pnpm run lint
pnpm run build
pnpm audit --prod
```

Jeu amical sans mise financière. Projet non affilié à l’organisation Miss France.
