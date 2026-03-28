# Mur de Post-it 2.0

### Nom: **Ilyass Elkhadiri**

## Technologies utilisées

- Node.js / NPM
- Express
- SQLite
- HTML / CSS / JavaScript
- Docker

## Fonctionnalités ajoutées

- Ajout de post-it avec titre, contenu et catégorie
- Modification d’un post-it
- Suppression d’un post-it
- Système de likes
- Système de commentaires
- Filtrage par catégorie
- Recherche par mot-clé

## Installation

1. Cloner le projet ou télécharger le dossier
2. Ouvrir le terminal à la racine du projet
3. Installer les dépendances :

```bash
npm install
```

4. Lancement en développement

```bash
npm dev
```

5. Lancement en développement

```bash
npm start
```

Ouvrir dans le navigateur:

```
http://localhost:8002
```

## Lancement avec Docker

### Build et lancer le projet

```bash
npm run docker:dev
```

### Lancer sans rebuild

```bash
npm run docker:up
```

### Stopper le projet

```bash
npm run docker:down
```

### Redémarrer proprement

```bash
npm run docker:restart
```
