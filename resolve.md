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
