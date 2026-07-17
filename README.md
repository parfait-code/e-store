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

## Récapitulatif des changements

| Fichier                | Changement                                                     |
| ---------------------- | -------------------------------------------------------------- |
| `promotion.service.ts` | `createDiscount` → `findById(productId, true)`                 |
| `inventory.service.ts` | `getProductLines` → `findById(productId, true)`                |
| `tag.router.ts`        | ajout `optionalAuthGuard` sur `GET /product/:productId/tags`   |
| `tag.controller.ts`    | `getByProduct` transmet `includeInactive` si admin             |
| `product.service.ts`   | la methode — `delete` utilise `findById(id, true)`             |
| `category.service.ts`  | `getProducts` calcule désormais `pricing` via `getBestPricing` |
| `popup.service.ts`     | ajout `uploadImage` / `deleteImage`                            |
| `popup.controller.ts`  | ajout `uploadImage` / `deleteImage`                            |
| `popup.router.ts`      | ajout `POST/DELETE /popups/:popupId/image`                     |

## Récapitulatif tailles d'images

| Emplacement                                 | Taille recommandée | Ratio |
| ------------------------------------------- | ------------------ | ----- |
| Hero (grand carrousel homepage)             | 1920 × 800 px      | 12:5  |
| Bannières promotions (carrousel secondaire) | 1200 × 400 px      | 3:1   |
| Images produits                             | 800 × 800 px       | 1:1   |
| Icônes catégories (page d'accueil)          | 200 × 200 px       | 1:1   |

Format JPG/WebP compressé, en respectant le ratio exact pour éviter tout recadrage via `object-cover`.
