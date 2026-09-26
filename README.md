# devops-tasktracker

API de gestion de tâches écrite en Node.js. C'est le fil rouge du cours DevOps : pendant cinq jours, vous allez la tester, la conteneuriser, construire son pipeline CI/CD, la déployer automatiquement et la superviser. Le code métier est volontairement petit : le sujet du cours, c'est tout ce qui l'entoure.

## Démarrer

Prérequis : Node.js 24 et npm, ou ouvrez simplement le dépôt dans GitHub Codespaces (Node.js 24 et Docker y sont préinstallés).

```bash
npm ci          # installe les dépendances exactes du package-lock.json
npm test        # lance les tests Jest
npm run lint    # vérifie le style avec ESLint
npm start       # démarre l'API sur le port 3000
curl localhost:3000/health
```

Sans variable `DATABASE_URL`, l'API garde les tâches en mémoire (elles disparaissent à l'arrêt). Avec `DATABASE_URL=postgres://...`, elle les stocke dans PostgreSQL.

## API

| Méthode | Route | Corps | Réponses |
|---|---|---|---|
| GET | `/health` | | `200 {"status":"ok"}` |
| GET | `/tasks` | filtre optionnel `?done=true` ou `?done=false` | `200` liste des tâches, `400` si le filtre est invalide |
| POST | `/tasks` | `{"title": "..."}` | `201` tâche créée, `400` si le titre est vide ou dépasse 200 caractères |
| PATCH | `/tasks/:id` | `{"title": "..."}` et/ou `{"done": true}` | `200` tâche modifiée, `400` si invalide, `404` si inconnue |
| DELETE | `/tasks/:id` | | `204` supprimée, `404` si inconnue |
| GET | `/stats` | | `200 {"done": n, "todo": n}` |

## Organisation du dépôt

| Chemin | Rôle |
|---|---|
| `src/server.js` | point d'entrée : choisit le stockage (mémoire ou PostgreSQL) et démarre le serveur |
| `src/app.js` | routes HTTP, journal des requêtes, gestion des erreurs |
| `src/tasks/service.js` | règles métier (validation, filtres, statistiques) |
| `src/tasks/memoryRepository.js` | stockage en mémoire, utilisé par les tests |
| `src/tasks/pgRepository.js` | stockage PostgreSQL, utilisé en exécution |
| `tests/` | tests Jest (service et API) |
| `docs/` | le guide de chaque journée du cours |

## Parcours du cours

| Jour | Thème | Guide |
|---|---|---|
| J1 | Tests automatisés et premier pipeline | [docs/J1.md](docs/J1.md) |
| J2 | Conteneurs, Compose et reverse proxy Nginx | [docs/J2.md](docs/J2.md) |
| J3 | Pipeline GitHub Actions complet | publié avant le jour J3 |
| J4 | Déploiement avec Ansible, supervision Prometheus et Grafana | publié avant le jour J4 |
| J5 | Journaux avec Loki, projet final | publié avant le jour J5 |

## Rattrapage

Chaque matin, une branche `start-jN` contient la correction des jours précédents. Si vous n'avez pas terminé la veille, récupérez-la dans votre fork :

```bash
git fetch upstream
git merge upstream/start-j2     # remplacez j2 par le jour qui commence
```

La remote `upstream` pointe vers le dépôt du cours ; vous l'ajoutez le premier jour (voir `docs/J1.md`).
