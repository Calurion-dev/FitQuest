# Consignes projet — FitQuest

## Publication sur GitHub (règle permanente)

**À chaque modification de ce projet : commiter puis pousser directement sur GitHub, sans demander de confirmation.**

- Repo : https://github.com/Calurion-dev/FitQuest — branche `main`
- Ce dossier est un *worktree* git rattaché au repo situé dans `C:\Users\lucas` (répertoire personnel utilisé comme repo git). Pour ne pas polluer cette configuration partagée, **on n'ajoute pas de remote `origin` ici** : on pousse avec l'URL explicite et le helper d'identifiants de `gh`.

```powershell
git add -A
git commit -m "<message clair en français>"
git -c credential.helper= -c credential.helper="!gh auth git-credential" push https://github.com/Calurion-dev/FitQuest.git main:main
```

Si le push est refusé (historique distant modifié), faire `git fetch https://github.com/Calurion-dev/FitQuest.git main:refs/remotes/fq/main` puis rebaser sur `fq/main` (ne jamais forcer un push qui écraserait du travail existant).

## Déploiement GitHub Pages (règle permanente)

**Après chaque modification poussée sur `main`, déployer la nouvelle version en ligne.**

```powershell
npm run deploy   # build + push de dist/ sur la branche gh-pages
```

- App en ligne : https://calurion-dev.github.io/FitQuest/
- Pages est configuré en mode `legacy` sur la branche `gh-pages` (racine `/`), pas via GitHub Actions.
- Raison : le token `gh` local n'a **pas** le scope `workflow`, donc impossible de pousser un fichier dans `.github/workflows/`. Si le scope est ajouté un jour (`gh auth refresh -h github.com -s workflow`), on pourra basculer sur un workflow Actions (déploiement automatique à chaque push) et remplacer `scripts/deploy-pages.mjs`.
- Si Pages ne redéploie pas : `gh api -X POST repos/Calurion-dev/FitQuest/pages/builds` (ou relancer `npm run deploy`).
- `vite.config.ts` définit `base: '/FitQuest/'` **au build uniquement** (en dev on reste à `/`) et un manifest PWA relatif (`start_url`/`scope` = `.`). Ne pas casser ça : les assets seraient en 404 sous le sous-chemin.


## Avant chaque commit

```powershell
npm run build   # type-check TypeScript (tsc) + build Vite : doit passer sans erreur
```

## Conventions

- TypeScript strict, UI mobile-first en français, thème sombre « street ».
- Données 100 % locales (`localStorage`, store Zustand persisté) tant que la V2 backend n'est pas en place.
- Un fichier = une responsabilité : `src/game/` pour les règles (XP, quêtes, badges), `src/store/` pour l'état, `src/pages/` pour les écrans.

## Cartographie rapide

- Règles de jeu : `src/game/engine.ts` (XP, niveaux, progression), `src/game/quests.ts` (quotidiennes, hebdo, boss), `src/game/badges.ts`, `src/game/ranks.ts` (rangs type Classé Fortnite), `src/game/rivals.ts` (rivaux de la ligue locale, simulés tant qu'il n'y a pas de backend)
- Sauvegarde cloud / connexion Google : `src/lib/supabase.ts` (client, désactivé si pas de `.env`), `src/lib/cloud.ts` (appels Supabase), `src/store/useCloud.ts` (synchro), `src/components/CloudAccount.tsx` (UI Réglages), `supabase/schema.sql`, `docs/SUPABASE.md`
- Référentiel des mouvements : `src/data/movements.ts`
- État persisté : `src/store/useStore.ts` (+ `updatedAt`, qui sert à comparer local/cloud)
- Écrans : `src/pages/Home.tsx`, `Workout.tsx`, `Progress.tsx`, `Leaderboard.tsx`, `MapPage.tsx`, `Settings.tsx`
- Cahier des charges : `CDC.md`
