## Demarrer le serveur

demarrer le serveur de development:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

# 1. Vérification sur dev

C:\Users\PARFAIT\Desktop\PROJET\e-store> git status

# On branch dev

# nothing to commit, working tree clean

# 2. Récupération des mises à jour

C:\Users\PARFAIT\Desktop\PROJET\e-store> git fetch origin

# 3. Bascule sur main

C:\Users\PARFAIT\Desktop\PROJET\e-store> git checkout main

# Switched to branch 'main'

# 4. Mise à jour de main

C:\Users\PARFAIT\Desktop\PROJET\e-store> git pull origin main

# Already up to date.

# 5. Fusion de dev dans main

C:\Users\PARFAIT\Desktop\PROJET\e-store> git merge dev

# Updating abc123..def456

# Fast-forward

# file1.tsx | 10 ++++++++++

# file2.tsx | 5 +++++

# 2 files changed, 15 insertions(+)

# 6. Push vers GitHub

C:\Users\PARFAIT\Desktop\PROJET\e-store> git push origin main

# Enumerating objects: 5, done.

# To https://github.com/votre-compte/e-store.git

# abc123..def456 main -> main

# 7. Retour sur dev

C:\Users\PARFAIT\Desktop\PROJET\e-store> git checkout dev
