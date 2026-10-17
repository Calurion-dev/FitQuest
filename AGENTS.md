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

## Avant chaque commit

```powershell
npm run build   # type-check TypeScript (tsc) + build Vite : doit passer sans erreur
```

## Conventions

- TypeScript strict, UI mobile-first en français, thème sombre « street ».
- Données 100 % locales (`localStorage`, store Zustand persisté) tant que la V2 backend n'est pas en place.
- Un fichier = une responsabilité : `src/game/` pour les règles (XP, quêtes, badges), `src/store/` pour l'état, `src/pages/` pour les écrans.

## Cartographie rapide

- Règles de jeu : `src/game/engine.ts` (XP, niveaux, progression), `src/game/quests.ts` (quotidiennes, hebdo, boss), `src/game/badges.ts`
- Référentiel des mouvements : `src/data/movements.ts`
- État persisté : `src/store/useStore.ts`
- Écrans : `src/pages/Home.tsx`, `Workout.tsx`, `Progress.tsx`, `MapPage.tsx`, `Settings.tsx`
- Cahier des charges : `CDC.md`
