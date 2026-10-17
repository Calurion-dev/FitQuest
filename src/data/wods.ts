// Banque de WODs : 132 séances poids du corps / street lifting / course.
// Généré depuis le guide « ressources WOD » (16/10/2026) — sources citées par entrée.

export type WodCategory = 'hybride' | 'darebee' | 'street' | 'lifting' | 'run' | 'hyrox'

export interface Wod {
  id: string
  name: string
  /** Format : AMRAP, EMOM, For Time, fractionné… */
  format: string
  /** Contenu exact de la séance. */
  detail: string
  /** Niveau indicatif (scaling possible). */
  level: string
  source: string
  category: WodCategory
}

export const WOD_CATEGORIES: { id: WodCategory; label: string; icon: string }[] = [
  { id: 'hybride', label: "Cross / Hybrides", icon: '💥' },
  { id: 'darebee', label: "DAREBEE", icon: '🖼️' },
  { id: 'street', label: "Street Workout", icon: '🏙️' },
  { id: 'lifting', label: "Street Lifting", icon: '🏋️' },
  { id: 'run', label: "Course / Sprint", icon: '🏃' },
  { id: 'hyrox', label: "HYROX / Endurance", icon: '🔥' }
]

export const WODS: Wod[] = [
  {
    id: "murph",
    name: "Murph",
    format: "For Time",
    detail: "1 mile Run + 100 Pull-Ups + 200 Push-Ups + 300 Air Squats + 1 mile Run, lest 20/14 lb option, partition OK",
    level: "Hero Avancé",
    source: "https://wodwell.com/wod/murph/",
    category: 'hybride'
  },
  {
    id: "mini-half-murph",
    name: "Mini / Half Murph",
    format: "For Time raccourci",
    detail: "Half : 800m + 50/100/150 + 800m. Mini : 400m + 25/50/75 + 400m",
    level: "Débutant à Inter",
    source: "https://wodwell.com/wod/murph/",
    category: 'hybride'
  },
  {
    id: "cindy",
    name: "Cindy",
    format: "AMRAP 20'",
    detail: "5 Pull-Ups + 10 Push-Ups + 15 Air Squats, max rounds",
    level: "Débutant à Inter",
    source: "https://wodwell.com/wod/cindy/",
    category: 'hybride'
  },
  {
    id: "cindy-run",
    name: "Cindy + Run",
    format: "Buy-in/out + AMRAP",
    detail: "1 mile buy-in + AMRAP 20' Cindy + 1 mile cash-out. Court : 400m entre chaque 5 rounds",
    level: "Inter",
    source: "https://wodwell.com/wod/cindy/",
    category: 'hybride'
  },
  {
    id: "chelsea",
    name: "Chelsea",
    format: "EMOM 30'",
    detail: "Chaque minute : 5 Pull-Ups + 10 Push-Ups + 15 Squats. Si échec : max rounds",
    level: "Inter à Avancé",
    source: "https://wodwell.com/wod/chelsea/",
    category: 'hybride'
  },
  {
    id: "chelsea-200m-enduro",
    name: "Chelsea + 200m Enduro",
    format: "EMOM alterné 30-40'",
    detail: "Min impair 200m sprint / Min pair 1 round Chelsea",
    level: "Avancé",
    source: "https://wodwell.com/wod/chelsea/",
    category: 'hybride'
  },
  {
    id: "mary",
    name: "Mary",
    format: "AMRAP 20'",
    detail: "5 HSPU + 10 Pistols alternés + 15 Pull-Ups",
    level: "Avancé gym",
    source: "https://wodwell.com/wod/mary/",
    category: 'hybride'
  },
  {
    id: "mary-run",
    name: "Mary + Run",
    format: "For Time 3-5 rounds",
    detail: "400m Run + 1 round Mary (5 HSPU / 10 Pistols / 15 Pull-Ups)",
    level: "Avancé",
    source: "https://wodwell.com/wod/mary/",
    category: 'hybride'
  },
  {
    id: "barbara",
    name: "Barbara",
    format: "5 rounds FT repos 3'",
    detail: "Par round : 20 Pull-Ups + 30 Push-Ups + 40 Sit-Ups + 50 Squats",
    level: "Inter à Avancé",
    source: "https://wodwell.com/wod/barbara/",
    category: 'hybride'
  },
  {
    id: "barbara-run",
    name: "Barbara + Run",
    format: "5 rounds FT",
    detail: "Chaque round Barbara + 400m Run, repos 3'",
    level: "Avancé",
    source: "https://wodwell.com/wod/barbara/",
    category: 'hybride'
  },
  {
    id: "angie",
    name: "Angie",
    format: "Chipper FT",
    detail: "100 Pull-Ups + 100 Push-Ups + 100 Sit-Ups + 100 Squats, partition libre",
    level: "Inter volume",
    source: "https://wodwell.com/wod/angie/",
    category: 'hybride'
  },
  {
    id: "angie-mile",
    name: "Angie + Mile",
    format: "Chipper + Run FT",
    detail: "1 mile + Angie 100/100/100/100 + 1 mile. Scaled 50/50/50/50 + 800m",
    level: "Avancé Endurance",
    source: "https://wodwell.com/wod/angie/",
    category: 'hybride'
  },
  {
    id: "loredo",
    name: "Loredo",
    format: "For Time 6 rounds",
    detail: "24 Air Squats + 24 Push-Ups + 24 Walking Lunges + 400m Run x6",
    level: "Hero",
    source: "https://wodwell.com/wod/loredo/",
    category: 'hybride'
  },
  {
    id: "bert",
    name: "Bert",
    format: "For Time",
    detail: "50 Burpees / 400m / 100 Push-Ups / 400m / 150 Lunges / 400m / 200 Squats / 400m / 150 Lunges / 400m / 100 Push-Ups / 400m / 50 Burpees",
    level: "Hero très long",
    source: "https://wodwell.com/wod/bert/",
    category: 'hybride'
  },
  {
    id: "payne-train",
    name: "Payne Train",
    format: "For Time",
    detail: "300m + 5-4-3-2-1 rounds Cindy entre chaque 300m + 300m final",
    level: "Inter-Avancé",
    source: "https://wodwell.com/wod/the-payne-train/",
    category: 'hybride'
  },
  {
    id: "nicole",
    name: "Nicole",
    format: "AMRAP 20'",
    detail: "400m Run + Max Pull-Ups chaque round, score = total Pull-Ups",
    level: "Benchmark barre",
    source: "https://wodwell.com/wod/nicole/",
    category: 'hybride'
  },
  {
    id: "helen",
    name: "Helen",
    format: "For Time 3 rounds",
    detail: "400m Run + 21 KB Swings 1.5/1 pood + 12 Pull-Ups",
    level: "Benchmark KB+barre",
    source: "https://wodwell.com/wod/helen/",
    category: 'hybride'
  },
  {
    id: "kelly",
    name: "Kelly",
    format: "For Time 5 rounds",
    detail: "400m Run + 30 Box Jumps 24/20 + 30 Wall Balls 20/14",
    level: "Benchmark box+medball",
    source: "https://wodwell.com/wod/kelly/",
    category: 'hybride'
  },
  {
    id: "nancy",
    name: "Nancy",
    format: "For Time 5 rounds",
    detail: "400m Run + 15 OHS 95/65. Inter 75/55, Débutant 200m + 10 OHS 45/35",
    level: "Rx/Inter/Débutant",
    source: "https://wodwell.com/wod/nancy/",
    category: 'hybride'
  },
  {
    id: "eva",
    name: "Eva",
    format: "For Time 5 rounds",
    detail: "800m Run + 30 KB Swings 2/1.5 + 30 Pull-Ups",
    level: "Benchmark long",
    source: "https://wodwell.com/wod/eva/",
    category: 'hybride'
  },
  {
    id: "daniel",
    name: "Daniel",
    format: "For Time",
    detail: "50 Pull-Ups / 400m / 21 Thrusters 95/65 / 800m / 21 Thrusters / 400m / 50 Pull-Ups",
    level: "Hero",
    source: "https://wodwell.com/wod/daniel/",
    category: 'hybride'
  },
  {
    id: "coffland",
    name: "Coffland",
    format: "Hang 6' cumul + FT",
    detail: "Chaque rupture Hang = 800m Run + 30 Push-Ups jusqu'à 6'",
    level: "Hero barre",
    source: "https://wodwell.com/wod/coffland/",
    category: 'hybride'
  },
  {
    id: "whitten",
    name: "Whitten",
    format: "For Time 5 rounds",
    detail: "22 KB Swings + 22 Box Jumps + 400m + 22 Burpees + 22 Wall Balls",
    level: "Hero",
    source: "https://wodwell.com/wod/whitten/",
    category: 'hybride'
  },
  {
    id: "hotshots-19",
    name: "Hotshots 19",
    format: "For Time 6 rounds",
    detail: "30 Air Squats + 19 Power Cleans 135/95 + 7 Strict Pull-Ups + 400m",
    level: "Hero",
    source: "https://wodwell.com/wod/hotshots-19/",
    category: 'hybride'
  },
  {
    id: "9-11-tribute",
    name: "9/11 Tribute",
    format: "For Time",
    detail: "2001m Run + 11 Box Jumps + 11 Thrusters 125/85 + 11 C2B + 11 Power Cleans 175/115 + 11 HSPU + 11 KB Swings + 11 T2B + 11 Deadlifts + 11 Push Jerks + 2001m Row",
    level: "Memorial très avancé",
    source: "https://wodwell.com/wod/911-tribute-wod/",
    category: 'hybride'
  },
  {
    id: "jt-run",
    name: "JT + Run",
    format: "21-15-9 + Run FT",
    detail: "21-15-9 HSPU + Ring Dips + Push-Ups + 400m entre chaque round",
    level: "Avancé poussée",
    source: "https://wodwell.com/wod/jt/",
    category: 'hybride'
  },
  {
    id: "michael",
    name: "Michael",
    format: "For Time 3 rounds",
    detail: "800m Run + 50 Back Extensions + 50 Sit-Ups",
    level: "Inter",
    source: "https://wodwell.com/wod/michael/",
    category: 'hybride'
  },
  {
    id: "bull",
    name: "Bull",
    format: "For Time 2 rounds",
    detail: "200 DU (ou 400m sub) + 50 OHS 135/95 + 50 Pull-Ups + 1 mile Run",
    level: "Avancé",
    source: "https://wodwell.com/wod/bull/",
    category: 'hybride'
  },
  {
    id: "chad-1000x",
    name: "Chad 1000X",
    format: "Chipper FT lest 45/35",
    detail: "1000 Box Step-Ups 20\". Scaled 500 reps / sans lest / 12-16\"",
    level: "Avancé mental",
    source: "https://wodwell.com/wod/chad/",
    category: 'hybride'
  },
  {
    id: "cf-260928-6x800m",
    name: "CF 260928 6x800m",
    format: "Every 6' x6",
    detail: "800m chaque 6', viser <4:30. Inter 600m, Débutant 400m",
    level: "Rx/Inter/Déb",
    source: "https://www.crossfit.com/workout/",
    category: 'hybride'
  },
  {
    id: "cf-260922-thruster-pull-run",
    name: "CF 260922 Thruster+Pull+Run",
    format: "For Time 3 rounds",
    detail: "15 Thrusters 65/95 + 15 Pull-Ups + 400m. Inter 15/10 55/75, Déb 10 Thr 35/45 + 10 Jumping Pull + 300m",
    level: "Rx/Inter/Déb",
    source: "https://www.crossfit.com/workout/",
    category: 'hybride'
  },
  {
    id: "cf-261006-double-run-midline",
    name: "CF 261006 Double Run Midline",
    format: "For Time",
    detail: "1600m + 100 GHD Sit-Ups + 100 Back Ext + 1600m. Inter 1200m+75/75, Déb 800m+50 AbMat+50 Good Mornings PVC",
    level: "Rx/Inter/Déb",
    source: "https://www.crossfit.com/workout/",
    category: 'hybride'
  },
  {
    id: "cf-261012-push-jerk-sprint",
    name: "CF 261012 Push Jerk + Sprint",
    format: "Every 5' x5",
    detail: "5 Push Jerks 75% 1RM + 30s rest + 100m sprint <25s",
    level: "Tous, ajuster charge",
    source: "https://www.crossfit.com/workout/",
    category: 'hybride'
  },
  {
    id: "emom-pull-sprint",
    name: "EMOM Pull + Sprint",
    format: "EMOM 20-30'",
    detail: "Min impair 150-200m sprint / Min pair 5-10 Strict Pull-Ups + 10 Push-Ups. Sans barre : rows inversés / burpees",
    level: "Inter",
    source: "https://wodwell.com/wods/movement/run-workouts/",
    category: 'hybride'
  },
  {
    id: "amrap-shuttle-burpees",
    name: "AMRAP Shuttle + Burpees",
    format: "AMRAP 20'",
    detail: "100m shuttle + 10 Burpees + 15 Squats + 10 Sit-Ups. Variante EMOM impair sprint pair cali",
    level: "Tous, scaler reps",
    source: "https://darebee.com/workouts.html",
    category: 'hybride'
  },
  {
    id: "park-walk-in-a-park",
    name: "Park - Walk in a Park",
    format: "6 stations x10, 5 sets repos 2'",
    detail: "Jumping jacks + Tricep dips banc + Side leg raises arbre + Squats + Calf raises + Lunges. Harder 20 reps, Easier step jacks",
    level: "3/5",
    source: "https://darebee.com/workouts/park-workout.html",
    category: 'darebee'
  },
  {
    id: "playground",
    name: "Playground",
    format: "6 stations L1 3 / L2 5 / L3 7 sets repos 2'",
    detail: "Monkey walks x10 + Chin-Ups max + One-leg squats cadre x10 + Hanging knee ups x10 + Side leg swings x10 + Calf raises x10. Maison : bear crawl, rows table",
    level: "3/5",
    source: "https://darebee.com/workouts/playground-workout.html",
    category: 'darebee'
  },
  {
    id: "parkour-basics",
    name: "Parkour Basics",
    format: "3x3 exos L1 3 / L2 5 / L3 7 sets",
    detail: "Lunges + Bear crawl + Push-Ups / Broad jumps + Squats + Knee-tucks / Wall dips + Plant plyos + Wall climbers. Muret requis",
    level: "5/5",
    source: "https://darebee.com/workouts/parkour-workout.html",
    category: 'darebee'
  },
  {
    id: "hold-my-beer",
    name: "Hold My Beer",
    format: "3 couples move+hold L1 3 / L2 5 / L3 7",
    detail: "10 Half jack squats + 10s squat hold / 10 Basic burpees + 10s plank / 10 Flutter kicks + 10s raised legs",
    level: "4/5",
    source: "https://darebee.com/workouts/beer-workout.html",
    category: 'darebee'
  },
  {
    id: "runner",
    name: "Runner",
    format: "Circuit 3/5/7 sets repos 2'",
    detail: "7 stations : high knees + 20 climbers + high knees + 10 jumping lunges + high knees + 10 jumping lunges + 20 climbers",
    level: "4/5 Inter",
    source: "https://darebee.com/workouts/runner-workout.html",
    category: 'darebee'
  },
  {
    id: "hollow-hold",
    name: "Hollow Hold",
    format: "Circuit abs",
    detail: "3x 20-count hollow holds + Bridges + Long arm crunches + Back extensions. Lombaires au sol",
    level: "3/5",
    source: "https://darebee.com/workouts/hollow-hold-workout.html",
    category: 'darebee'
  },
  {
    id: "3-2-1-hold",
    name: "3-2-1 Hold",
    format: "3 holds L1 1 / L2 2 / L3 3 sets",
    detail: "3-min squat hold + 2-min plank + 1-min push-up plank bas. Variante barre 3-2-1 Plus dead hang",
    level: "5/5",
    source: "https://darebee.com/workouts/3-2-1-workout.html",
    category: 'darebee'
  },
  {
    id: "handstand-prep",
    name: "Handstand Prep",
    format: "Straight sets repos 60s",
    detail: "20 Tricep dips x3 + 10 Raised pike push-ups x3 + 30s Box walking x3 + 30s Reverse grip plank x3 + 30s Hollow x5 + attempt mur",
    level: "5/5",
    source: "https://darebee.com/workouts/handstand-prep-workout.html",
    category: 'darebee'
  },
  {
    id: "the-crow",
    name: "The Crow",
    format: "7 stations 3/4/5 sets repos 2'",
    detail: "Max Pull-Ups + 10 Single leg squats + 10 Squat hold toe rolls + 10 Jumping lunges + 10 Plank walk-outs + 10 Push-Ups + 10 Thigh taps. Easier scapular pulls",
    level: "Hard",
    source: "https://darebee.com/workouts/crow-workout.html",
    category: 'darebee'
  },
  {
    id: "l-sit-prep",
    name: "L-Sit Prep",
    format: "Straight sets repos 60s",
    detail: "20 Dips x4 + 20 Leg raises x4 + 3 holds 30s x2 tuck hold + boat + tuck sit + attempt L-sit",
    level: "Inter-Avancé",
    source: "https://darebee.com/workouts/l-sit-prep-workout.html",
    category: 'darebee'
  },
  {
    id: "planche-prep",
    name: "Planche Prep",
    format: "5 stations x4 sets repos 60s",
    detail: "8 Plank walk-outs + 10s Leaning plank + 10s Leaning + leg raised + 5 Crane lifts + L-sit failure",
    level: "5/5",
    source: "https://darebee.com/workouts/planche-prep-workout.html",
    category: 'darebee'
  },
  {
    id: "pistol-prep",
    name: "Pistol Prep",
    format: "Straight sets repos 60s",
    detail: "10 Squats x3 + Balance hold 30s/jambe + Balance half squat 30s/jambe + 10 Side lunges x3 + 10 Split squats x3 chaise",
    level: "5/5",
    source: "https://darebee.com/workouts/pistol-squat-prep-workout.html",
    category: 'darebee'
  },
  {
    id: "one-arm-push-up-prep",
    name: "One-Arm Push-Up Prep",
    format: "Straight sets repos 60s",
    detail: "10 Diamond x3 + 10 Dragon x3 + 10 Archer x3 + 30 Plank arm raises x3 + 30s one-arm plank/côté. Test 10 archer fingertips",
    level: "Avancé",
    source: "https://darebee.com/workouts/one-arm-pushup-prep-workout.html",
    category: 'darebee'
  },
  {
    id: "muscle-up-prep",
    name: "Muscle-Up Prep",
    format: "5 stations x3 max reps/time repos 60s",
    detail: "Pull-Ups max + Explosive pull-ups max + Lateral swings max + Pull-up hold max + Bar dip hold max. Prérequis 10 strict",
    level: "5/5",
    source: "https://darebee.com/workouts/muscle-up-prep-workout.html",
    category: 'darebee'
  },
  {
    id: "hang-in-there",
    name: "Hang In There",
    format: "Foundation hangs",
    detail: "Base grip + dead hang avant pull-ups/muscle-up",
    level: "Débutant/Inter",
    source: "https://darebee.com/workouts/hang-in-there-workout.html",
    category: 'darebee'
  },
  {
    id: "front-lever-prep",
    name: "Front Lever Prep",
    format: "Collection Bar Skills",
    detail: "Progression front-lever, barre requise",
    level: "Avancé 5/5",
    source: "https://darebee.com/workouts/front-lever-prep-workout.html",
    category: 'darebee'
  },
  {
    id: "one-arm-pull-up-prep",
    name: "One-Arm Pull-Up Prep",
    format: "Collection Bar Skills",
    detail: "Progression one-arm pull-up",
    level: "Avancé 5/5",
    source: "https://darebee.com/workouts/one-arm-pullup-prep-workout.html",
    category: 'darebee'
  },
  {
    id: "wrist-mobility",
    name: "Wrist Mobility",
    format: "Articulaire",
    detail: "Wrists + hand-mobility + shoulder-opener + spine-mobility, préalable skills",
    level: "Tous / Light",
    source: "https://darebee.com/workouts/wrist-mobility-workout.html",
    category: 'darebee'
  },
  {
    id: "planet-basic-beginner",
    name: "Planet Basic Beginner",
    format: "Circuit 4 tours 30s/5'",
    detail: "Tractions supi serrées 7 + Tractions prona 5 + Dips 6 + Pompes 15 + Relevés jambes 5 + Squats sautés 9 + Australiennes 15",
    level: "Débutant 3/10",
    source: "https://www.planet-streetworkout.org/basic-beginner/",
    category: 'street'
  },
  {
    id: "planet-pull-and-push",
    name: "Planet Pull and Push",
    format: "Circuit 5 tours 30s/4'",
    detail: "Pompes 10 + Tractions 5 + Pompes inclinées 15 + Tractions inclinées supi 10 + Négatives supi 5 + Hindoues 8",
    level: "Débutant 3/10",
    source: "https://www.planet-streetworkout.org/pull-push/",
    category: 'street'
  },
  {
    id: "planet-muscle-up-hunt",
    name: "Planet Muscle Up Hunt",
    format: "Circuit 3 tours repos mini/2'",
    detail: "Dips barre droite 12 + Pompes claquées 10 + Head bangers 10 + Typewriter 10 + Muscle-ups sautés 12 + Tractions claquées 8 + Poitrine 10",
    level: "Inter 5/10",
    source: "https://www.planet-streetworkout.org/muscle-up-hunt/",
    category: 'street'
  },
  {
    id: "planet-fat-burner-run",
    name: "Planet Fat Burner + Run",
    format: "Circuit 3 tours /2'",
    detail: "Jumping jacks 1'30 + Tractions larges 15 + Supi 15 + Course 150m + Pompes claquées 10 + Dips barre 10 + Jumping jacks 1'30 + Squats sautés 15",
    level: "Inter 5/10",
    source: "https://www.planet-streetworkout.org/full-body-fat-burner/",
    category: 'street'
  },
  {
    id: "planet-madbarz-explode",
    name: "Planet Madbarz Explode",
    format: "Circuit 5 tours 30s/3'",
    detail: "Pompes claquées dos 15 + Dips explosifs 20 + Tractions explosives poitrine 20 + Pompes inclinées rapides 60 + Tractions claquées 12 + Pompes claquées 18 + Squats sautés 30",
    level: "Avancé 9/10",
    source: "https://www.planet-streetworkout.org/madbarz-explode/",
    category: 'street'
  },
  {
    id: "planet-aphrodite",
    name: "Planet Aphrodite",
    format: "For Time 50-40-30-20-10 total 450",
    detail: "Chaque tour Burpees + Squats + Situps aux reps. Bench <25' début <20' bon record 15:05",
    level: "Inter 5/10",
    source: "https://www.planet-streetworkout.org/aphrodite-freeletics/",
    category: 'street'
  },
  {
    id: "madbarz-back-biceps-hazard",
    name: "Madbarz Back Biceps Hazard",
    format: "5 exos 4 séries",
    detail: "Pull-Ups 4x10 + Negative Chin-Ups 4x10 + Inclined Chin-Ups 4x15 + Wide Pull-Ups 4x8 + Shoulder Chin-Ups 4x10",
    level: "Inter dos",
    source: "https://www.madbarz.com/blog/234-3-workouts-for-a-shredded-back",
    category: 'street'
  },
  {
    id: "madbarz-upper-body-day",
    name: "Madbarz Upper Body Day",
    format: "5 exos 4 séries dos/pecs",
    detail: "Push-Up Hold 4x25s + Pull-Ups 4x10 + T-Rotation Plank 4x15 + Decline Pike 4x10 + Pull-Up Hold 4x15s",
    level: "Inter",
    source: "https://www.madbarz.com/blog/234-3-workouts-for-a-shredded-back",
    category: 'street'
  },
  {
    id: "madbarz-back-blaster",
    name: "Madbarz Back Blaster",
    format: "Custom 4 exos 4 séries",
    detail: "Archer Incline 4x8 + 90-Deg Hold 4x5s + Commando 4x10 + Around World 4x8",
    level: "Inter-Avancé",
    source: "https://www.madbarz.com/blog/234-3-workouts-for-a-shredded-back",
    category: 'street'
  },
  {
    id: "madbarz-weighted-upper",
    name: "Madbarz Weighted Upper",
    format: "4 rounds FT cap 25'",
    detail: "8 Dips +10kg + 6 Tractions +5kg + 12 Pompes gilet 10kg repos 30s",
    level: "Déb-Inter lesté",
    source: "https://madbarz.com/blog",
    category: 'street'
  },
  {
    id: "solo-01-fundamentals",
    name: "Solo 01 Fundamentals",
    format: "Full 7 exos 4 séries 45-60' 2-3x/sem 1'30/3'",
    detail: "Australian 4x10 + Negative pull 4x5 + Floor dips 4x10 + Push-Ups 4x8 + Climbers 4x30s + Squats 4x15 + Calf 4x12",
    level: "Débutant",
    source: "https://www.solostreetworkout.com/en/beginner-calisthenics-workouts/",
    category: 'street'
  },
  {
    id: "solo-03-chin-ups-power",
    name: "Solo 03 Chin-Ups Power",
    format: "Full 7 exos 4 séries",
    detail: "Australian 4x12 + Chin-Ups 4x5 + Dips parallèles 4x8 + Push-Ups 4x10 + Knee raises 4x12 + Jump squats 4x12 + Bulgarian 4x12",
    level: "Déb avancé",
    source: "https://www.solostreetworkout.com/en/beginner-calisthenics-workouts/",
    category: 'street'
  },
  {
    id: "solo-04-bridge-to-inter",
    name: "Solo 04 Bridge to Inter",
    format: "Full 7 exos 4 séries",
    detail: "Australian 4x15 + Overhand 4x5 + Pike 4x8 + Straight bar dips 4x8 + L-sit Max + Jump squats 4x15 + Bulgarian 4x12. Sortie 8 pull 10 pike 10 dips 20 pompes 25 squats",
    level: "Déb vers Inter",
    source: "https://www.solostreetworkout.com/en/beginner-calisthenics-workouts/",
    category: 'street'
  },
  {
    id: "solo-hannibal-for-king",
    name: "Solo Hannibal for King",
    format: "Supersets 5 rounds + core 3 rounds 45s/3'",
    detail: "x5 Pull 6 + Dips 8 + Push 12 + x3 Knee Raises 10 + L-sit 10s + Ab Wheel 8 genoux. Prérequis 10 pull 15 dips 20 pompes",
    level: "Inter",
    source: "https://www.solostreetworkout.com/en/intermediate-calisthenics-workouts/",
    category: 'street'
  },
  {
    id: "solo-leap-to-muscle-up",
    name: "Solo Leap to Muscle-Up",
    format: "Upper 7 exos 4-5 séries 1'30/3'",
    detail: "Muscle-Ups 4x3 + HSPU assist chest-wall 5x4 + Pull 4x12-11-10-9 + HSPU back-wall 4x8 + Bar Rows 4x5 + Dips 4x12 + Push 4x15",
    level: "Inter avancé",
    source: "https://www.solostreetworkout.com/en/intermediate-calisthenics-workouts/",
    category: 'street'
  },
  {
    id: "callisthenies-hiit-3-niveaux",
    name: "Callisthénies HIIT 3 niveaux",
    format: "3 circuits + échauff 6'",
    detail: "Déb 15' : genoux 20/40 + Squat 20/40 + Pompe inclinée 20/40 + Climber 20/40 x3 repos 1'. Inter 18' : squat jump + pompe stricte + fentes + climber + planche 30/30 x3 repos 1'30. Avancé 12' : Tabata 20/10 squat jump/pompe explo + Tabata traction explo/burpee",
    level: "Tous",
    source: "https://www.callisthenies.fr/hiit-poids-du-corps/",
    category: 'street'
  },
  {
    id: "callisthenies-ppl",
    name: "Callisthénies PPL",
    format: "Split 3 séances 3j/4j/6j",
    detail: "Push Pompes 4x8-18 + Dips 3-4x6-12 + Pike 3x6-12 + Serrées 3x8-15 + Pseudo lean 3x20-40s. Pull Prona 4x3-12 + Australien 4x10-18 + Supi 3x3-12 + Scapu 3x10-12 + Jambes suspendu 3x8-10. Legs Bulgare 3-4x8-15 + Pistol 3x5-8 + SDT 1 jambe 3x10-12 + Nordic 3x5-10 + Mollets 3x15-20",
    level: "Inter",
    source: "https://www.callisthenies.fr/push-pull-legs-poids-du-corps/",
    category: 'street'
  },
  {
    id: "thenx-muscle-ups-easy",
    name: "THENX Muscle-Ups Easy",
    format: "Skill 5 drills",
    detail: "Leg pull-ups + Straight bar dips + Negative muscle-up lente + Jumping muscle-up + Leg raises",
    level: "Inter-Avancé",
    source: "https://thenx.com/blogs/news/article-11",
    category: 'street'
  },
  {
    id: "thenx-6-min-chest",
    name: "THENX 6-Min Chest",
    format: "EMOM-like 6x40/20 =6'",
    detail: "One-arm fingertip 20+20s + Side-to-side + Archer + Classiques + Typewriter + Pike. Scaler surélevé",
    level: "Inter",
    source: "https://thenx.com/blogs/news/article-17",
    category: 'street'
  },
  {
    id: "classic-street-total-5x5",
    name: "Classic Street Total 5x5",
    format: "5x5 Force repos 3'",
    detail: "Traction +15-30kg 5x5 + Dips +20-40kg 5x5 + Squat 80-120kg 5x5",
    level: "Inter",
    source: "https://streetlifting.com",
    category: 'lifting'
  },
  {
    id: "5-3-1-street-adaptation",
    name: "5/3/1 Street Adaptation",
    format: "Cycle 5/3/1 65%x5 75%x5 85%x5+",
    detail: "Jour A Dips + Tractions lestés, Jour B Squat + Soulevé. AMRAP dernière série",
    level: "Inter-Avancé",
    source: "https://jimwendler.com/blogs/jimwendler-com/101077382-boring-but-big",
    category: 'lifting'
  },
  {
    id: "stronglifts-weighted",
    name: "StrongLifts Weighted",
    format: "5x5 A/B 3x/sem",
    detail: "A Squat 5x5 + Dips +10-30kg 5x5 + Traction 5x5. B Squat + Dips + Rowing lesté",
    level: "Débutant lesté",
    source: "https://stronglifts.com/5x5/",
    category: 'lifting'
  },
  {
    id: "madbarz-max-strength-split",
    name: "Madbarz Max Strength Split",
    format: "5x5 + 3x8",
    detail: "Dips +20kg 5x5 + Tractions +15kg 5x5 + Goblet 24-32kg 3x8 + Gainage lesté 3x45s",
    level: "Inter",
    source: "https://madbarz.com",
    category: 'lifting'
  },
  {
    id: "thenx-weighted-beast",
    name: "Thenx Weighted Beast",
    format: "EMOM 24'",
    detail: "Min1 5 Tractions +10kg / Min2 8 Dips +15kg / Min3 12 Squats gilet 20kg / Min4 rest",
    level: "Inter",
    source: "https://www.thenx.com",
    category: 'lifting'
  },
  {
    id: "thenx-weighted-mu-builder",
    name: "Thenx Weighted MU Builder",
    format: "Ladder 1-5-1",
    detail: "1-2-3-4-5-4-3-2-1 Tractions +5-10kg + 5 Dips entre paliers + 3x3 MU élastique",
    level: "Avancé",
    source: "https://thenx.com",
    category: 'lifting'
  },
  {
    id: "bar-brothers-weighted-king",
    name: "Bar Brothers Weighted King",
    format: "AMRAP 20'",
    detail: "5 Dips +20kg + 5 Tractions +15kg + 10 Squats sautés gilet 10kg + 10 Pompes diamant",
    level: "Inter-Avancé",
    source: "https://www.youtube.com/@BarBrothers",
    category: 'lifting'
  },
  {
    id: "caliverse-street-ladder",
    name: "Caliverse Street Ladder",
    format: "Ladder EMOM 5 tours",
    detail: "5 Tractions +20kg + 10 Dips +20kg + 15 Squats +40kg. Si échec -10% charge",
    level: "Avancé",
    source: "https://caliverse.app",
    category: 'lifting'
  },
  {
    id: "fitnessfaqs-strict-strength",
    name: "FitnessFAQs Strict Strength",
    format: "Cluster 6x2 tempo 31X0 repos 2'30",
    detail: "Tractions 6x2 85-90% (+25-40kg) + Dips 6x2 85% (+30-50kg)",
    level: "Avancé",
    source: "https://fitnessfaqs.com/blog",
    category: 'lifting'
  },
  {
    id: "fitnessfaqs-hypertrophie-force",
    name: "FitnessFAQs Hypertrophie-Force",
    format: "4x6-8",
    detail: "Dips +15-25kg 4x8 + Supi +10-20kg 4x6 + Bulgarian 20-30kg 3x8/jambe",
    level: "Inter",
    source: "https://fitnessfaqs.com",
    category: 'lifting'
  },
  {
    id: "comp-prep-sbdip-1rm",
    name: "Comp Prep SBDip 1RM",
    format: "Singles 1RM 3 essais",
    detail: "Simul comp : Traction 1RM + Dips 1RM + MU lesté 3x1 +10kg + Squat 1RM",
    level: "Comp Avancé",
    source: "https://streetlifting.com",
    category: 'lifting'
  },
  {
    id: "triplet-squat-dip-pull-ft",
    name: "Triplet Squat-Dip-Pull FT",
    format: "For Time 5 rounds cap 30'",
    detail: "5 Squats 100kg + 7 Dips +25kg + 5 Tractions +20kg. Ceinture obligatoire",
    level: "Avancé",
    source: "https://www.crossfit.com",
    category: 'lifting'
  },
  {
    id: "weighted-emom-30-power",
    name: "Weighted EMOM 30 Power",
    format: "EMOM 30'",
    detail: "Pair 3 Dips +40kg / Impair 3 Tractions +30kg. 10 Air squats pénalité si minute ratée",
    level: "Avancé",
    source: "https://calisthenics-parks.com",
    category: 'lifting'
  },
  {
    id: "3x3-peaking-cycle",
    name: "3x3 Peaking Cycle",
    format: "3x3 + back-off 2x8 -20% sem 1-3",
    detail: "Dips +30-50kg 3x3 + Tractions +20-35kg 3x3 + Squat 120-160kg 3x3",
    level: "Avancé",
    source: "https://jimwendler.com",
    category: 'lifting'
  },
  {
    id: "beginner-weighted-intro",
    name: "Beginner Weighted Intro",
    format: "3x5 linéaire +2.5kg/sem",
    detail: "Tractions 3x5 +2.5-5kg + Dips 3x8 +5kg + Goblet 16kg 3x10",
    level: "Débutant",
    source: "https://madbarz.com/blog",
    category: 'lifting'
  },
  {
    id: "mu-leste-strength",
    name: "MU Lesté Strength",
    format: "5x3 + 5x5 repos 3-4'",
    detail: "MU 5x1-3 +5-15kg élastique si besoin + Dips +25kg 5x5 + Tractions +15kg 5x5",
    level: "Avancé",
    source: "https://www.thenx.com",
    category: 'lifting'
  },
  {
    id: "legs-of-steel-street",
    name: "Legs of Steel Street",
    format: "5x5 + 5x10",
    detail: "Front squat 80-100kg 5x5 + Pistol +12-20kg 3x5/jambe + Sissy +10kg 3x12 + Mollets 4x15",
    level: "Inter",
    source: "https://stronglifts.com/5x5/",
    category: 'lifting'
  },
  {
    id: "billat-30-30-vma",
    name: "Billat 30/30 VMA",
    format: "Fractionné court piste",
    detail: "20' échauff + 2x(10x30s 100-105% VMA / 30s trot) + 3' trot entre séries + 10' retour",
    level: "Inter",
    source: "https://www.u-run.fr/entrainement-running",
    category: 'run'
  },
  {
    id: "12x200m-vma",
    name: "12x200m VMA",
    format: "Répétitions piste",
    detail: "20' + gammes + 12x200m 100% VMA récup 200m trot + 10' retour",
    level: "Inter",
    source: "https://www.u-run.fr/entrainement-running",
    category: 'run'
  },
  {
    id: "10x400m-vma",
    name: "10x400m VMA",
    format: "Répétitions piste",
    detail: "20' + 10x400m 100% VMA récup 1'30-2' trot + 15' retour",
    level: "Confirmé",
    source: "https://www.u-run.fr/entrainement-running",
    category: 'run'
  },
  {
    id: "4x3min-vma-longue",
    name: "4x3min VMA longue",
    format: "Intervalles longs",
    detail: "20' + 4x3min 95-100% VMA récup 3' trot + 10' retour. Cf 4x3 vs 24x30 : temps >90% VO2 327s vs 201s",
    level: "Confirmé",
    source: "https://www.u-run.fr/113581-bataille-des-seances-4-x-3-min-contre-24-x-30-sec",
    category: 'run'
  },
  {
    id: "24x30s-vma",
    name: "24x30s VMA",
    format: "Intervalles courts",
    detail: "24x30s 100% VMA récup 30s 55% VMA",
    level: "Confirmé",
    source: "https://www.u-run.fr/113581-bataille-des-seances-4-x-3-min-contre-24-x-30-sec",
    category: 'run'
  },
  {
    id: "cotes-10x30s-8-10",
    name: "Côtes 10x30s 8-10%",
    format: "Côtes",
    detail: "20' + 10x30s côte 8-10% soutenu redescente trot + 10' retour",
    level: "Tous",
    source: "https://www.u-run.fr/entrainement-running",
    category: 'run'
  },
  {
    id: "cotes-kenyane",
    name: "Côtes kenyane",
    format: "Côtes + relance plat",
    detail: "20' + 8-10x (montée 45-60s vive + relance 60s rapide plat) récup descente trot. Variantes Ndiku 10-15x80m, Kibet 90-60-30-15s, Canova 100m 6/8%, Kosgei 200m x25/20/15",
    level: "Inter à élite",
    source: "https://www.u-run.fr/112898-la-seance-de-cotes-version-kenyane",
    category: 'run'
  },
  {
    id: "agony-hill-1-2km",
    name: "Agony Hill 1-2km",
    format: "Endurance force trail",
    detail: "Côte 1km ou 2km Kiganjo jusqu'à 18-20 reps. Public 6-10x1km modéré",
    level: "Avancé trail",
    source: "https://www.u-run.fr/112898-la-seance-de-cotes-version-kenyane",
    category: 'run'
  },
  {
    id: "sprints-8x20s",
    name: "Sprints 8x20s",
    format: "Sprint économie course",
    detail: "20' + 8x20s sprint plat ou faux-plat récup 2' marche/trot + 10' retour",
    level: "Inter",
    source: "https://www.u-run.fr/entrainement-running",
    category: 'run'
  },
  {
    id: "echauffement-5000m-alves",
    name: "Échauffement 5000m Alves",
    format: "Pré-course -6s",
    detail: "10-20' footing + activo-dynamiques + 1x500m 70% + 3x250m 100%",
    level: "Tous 5-10km",
    source: "https://www.u-run.fr/113924-comment-sechauffer-avant-un-5000m",
    category: 'run'
  },
  {
    id: "progression-1-vma-6-8sem",
    name: "Progression +1 VMA 6-8sem",
    format: "Plan 2 VMA/sem + EL",
    detail: "(a) 30/30 court + (b) 400m/1000m + 1 sortie longue. Réévaluer VMA 6-8sem",
    level: "Inter",
    source: "https://www.u-run.fr/entrainement-running",
    category: 'run'
  },
  {
    id: "uptrack-10x30-30-louvet",
    name: "Uptrack 10x30/30 Louvet",
    format: "VMA courte",
    detail: "15' EF + 10x30s VMA/30s EF + 15' EF",
    level: "Tous marathon",
    source: "https://www.uptrackplus.com/blog/3-seances-de-fractionne-pour-progresser-en-course-a-pied",
    category: 'run'
  },
  {
    id: "uptrack-seuil-5x1000m",
    name: "Uptrack Seuil 5x1000m",
    format: "Seuil piste",
    detail: "15' EF + 5x1000m allure 10km 85-90% VMA récup 1'15 marche + 15' EF",
    level: "Inter-confirmé",
    source: "https://www.uptrackplus.com/blog/3-seances-de-fractionne-pour-progresser-en-course-a-pied",
    category: 'run'
  },
  {
    id: "uptrack-fartlek-15-25",
    name: "Uptrack Fartlek 15-25'",
    format: "Fartlek sensations",
    detail: "15' EF + 15-25' variations terrain efforts 15s à 2' récup EF + 15' EF",
    level: "Déb à confirmé",
    source: "https://www.uptrackplus.com/blog/3-seances-de-fractionne-pour-progresser-en-course-a-pied",
    category: 'run'
  },
  {
    id: "uptrack-double-7x30-30",
    name: "Uptrack Double 7x30/30",
    format: "VMA",
    detail: "25' EF + 7x30/30 + 2' récup + 7x30/30 + 10' EF",
    level: "Inter",
    source: "https://www.uptrackplus.com/blog/3-seances-de-vma-pour-progresser-en-course-a-pied",
    category: 'run'
  },
  {
    id: "uptrack-cotes-10x40s",
    name: "Uptrack Côtes 10x40s",
    format: "VMA côte + test",
    detail: "25' EF + gammes + 10x40s côte récup descente + 10' EF. Test demi-Cooper 6' max distance/100=VMA",
    level: "Inter-confirmé",
    source: "https://www.uptrackplus.com/blog/3-seances-de-vma-pour-progresser-en-course-a-pied",
    category: 'run'
  },
  {
    id: "uptrack-12x300m",
    name: "Uptrack 12x300m",
    format: "VMA longue piste",
    detail: "25' EF + 3-5 gammes + 12x300m récup 1' + 10' EF",
    level: "Confirmé",
    source: "https://www.uptrackplus.com/blog/3-seances-de-vma-pour-progresser-en-course-a-pied",
    category: 'run'
  },
  {
    id: "uptrack-as42-3x4km",
    name: "Uptrack AS42 3x4km",
    format: "Allure marathon milieu prépa",
    detail: "25' EF + 40' EF + 3x4km allure marathon + 25' EF",
    level: "Marathon inter-confirmé",
    source: "https://www.uptrackplus.com/blog/3-seances-pour-travailler-votre-allure-marathon",
    category: 'run'
  },
  {
    id: "uptrack-as42-6-5-4km",
    name: "Uptrack AS42 6+5+4km",
    format: "Allure marathon fin prépa",
    detail: "40' EF + 6km +5km +4km allure marathon enchaînés + 25' EF",
    level: "Marathon confirmé",
    source: "https://www.uptrackplus.com/blog/3-seances-pour-travailler-votre-allure-marathon",
    category: 'run'
  },
  {
    id: "uptrack-trail-10x500m-d-haene",
    name: "Uptrack Trail 10x500m D'Haene",
    format: "Montées 5-10%",
    detail: "20' échauff + 10x500m côte 5-10% allure cible descente modérée + 10' récup",
    level: "Traileur expérimenté",
    source: "https://www.uptrackplus.com/blog/preparer-un-trail-de-80-km",
    category: 'run'
  },
  {
    id: "uptrack-rando-course-choc",
    name: "Uptrack Rando-course + choc",
    format: "Endurance longue",
    detail: "EF 1h30-2h30 60-70% FCM + Rando-course 3-8h + Week-end choc J1 50km + J2 30km. Plans Heubi/Balducci",
    level: "Ultra 4000-7000 D+",
    source: "https://www.uptrackplus.com/blog/preparer-un-trail-de-80-km",
    category: 'run'
  },
  {
    id: "mcmillan-8x400m-speed",
    name: "McMillan 8x400m Speed",
    format: "Répétitions mile",
    detail: "Échauff + 8x400m allure mile 105% allure 5km récup 200m trot. Allures calculateur McMillan",
    level: "Inter",
    source: "https://www.mcmillanrunning.com/",
    category: 'run'
  },
  {
    id: "mcmillan-6x800m-stamina",
    name: "McMillan 6x800m Stamina",
    format: "Seuil stamina",
    detail: "Échauff + 6x800m allure 5km récup 400m trot. Variante 4-6x1600m allure 10km",
    level: "Confirmé",
    source: "https://www.mcmillanrunning.com/",
    category: 'run'
  },
  {
    id: "mcmillan-fartlek-8x2",
    name: "McMillan Fartlek 8x2'",
    format: "Fartlek continu 40-50'",
    detail: "8x2' allure 5km / 2' facile sans arrêt + échauff/retour",
    level: "Débutant+",
    source: "https://www.mcmillanrunning.com/",
    category: 'run'
  },
  {
    id: "yasso-800s-marathon",
    name: "Yasso 800s Marathon",
    format: "10x800m",
    detail: "Échauff + 10x800m temps = objectif marathon (ex 3'30 pour 3h30) récup égale trot",
    level: "Confirmé",
    source: "https://www.halhigdon.com/",
    category: 'run'
  },
  {
    id: "higdon-12x400m",
    name: "Higdon 12x400m",
    format: "Répétitions 5km",
    detail: "Échauff + 12x400m allure 5km récup 400m trot. Type plans 10km/semi",
    level: "Inter",
    source: "https://www.halhigdon.com/",
    category: 'run'
  },
  {
    id: "decathlon-fractionne-deb",
    name: "Decathlon Fractionné déb",
    format: "Initiation vitesse",
    detail: "10' trot + 6x(1' soutenu / 1'30 marche active) + 10' trot. Plans 5/10km",
    level: "Débutant",
    source: "https://www.decathloncoach.com/fr/home/",
    category: 'run'
  },
  {
    id: "pyramide-200-800m",
    name: "Pyramide 200-800m",
    format: "Pyramide piste",
    detail: "Échauff + 200-400-600-800-600-400-200m 100-102% VMA récup moitié temps trot",
    level: "Inter",
    source: "https://www.decathloncoach.com/fr/home/",
    category: 'run'
  },
  {
    id: "nrc-interval-8x1",
    name: "NRC Interval 8x1'",
    format: "HIIT guidé audio",
    detail: "8x1' vite / 1' trot + échauff/retour guidés coach",
    level: "Tous",
    source: "https://www.nike.com/nrc-app",
    category: 'run'
  },
  {
    id: "nrc-hill-6x60s",
    name: "NRC Hill 6x60s",
    format: "Côtes guidées",
    detail: "6x60s côte soutenue redescente trot, posture guidée",
    level: "Inter",
    source: "https://www.nike.com/nrc-app",
    category: 'run'
  },
  {
    id: "polar-5x1000m-10km",
    name: "Polar 5x1000m 10km",
    format: "Seuil VMA longue cardio",
    detail: "15-20' + 5x1000m allure 10km récup 2'30 trot + 10' retour",
    level: "Inter",
    source: "https://www.polar.com/blog/fr/",
    category: 'run'
  },
  {
    id: "tabata-run-8x20-10",
    name: "Tabata Run 8x20/10",
    format: "Tabata course 2 blocs 4'",
    detail: "15' échauff + 8x(20s sprint max / 10s arrêt) x2 blocs 3' entre + 10' retour",
    level: "Avancé",
    source: "https://www.polar.com/blog/fr/",
    category: 'run'
  },
  {
    id: "runkeeper-4x400m-guide",
    name: "Runkeeper 4x400m guidé",
    format: "Fractionné guidé audio",
    detail: "4x400m soutenu récup 90s marche/trot coaching temps réel",
    level: "Débutant+",
    source: "https://runkeeper.com/cms/start-running/",
    category: 'run'
  },
  {
    id: "even-split-semi-marathon",
    name: "Even split semi/marathon",
    format: "Stratégie allure",
    detail: "Allure régulière ±3%, si negative 51/49. <3h tiennent 82% constant",
    level: "Tous semi/marathon",
    source: "https://www.u-run.fr/114065-semi-et-marathon-voici-la-meilleure-strategie-de-course",
    category: 'run'
  },
  {
    id: "hyrox-pft-bodyweight",
    name: "HYROX PFT Bodyweight",
    format: "AMRAP 30' sans machines",
    detail: "400m Run + 20 Walking Lunges + 15 Burpees broad jumps + 10 Push-Ups + 20 Sit-Ups",
    level: "Inter-Avancé",
    source: "https://hyrox.com/the-fitness-race/",
    category: 'hyrox'
  },
  {
    id: "street-parking-daily",
    name: "Street Parking Daily",
    format: "Daily scalable home/gym/road",
    detail: "AMRAP/EMOM burpees + air squats + push-ups + sit-ups + pull-ups + running, dumbbells OK, postpartum, 35k membres",
    level: "Tous vers RX",
    source: "https://streetparking.com/",
    category: 'hyrox'
  },
  {
    id: "street-parking-vault-2026",
    name: "Street Parking Vault 2026",
    format: "Défi hebdo type Hero",
    detail: "For Time / AMRAP 20' poids du corps + street lifting, cumulatif",
    level: "Inter scalable",
    source: "https://streetparking.com/pages/vault-2026",
    category: 'hyrox'
  },
  {
    id: "decathlon-5km-8sem",
    name: "Decathlon 5km 8sem",
    format: "Programme 2x/sem guidé voix/vidéo",
    detail: "Course/marche jusqu'à 5km continus",
    level: "Grand débutant",
    source: "https://www.decathloncoach.com/",
    category: 'hyrox'
  },
  {
    id: "decathlon-10km-6sem",
    name: "Decathlon 10km 6sem",
    format: "Programme 2x/sem",
    detail: "Continuité 5km endurance + fractionné léger",
    level: "Débutant",
    source: "https://www.decathloncoach.com/",
    category: 'hyrox'
  },
  {
    id: "decathlon-renfo-runner",
    name: "Decathlon Renfo Runner",
    format: "Séances unitaires",
    detail: "Renfo 17' + Core 27' + Full Body 20' déb + Upper 20' inter",
    level: "Tous",
    source: "https://www.decathloncoach.com/",
    category: 'hyrox'
  },
  {
    id: "running-heroes-marathon-12sem",
    name: "Running Heroes Marathon 12sem",
    format: "Plan 3 séances/sem sans chrono Minne",
    detail: "Endurance 60-75% VMA + sorties longues lentes + 4e renfo optionnelle, prérequis 2 séances/sem",
    level: "Débutant marathon",
    source: "https://fr.runningheroes.com/fr/blog/plan-premier-marathon",
    category: 'hyrox'
  },
  {
    id: "runkeeper-i-am-a-runner-30",
    name: "Runkeeper I Am A Runner 30'",
    format: "Audio guidé Corrine",
    detail: "Course motivationnelle + plans 5km/10km/semi/marathon app",
    level: "Tous/déb",
    source: "https://runkeeper.com/",
    category: 'hyrox'
  },
  {
    id: "runkeeper-tiny-wins-29",
    name: "Runkeeper Tiny Wins 29'",
    format: "Audio guidé Jess",
    detail: "Focus jour de course présence mentale",
    level: "Tous",
    source: "https://runkeeper.com/",
    category: 'hyrox'
  }
]

export function wodCategory(id: WodCategory) {
  return WOD_CATEGORIES.find((c) => c.id === id)
}
