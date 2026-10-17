// Déploie le contenu de dist/ sur GitHub Pages via la branche `gh-pages`.
//
// Utilisé à la place d'un workflow GitHub Actions car le token `gh` local n'a
// pas le scope `workflow` (nécessaire pour écrire dans .github/workflows/).
// Aucune permission spéciale n'est requise : la branche gh-pages est un simple push.

import { execSync } from 'node:child_process'
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const REPO_URL = 'https://github.com/Calurion-dev/FitQuest.git'
const BRANCH = 'gh-pages'
const PAGES_URL = 'https://calurion-dev.github.io/FitQuest/'

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit', shell: true })

console.log('→ Build de production...')
run('npm run build')

const work = mkdtempSync(join(tmpdir(), 'fitquest-pages-'))
console.log('→ Préparation de la branche', BRANCH, 'dans', work)
cpSync('dist', work, { recursive: true })
writeFileSync(join(work, '.nojekyll'), '')

run(`git init -b ${BRANCH}`, work)
run('git add -A', work)
run(
  'git -c user.name=FitQuest -c user.email=fitquest@users.noreply.github.com commit -m "Deploiement GitHub Pages"',
  work
)
run(
  `git -c credential.helper= -c credential.helper="!gh auth git-credential" push --force ${REPO_URL} ${BRANCH}:${BRANCH}`,
  work
)

rmSync(work, { recursive: true, force: true })
console.log('✅ Déployé :', PAGES_URL)
