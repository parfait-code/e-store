## Récapitulatif des changements (suite)

| Fichier                   | Changement                                                                                                                                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inventory.router.ts`     | `GET /inventory/grouped/:productId` accepte désormais `warehouse_id` en query, pour restreindre les lignes combinaison×entrepôt à un seul entrepôt (nécessaire à la pagination de la page "détail entrepôt" qui réutilise ce tableau groupé) |
| `inventory.controller.ts` | `getGroupedDetail` transmet `warehouse_id` au service                                                                                                                                                                                        |
| `inventory.service.ts`    | `getGroupedDetail` filtre les lignes sur `warehouseId` si fourni                                                                                                                                                                             |
