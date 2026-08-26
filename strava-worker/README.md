# Rome42 · Connecteur Strava

Ce Worker garde le `client_secret` et les refresh tokens Strava hors de la PWA GitHub Pages. Les appels venant de Rome42 sont authentifiés avec le jeton Firebase de l’utilisateur.

## Fonctionnement V48

- OAuth 2.0 Strava avec scopes `read,activity:read_all`.
- Refresh automatique des access tokens.
- Lecture à la demande des activités récentes : aucun polling permanent.
- Association d’une activité à la séance depuis la PWA.
- Rome42 ne persiste pas la distance, l’allure, le nom ou l’identifiant de l’activité dans son historique. Après association, seule la validation de la séance via Strava est enregistrée.
- Endpoint webhook prévu pour supprimer le token lorsqu’un athlète retire son autorisation.

Cette approche est volontaire : la politique API Strava 2026 limite la conservation en cache de Strava Data à 7 jours et interdit d’exposer les données d’un athlète à un autre utilisateur.

## Déploiement recommandé : GitHub Actions

Le workflow `.github/workflows/deploy-strava-worker.yml` automatise la création/réutilisation de D1, la configuration Wrangler, le déploiement du Worker et la création de la clé de chiffrement des tokens.

### Secrets GitHub à ajouter

Dans GitHub : **Settings → Secrets and variables → Actions → New repository secret**.

- `CLOUDFLARE_ACCOUNT_ID` : identifiant du compte Cloudflare.
- `CLOUDFLARE_API_TOKEN` : token Cloudflare limité au compte Rome42 avec au minimum **Workers Scripts Write** et **D1 Write**.
- `STRAVA_CLIENT_SECRET` : Client Secret de l’application Strava. Ne jamais le committer ni le saisir dans une issue.

Le `STRAVA_CLIENT_ID` n’est pas secret : il est demandé au lancement manuel du workflow.

### Lancer le déploiement

1. Ouvrir GitHub → **Actions → Deploy Strava Worker → Run workflow**.
2. Saisir le `STRAVA_CLIENT_ID`.
3. Lancer le workflow.
4. Le résumé du job affiche l’URL publique exacte du Worker et le domaine à reporter dans Strava.
5. Dans Strava, définir **Authorization Callback Domain** sur le domaine `rome42-strava.<sous-domaine>.workers.dev` affiché par le workflow.
6. Dans Rome42 → **Réglages → Strava → Configuration développeur**, coller l’URL du Worker affichée par le workflow.

La base D1 `rome42-strava` est créée en juridiction UE si elle n’existe pas. `TOKEN_ENCRYPTION_KEY` est générée une seule fois puis conservée côté Cloudflare afin de ne jamais rendre illisibles les refresh tokens déjà stockés.

## Déploiement manuel

1. Créer l’application dans les réglages API Strava et récupérer le Client ID. Ne jamais committer le Client Secret.
2. Créer une base Cloudflare D1 `rome42-strava`.
3. Copier `wrangler.example.toml` vers `wrangler.toml`, puis renseigner le `database_id`, le Client ID et l’URL publique finale du Worker.
4. Ajouter les secrets Cloudflare :

```bash
wrangler secret put STRAVA_CLIENT_SECRET
wrangler secret put TOKEN_ENCRYPTION_KEY
wrangler secret put STRAVA_WEBHOOK_VERIFY_TOKEN
```

`TOKEN_ENCRYPTION_KEY` doit être une valeur base64 correspondant à 32 octets aléatoires. Exemple de génération locale :

```bash
openssl rand -base64 32
```

5. Déployer le Worker, puis saisir son URL dans Rome42 > Réglages > Strava > Configuration développeur.
6. Dans Strava, définir le domaine de callback sur le domaine du Worker. Le callback utilisé par le code est :

```text
https://<worker>/api/strava/callback
```

## Webhook

Le callback webhook est :

```text
https://<worker>/api/strava/webhook
```

Il utilise `STRAVA_WEBHOOK_VERIFY_TOKEN` pour la vérification de souscription. Les événements d’activité ne sont pas stockés ; le webhook sert notamment à traiter la révocation d’accès. Le webhook n’est pas nécessaire pour valider le premier parcours OAuth et l’import manuel d’activités ; il peut être configuré dans un second temps.

## Sécurité

Les tokens OAuth sont chiffrés en AES-GCM avant stockage dans D1. L’API privée vérifie le JWT Firebase (`aud`, `iss`, expiration et signature RS256) avant tout accès aux tokens ou aux activités.
