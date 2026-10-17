# FitQuest

FitQuest transforme le sport en un jeu d'aventure captivant. Relevé des défis quotidiens, affronte tes amis en duel et gagne des points d'XP à chaque entraînement. Débloque des badges, grimpe dans le classement et fais évoluer ton avatar grâce à tes efforts physiques réels ! 🚀

> **État actuel — v0.1 (MVP)** : app web solo/offline centrée sur le street workout. Les duels entre amis, le classement en ligne et l'avatar évolutif sont prévus en V2.

**▶️ App en ligne : https://calurion-dev.github.io/FitQuest/**

## Ce que fait la v0.1

- **Héros** : pseudo, niveau global (courbe `100 × niveau^1.5`), barre XP, streak 🔥, 4 stats RPG (Push / Pull / Jambes / Endurance), quêtes du jour + de la semaine, boss du mois.
- **Séance** : templates Push / Pull / Jambes / Full body / Libre, saisie rapide (boutons -5 / -1 / +1 / +5), timer de repos (+30s / passer), liste des séries, écran loot (XP, level up, quêtes accomplies, badges, bonus explorateur).
- **Classement** : rang calqué sur le mode Classé de Fortnite (Bronze → Argent → Or → Platine → Diamant → Élite → Champion → Irréel, avec les divisions I/II/III), progression d'XP vers le rang suivant, échelle complète des 22 paliers et ligue locale de rivaux.
- **Progression** : volume hebdomadaire sur 12 semaines, niveau + record + courbe par mouvement, grille de 13 badges.
- **Spots** : carte interactive (Leaflet / OpenStreetMap), ajout d'une salle ou d'un parc en touchant la carte (équipements + note ★ optionnelle), filtres (type, note minimum, « près de moi » 5 km), fiche avec avis, bouton « S'entraîner ici » (+50 XP explorateur la première fois).
- **Réglages** : pseudo, repos par défaut (60/90/120/180 s), export / import JSON, réinitialisation.

## Mouvements de base

- **Push** : pompes, pompes larges, pompes diamant, dips
- **Pull** : tractions australiennes, tractions pronation, tractions supination
- **Jambes** : pistol squat assisté, pistol squat, squats sautés
- **Gainage** : planche (comptée en secondes)

## Barème XP

`XP = répétitions (ou secondes) × coefficient du mouvement`, avec +10 % si au moins 3 séances sur les 7 derniers jours.

Coefficients : pompes 10, pompes larges 10, pompes diamant 12, dips 20, australiennes 10, tractions 25, pistol assisté 15, pistol 30, squats sautés 12, gainage 1/s.

## Stack

Vite + React + TypeScript + Tailwind CSS v4 + Zustand (persistance `localStorage`) + Leaflet (fond de carte sombre CARTO) + vite-plugin-pwa.

Aucun backend : toutes les données restent dans le navigateur (export / import JSON dans Réglages).

## Lancer le projet

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + build de production dans dist/
npm run preview  # sert le build
```

## Structure

```
src/
  components/   Layout (nav), Charts (barres + sparkline), SpotMap (Leaflet), Stars
  data/         référentiel des mouvements, équipements, libellés
  game/         engine (XP, niveaux, progression), quests (jour/semaine/boss), badges
  lib/          utilitaires dates (jour/semaine/mois, streak), géo, ids
  pages/        Home, Workout, Progress, MapPage, Settings
  store/        store Zustand persisté (joueur, séances, spots, avis, quêtes, badges)
```

## Roadmap

- **V2** : comptes en ligne (Supabase), duels et défis entre amis, classement, avatar évolutif, spots communautaires partagés (photos + modération).
- **Plus tard** : programmes guidés, RPE, notifications de rappel, mode hors-ligne complet avec cache des tuiles de carte.

Voir [`CDC.md`](./CDC.md) pour le cahier des charges complet.
