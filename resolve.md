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
