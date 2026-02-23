# Compte Rendu - Projet R6A.05

**Auteur :** Ruben Durand

## Introduction
Ce projet consiste en la réalisation d'une API backend pour une bibliothèque de films, développée en Node.js avec le framework Hapi.js. L'objectif était de mettre en pratique les concepts vus en cours (Auth, CRUD, Validation, ORM, Services) ainsi que des fonctionnalités avancées (Message Broker, Tests).

## Choix Techniques

### Architecture
J'ai opté pour l'écosystème **hapipal** (`schmervice`, `schwifty`) qui propose une structure robuste et standardisée pour Hapi :
- **Schwifty** : Intègre l'ORM **Objection.js** (basé sur Knex) directement dans Hapi, facilitant la gestion des modèles et des migrations.
- **Schmervice** : Permet d'organiser la logique métier en **Services**, découplant ainsi les contrôleurs (routes) de la logique business.

### Base de Données
Pour simplifier l'évaluation et l'exécution locale sans dépendance lourde, j'ai choisi **SQLite3**.
Le code est compatible avec MySQL/PostgreSQL via simple configuration de Knex.

### Message Broker
J'ai utilisé **RabbitMQ** (via la librairie `amqplib`) pour gérer l'export CSV de manière asynchrone.
- Un **Producer** envoie une demande d'export dans une file `export_movies_queue`.
- Un **Consumer** (intégré au démarrage du serveur) dépile les messages, génère le CSV et l'envoie par mail.
Cela évite de bloquer la requête HTTP lors d'opérations lourdes.

### Authentification
L'authentification utilise **JWT** (`hapi-auth-jwt2`). Deux scopes sont définis : `user` et `admin`.
- Les routes sensibles (modification de films, export) sont protégées par le scope `admin`.
- Les routes utilisateurs (favoris) sont protégées par le scope `user`.

## Fonctionnalités Implémentées

1.  **Gestion des Utilisateurs** :
    - Inscription avec hashage (simulé) et envoi de mail de bienvenue.
    - Login retournant un JWT.
2.  **Gestion des Films** :
    - CRUD complet.
    - Validation des données entrantes avec **Joi**.
3.  **Favoris** :
    - Relation Many-to-Many entre Users et Movies.
    - Ajout/Suppression avec gestion des erreurs (404, 409).
4.  **Notifications** :
    - Envoi d'emails via **Nodemailer** (configuré avec Ethereal pour le débug).
    - Notification globale à la création d'un film.
    - Notification ciblée aux "favoris" lors de la mise à jour d'un film.
5.  **Bonus : Tests Unitaires** :
    - Utilisation de `@hapi/lab` et `@hapi/code`.
    - Couverture des routes principales (Auth, Movies, Favorites) et des cas d'erreurs (401, 403).

## Difficultés Rencontrées
- Initialement, une confusion sur la gestion des plugin Hapi (`server.register`) a causé des soucis au démarrage, résolus en isolant l'instance du serveur dans une factory pour les tests.
- La gestion des timestamps (camelCase vs snake_case) entre Objection et SQLite a nécessité une harmonisation des migrations.

## Conclusion
Le projet répond à l'ensemble du cahier des charges, incluant les bonus. L'architecture est modulaire et prête à évoluer (changement de BDD, ajout de nouveaux services).
