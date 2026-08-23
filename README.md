# MOFA — refonte du site officiel

Cette refonte remplace la redirection de `index (90).html` vers DnB Talent par un site autonome pensé pour GitHub Pages, avec une esthétique Luxe Rap / Underground inspirée de `index (91).html`.

## Architecture

- contenu public pré-rendu en HTML dans `/`, `/a-propos/`, `/sorties/`, `/presse/`, `/galerie/`, `/statistiques/`, `/contact/` et `/sitemap/` ;
- fiches individuelles dans `/sorties/{slug}/` et `/presse/{slug}/` ;
- panel privé `/admin/` protégé par Firebase Authentication + Google et une liste blanche `/admins/{uid}` ;
- Firestore pour le contenu et les logs ; Firebase Storage pour les images ;
- YouTube Data API v3 côté GitHub Actions uniquement, avec cache `data/youtube-stats.json` et document `youtubeStats/public` ;
- GitHub Pages via `deploy.yml` ; publication programmée via `scheduled-publish.yml` ; synchronisation YouTube via `youtube-sync.yml`.

## Sécurité

La configuration Firebase Web fournie par le projet est intégrée au frontend car elle est destinée au SDK client. La clé YouTube Data API n'est volontairement pas intégrée à un fichier public : elle doit être définie dans le secret GitHub `YOUTUBE_API_KEY`. Le cahier des charges exige qu'aucune clé API privilégiée ne soit exposée au navigateur.

### Secrets GitHub à définir

- `FIREBASE_SERVICE_ACCOUNT_JSON` : JSON du compte de service Firebase Admin.
- `YOUTUBE_API_KEY` : clé YouTube Data API v3 fournie/restrictée au projet Google Cloud.

### Mise en place des 2 admins

Définir temporairement `ADMIN_UID_1` et `ADMIN_UID_2` et `FIREBASE_SERVICE_ACCOUNT_JSON`, puis lancer :

```bash
npm ci
npm run seed:admins
```

Les deux documents `/admins/{uid}` reçoivent `role: "admin"`. Aucun email n'est hardcodé côté frontend.

### Fonctions de build à déployer

Pour le déclenchement immédiat depuis le dashboard, déployer `/functions` et configurer le secret Firebase `GITHUB_DISPATCH_TOKEN`, puis le dépôt/owner GitHub utilisés par la fonction. Le bouton d'administration peut aussi laisser une demande dans Firestore si cette fonction n'est pas installée.

## Déploiement local

```bash
npm ci
npm run build
```

Le dossier est déjà prêt à être publié sur GitHub Pages. `SITE_URL` est centralisé dans `data/site.json` afin de faciliter une future migration vers un domaine personnalisé.
