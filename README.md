# devops-tasktracker

API de gestion de tâches écrite en Node.js. C'est le fil rouge du cours DevOps : pendant cinq jours, vous allez la tester, la conteneuriser, construire son pipeline CI/CD, la déployer automatiquement et la superviser. Le code métier est volontairement petit : le sujet du cours, c'est tout ce qui l'entoure.

## Démarrer

Votre poste de travail est le lab **Atelier projet DevOps** du Range : Node.js 24, Git et Docker y sont préinstallés. Forkez ce dépôt, ouvrez l'Atelier et lancez `atelier-init` : il connecte la machine à GitHub et clone votre fork dans `~/devops-tasktracker` (détails dans [docs/J1.md](docs/J1.md), section 1). Hors Atelier, il vous faut Node.js 24, npm et Git.

```bash
cd ~/devops-tasktracker   # le clone créé par atelier-init
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
| J3 | Pipeline GitHub Actions complet | [docs/J3.md](docs/J3.md) |
| J4 | Déploiement avec Ansible, supervision Prometheus et Grafana | [docs/J4.md](docs/J4.md) |
| J5 | Journaux avec Loki, projet final | publié avant le jour J5 |

## Rattrapage

Chaque matin, une branche `start-jN` (publiée le matin du jour N) contient la correction des jours précédents. Si vous n'avez pas terminé la veille, récupérez-la dans votre fork :

```bash
git add -A && git commit -m "wip: avant rattrapage"   # si vous avez des modifications
git fetch upstream
git merge -X theirs --no-edit upstream/start-j2       # remplacez j2 par le jour qui commence
git commit --allow-empty -m "rattrapage J2"            # un commit à vous, même si la fusion n'en crée aucun
```

La remote `upstream` pointe vers le dépôt du cours ; dans l'Atelier, `atelier-init` l'ajoute pour vous (voir `docs/J1.md`).
