## Récapitulatif des changements (Inventorygroup et politique popups)

| Fichier                   | Changement                                                                                                                                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inventory.router.ts`     | `GET /inventory/grouped/:productId` accepte désormais `warehouse_id` en query, pour restreindre les lignes combinaison×entrepôt à un seul entrepôt (nécessaire à la pagination de la page "détail entrepôt" qui réutilise ce tableau groupé) |
| `inventory.controller.ts` | `getGroupedDetail` transmet `warehouse_id` au service                                                                                                                                                                                        |
| `inventory.service.ts`    | `getGroupedDetail` filtre les lignes sur `warehouseId` si fourni                                                                                                                                                                             |

| Fichier                | Changement                                                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma` | nouveau modèle `PopupDismissal { id, popupId, userId, seenAt }` avec contrainte unique `(popupId, userId)`                                                                        |
| `popup.model.ts`       | `Popup.displayFrequency` accepte désormais `ONCE_EVER` en plus de `ONCE_PER_SESSION` \| `ONCE_PER_DAY` \| `ALWAYS`                                                                |
| `popup.model.ts`       | nouveau champ `Popup.audience: "ALL" \| "GUEST_ONLY" \| "AUTHENTICATED_ONLY"` (défaut `ALL`)                                                                                      |
| `popup.service.ts`     | `getActivePopups(userId?)` : si `userId` fourni, exclut les popups `ONCE_EVER` déjà présents dans `PopupDismissal` pour cet utilisateur (jointure), et filtre selon `audience`    |
| `popup.controller.ts`  | `getActive` lit le token si présent (authentification optionnelle, comme les routes catalogue) et transmet `userId` au service                                                    |
| `popup.router.ts`      | `GET /popups/active` reste public mais accepte désormais un token optionnel ; ajout de `POST /popups/:popupId/seen` (authentifié) → upsert dans `PopupDismissal`, idempotent, 204 |
| `dashboard.service.ts` | `DashboardStats.popups: { activeCount: number; viewsThisMonth: number }` — nouvelle métrique basée sur `PopupDismissal.seenAt`                                                    |
