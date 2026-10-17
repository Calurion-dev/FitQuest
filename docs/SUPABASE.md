# Activer la connexion Google (Supabase)

Objectif : que chaque joueur retrouve sa progression sur tous ses appareils en se connectant avec son compte Google.

L'app fonctionne **sans** cette configuration (tout reste en local) : dès que les clés sont présentes, la section **Réglages → Compte Google** affiche le bouton de connexion.

Compte Supabase gratuit, ~10 minutes de mise en place.

---

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project** (nom : `fitquest`, région : Frankfurt ou Paris).
2. Attends la fin du provisioning (~1 min).

## 2. Créer les tables

1. Dans le projet → **SQL Editor** → **New query**.
2. Colle tout le contenu de [`supabase/schema.sql`](../supabase/schema.sql) puis **Run**.

Ça crée la sauvegarde privée (`fitquest_profiles`) et la table publique du classement (`fitquest_scores`), avec les règles d'accès (RLS) qui empêchent un joueur de lire les données d'un autre.

## 3. Créer l'identifiant OAuth Google

1. [Google Cloud Console](https://console.cloud.google.com/) → crée un projet (ex. `FitQuest`).
2. **APIs et services** → **Écran de consentement OAuth** : type *Externe*, renseigne le nom de l'app et ton e-mail. (En mode test, ajoute ton adresse dans **Utilisateurs test**.)
3. **APIs et services** → **Identifiants** → **Créer des identifiants** → **ID client OAuth** → type **Application Web**.
4. Dans **URI de redirection autorisés**, mets **exactement** :
   ```
   https://<TON-PROJET>.supabase.co/auth/v1/callback
   ```
   (remplace `<TON-PROJET>` par la référence de ton projet Supabase, visible dans l'URL du dashboard)
5. Note le **Client ID** et le **Client Secret**.

## 4. Activer Google dans Supabase

1. Supabase → **Authentication** → **Sign In / Providers** → **Google** → activer.
2. Colle le **Client ID** et le **Client Secret** → **Save**.

## 5. Autoriser les URL de retour

Supabase → **Authentication** → **URL Configuration** :

- **Site URL** : `https://calurion-dev.github.io/FitQuest/`
- **Redirect URLs** : ajoute
  - `https://calurion-dev.github.io/FitQuest/`
  - `http://localhost:5173/` (pour tester en local)

> L'app utilise le flux PKCE : le retour de Google arrive sur `.../FitQuest/?code=...`, compatible avec le HashRouter.

## 6. Renseigner les clés en local

Supabase → **Project Settings** → **API** : copie **Project URL** et **anon public key**.

Crée un fichier `.env` à la racine du projet (il est ignoré par git) :

```dotenv
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Lance :

```bash
npm run dev      # test en local
npm run deploy   # build + publication sur GitHub Pages
```

## 7. Vérifier

1. Ouvre l'app → **Réglages → Compte Google** → **Continuer avec Google**.
2. Autorise, tu reviens connecté : la section affiche « ✓ Synchronisé ».
3. Sur un autre appareil (ou en navigation privée), reconnecte-toi : ta progression est récupérée automatiquement.

---

## Comment fonctionne la synchronisation

- **Tout est local d'abord** : le jeu fonctionne hors-ligne, les données vivent dans le `localStorage`.
- À la connexion, l'app compare l'horodatage local et celui du cloud : **le plus récent gagne**.
  - Local plus récent → envoi vers le cloud.
  - Cloud plus récent → récupération dans l'app.
- Ensuite, chaque modification (séance, spot, avis, réglage) déclenche un envoi automatique après quelques secondes.
- Boutons manuels dans **Réglages → Compte Google** : *Synchroniser*, *Envoyer mes données*, *Récupérer du cloud*, *Se déconnecter*.
- Le **classement en ligne** ne publie que ton pseudo, ton XP et ton rang (jamais tes séances ni tes spots).

## En cas de souci

| Symptôme | Cause probable |
|---|---|
| Pas de bouton Google dans Réglages | `.env` absent ou build non relancé |
| `redirect_uri_mismatch` chez Google | URI de redirection Google Cloud ≠ `https://<projet>.supabase.co/auth/v1/callback` |
| Retour de Google → page vide / non connecté | URL de retour absente dans **Redirect URLs** de Supabase |
| Erreur `row-level security` | `supabase/schema.sql` non exécuté (ou partiellement) |
