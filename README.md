# Movie Library API (R6A.05)

Projet NodeJS réalisé dans le cadre du module R6A.05 à l'IUT.
Ce projet implémente une API de gestion de films avec authentification, favoris, notifications par email et export CSV asynchrone via RabbitMQ.

## Prérequis

- Node.js (v18+)
- RabbitMQ (pour la fonctionnalité d'export)
- SQLite3 (inclus)

## Installation

1.  Cloner le projet
2.  Installer les dépendances :
    ```bash
    npm install
    ```
3.  Configurer les variables d'environnement :
    ```bash
    cp .env.example .env
    ```
    Modifier `.env` si nécessaire (notamment `AMQP_URL` si RabbitMQ n'est pas sur `localhost`).
    Pour les notifications emails, le projet utilise Ethereal par défaut (logs dans la console avec lien de preview).

## Base de données

Ce projet utilise **SQLite** par facilité de déploiement. Les fichiers de migration sont dans `lib/migrations`.

Pour initialiser la base de données :
```bash
npx knex migrate:latest
```

## Démarrage

Lancer le serveur en mode développement :
```bash
npm start
```

L'API sera accessible sur `http://localhost:3000`.
La documentation Swagger est disponible sur `http://localhost:3000/documentation`.

## Tests

Pour lancer les tests unitaires (avec Lab et Code) :
```bash
npm test
```
*Note: Les tests nécessitent que le port 3000 soit libre ou gèrent des instances isolées. RabbitMQ n'est pas requis pour les tests basiques mais des logs d'erreur de connexion peuvent apparaitre.*

## Fonctionnalités

- **Utilisateurs** : Inscription, Connexion (JWT). mail de bienvenue.
- **Films** : CRUD (Admin uniquement), Liste (Public).
- **Favoris** : Ajout/Suppression pour les utilisateurs connectés.
- **Notifications** :
    - Email aux utilisateurs lors de l'ajout d'un film.
    - Email aux utilisateurs ayant le film en favori lors d'une modification.
- **Export** : Endpoint Admin pour demander un export CSV. La tâche est envoyée dans une file RabbitMQ et traitée par un worker qui génère le CSV et l'envoie par email.

## Structure du projet

- `lib/` : Code source
    - `models/` : Modèles Objection.js (User, Movie, Favorite)
    - `services/` : Logique métier (Schmervice)
    - `routes/` : Définition des endpoints
    - `migrations/` : Migrations Knex
- `test/` : Tests unitaires
