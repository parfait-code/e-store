### PATCH /product/:productId renvoie 404 "Product not found" sur un produit DRAFT

**Contexte** : Sur la page d'édition admin, le produit est chargé correctement
(GET /product/:id?includeInactive=true fonctionne). Mais en soumettant un
PATCH /product/:id (ex: pour passer le statut de DRAFT à ACTIVE), l'API
répond 404 "Product not found" alors que l'ID est identique à celui utilisé
pour le GET qui a réussi juste avant.

**Question** : PATCH /product/:productId applique-t-il le même filtre de
visibilité (masquage des produits DRAFT/ARCHIVED) que GET /product et
GET /product/:productId ? Si oui, merci de documenter le paramètre
équivalent à `includeInactive` pour cette route (ou de l'exempter du filtre,
puisqu'elle est déjà protégée par le rôle Admin).