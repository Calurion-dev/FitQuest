# Cahier des Charges — Street Workout RPG (Web MVP)

## 1. Vision
Application web qui gamifie le street workout (mouvements de base uniquement) pour rendre l'entraînement régulier et motivant, façon RPG solo d'abord, social/clan en V2.
Utilisable au parc sur mobile (PWA), offline, saisie ultra-rapide.

## 2. Périmètre mouvements (scope fermé)
Uniquement les mouvements de base + leurs progressions directes :
- **Push :** Pompes classiques, Pompes larges, Pompes diamant, Dips aux barres
- **Pull :** Tractions pronation, Tractions supination, Tractions australiennes (progression)
- **Legs / Core :** Pistol squats assistés, Pistol squats, Squats sautés, Gainage planche
- Chaque mouvement : `id, nom, famille (push/pull/legs/core), coeff XP, niveau requis, progression_suivante, consigne technique, vidéo (V2)`

Hors scope MVP : muscle-up, planche, front lever, handstand, lest complexe.

## 3. Plateforme & Tech (MVP)
- **Web responsive mobile-first**, installable PWA.
- **Stack :** Vite + React + TypeScript + Tailwind CSS + Zustand (state) + localStorage (persistance) + Leaflet + OpenStreetMap (carte).
- **Pas de backend en MVP** : 100% local, offline-first, zéro inscription.
- **Trajectoire V2 :** Supabase (Auth + Postgres + PostGIS) pour partage spots, clans, leaderboard.

## 4. Personas & Core Loop
- Pratiquant street débutant/intermédiaire qui s'entraîne en parc, seul ou avec potes.
- Core loop : `Choisir séance → Logger séries en <10s/série → Timer repos → Écran loot XP/Level up → Quête/Badge/Boss débloqué → Revenir demain (streak)`.

## 5. Fonctionnalités MVP

### 5.1 Home / Héros (F1)
- Carte héros : pseudo, niveau global + barre XP, streak feu (jours/semaines).
- 4 stats RPG : Push / Pull / Legs / Endurance (niveau + barre).
- Quête du jour + prochaine récompense boss.
- Bouton CTA "Démarrer séance".

### 5.2 Logger Workout — Saisie rapide (F2)
- Création séance : libre ou à partir d'un template (Push, Pull, Legs, Full body).
- Ajout série en 2 taps : `[mouvement] [reps +/-] [valider]`, RPE optionnel.
- Timer repos auto (60/90/120s configurable), bouton +30s, skip.
- Fin séance : récap volume, total reps, durée, écran loot (XP gagné, level up, badges).
- Historique séances : liste + détail, suppression/édition.

### 5.3 Progression (F3)
- Courbes : rep max estimé par mouvement, volume cumulé/semaine.
- Niveaux par famille + par mouvement.
- Records : best série, best séance, total cumulé (ex: 1000 pompes).

### 5.4 Gamification Engine (F4)
- **XP :** `XP = reps * coeff_mouvement * bonus_streak`
  - Coeffs initiaux : Pompe=10, Dips=20, Traction=25, Australienne=10, Pistol=30, Pistol assisté=15, Squat sauté=12, Gainage=1xp/sec.
- **Niveaux :** courbe exponentielle `xp_next = 100 * level^1.5`. Level 1-100.
- **Quêtes :** quotidiennes ("50 pompes"), hebdo ("3 séances"), famille ("100 tractions cumulées").
- **Streak :** +10% XP si ≥3 séances / 7j glissants, compteur flamme, protection 1 joker/semaine.
- **Badges :** First 10 tractions, 10 dips d'affilée, 1000 pompes cumulées, 5 parcs visités, 30j streak.
- **Boss mensuel :** ex. "Boss 100 Pompes", "Boss 30 Tractions", "Boss 50 Dips" → récompense rare + titre.
- **Stats RPG :** chaque rep alimente Push/Pull/Legs/Endurance.

### 5.5 Carte Spots — Salles & Parcs (F5)
- Carte interactive (Leaflet/OSM), géoloc + centrage auto.
- 2 types : `salle` / `parc_street`.
- Ajouter spot : nom, type, position (clic carte ou GPS), équipements checklist (barre traction, barres dips, échelle, sol amorti, point eau), commentaire.
- Noter : 1-5 étoiles + avis texte, moyenne + nb avis affichés.
- Filtres : type, note mini, équipements, distance "près de moi" (<5km).
- Fiche spot : moyenne, liste avis, bouton "Démarrer séance ici" (lie la séance au spot → bonus XP Explorateur).
- MVP : stockage local (mes spots persos). V2 : partage communautaire + modération + photos.
- Bonus jeu : +50 XP premier entraînement dans un nouveau spot, badge Explorateur.

### 5.6 Réglages & Données (F6)
- Pseudo, poids (optionnel pour XP lesté V2), timers repos par défaut.
- Export/import JSON, reset données.
- Mode sombre street par défaut.

## 6. Modèle de données (localStorage v1)
```
Movement { id, name, family, coeffXp, levelRequired, description }
Workout { id, date, spotId?, durationSec, sets: WorkoutSet[] }
WorkoutSet { id, movementId, reps, seconds?, rpe?, restSec }
Player { pseudo, xpTotal, level, stats: {push,pull,legs,endurance}, streak, lastWorkoutDate, jokers }
Quest { id, type: daily|weekly|boss, title, target, progress, rewardXp, status }
Badge { id, name, condition, unlockedAt? }
Spot { id, name, type: salle|parc, lat, lng, equipments[], createdAt }
Review { id, spotId, rating 1-5, comment, date }
```

## 7. UX / UI
- Mobile-first, grosses zones tactiles (gants/parc), contraste fort, utilisable une main.
- Thème sombre "street night" + accents néon (vert XP, orange streak, violet boss).
- Saisie série <10s, timer lisible à 2m.
- Accessibilité : labels, taille texte ≥16px, pas de dépendance couleur seule.

## 8. Non-fonctionnel
- Perf : First load <2s 4G, Lighthouse PWA ≥90.
- Offline : app + données + carte tuiles de base en cache (workbox).
- Données : tout en local, export JSON, aucune donnée envoyée (MVP).
- Code : TS strict, composants testés pour moteur XP (vitest).

## 9. Phasage
- **P0 Setup :** Vite+TS+Tailwind+Zustand+PWA, design system, routing.
- **P1 Logger :** référentiel mouvements + F2 + historique.
- **P2 Jeu :** F1 + F4 (XP/levels/quêtes/streak/badges/boss) + écran loot.
- **P3 Progression + Carte :** F3 + F5 (Leaflet, CRUD spots, notes, filtres, lien séance-spot).
- **P4 Polish :** onboarding, templates séances, export/import, PWA install, tests.
- **V2 Social :** Supabase Auth+DB+PostGIS, clans, défis amis, leaderboard, spots communautaires + photos/modération.

## 10. Critères d'acceptation MVP
- [ ] Logger 3 séries en <1min avec gants, sans clavier.
- [ ] Fin séance → XP + level + quête mis à jour, persistés après reload.
- [ ] Ajouter un parc sur carte, lui mettre 5★ + avis, le retrouver après reload, filtrer >4★.
- [ ] Démarrer séance depuis fiche spot → bonus Explorateur accordé 1x/spot.
- [ ] Installable PWA, utilisable offline au parc.
- [ ] `npm run build` OK, tests moteur XP verts.

## 11. Questions ouvertes (à trancher avant dev)
- Leveling grind (Pokémon) vs runs/boss (roguelite) ? Défaut : mixte actuel.
- Garder Squats sautés / Gainage ou strict pompe/traction/dips/pistol ?
- Unités gainage : secondes vs reps ?
