### GET /product — Absence de paramètre de tri (bloque une section "Nouveautés" fiable)

**Contexte :** La home page affiche un bloc "Nouveautés" censé montrer les produits
les plus récemment créés. Le §6.2 du guide d'intégration documente uniquement
`?page&limit&categoryId&search` sur `GET /product` — aucun paramètre de tri.

**Contournement frontend actuel :** On sur-fetch un lot de 24 produits (page 1,
ordre par défaut inconnu côté backend) puis on trie côté client par `createdAt`
avant de garder les 8 plus récents. Ce contournement est fragile : si le
catalogue dépasse 24 produits actifs et que les plus récents ne sont pas dans
les 24 premiers renvoyés par le backend, certains vrais nouveaux produits sont
ratés silencieusement.

**Demande :** Ajouter un paramètre de tri sur `GET /product`, par exemple
`?sort=newest` (ou `?sortBy=createdAt&order=desc`), ou à défaut un endpoint
dédié `GET /product/latest?limit=`. Le même besoin s'applique probablement à
`GET /categories/slug/:slug/products` (voir point suivant) pour permettre un
tri "nouveautés" par catégorie.

---

### GET /categories/slug/:slug/products — Absence de paramètre de tri

**Contexte :** Même limitation que ci-dessus, mais sur le listing de produits
d'une catégorie (`app/(public)/categories/[slug]/page.tsx`). Actuellement,
aucun tri n'est possible (prix croissant/décroissant, nouveauté, popularité) —
uniquement la pagination `?page&limit`.

**Demande :** Ajouter le même paramètre de tri que pour `GET /product` sur cet
endpoint, pour cohérence. Priorité suggérée : `price_asc`, `price_desc`,
`newest`.

---

### GET /promotions/slug/:slug/products — Absence de pagination

**Contexte :** `PromotionProductsResponse` (voir §6.17 du guide) ne renvoie
que `{ promotionId, promotionName, count, products }` — pas de `page`,
`limit`, ni `totalPages`, contrairement aux autres endpoints de listing
documentés au §4 du guide (`items/total/page/limit/totalPages`).

**Impact frontend :** La page `app/(public)/promotions/[slug]/products/page.tsx`
charge donc l'intégralité des produits rattachés à une promotion en un seul
appel, sans pagination possible. Pour une promotion à forte volumétrie de
produits (ex: braderie généralisée sur une catégorie entière), cela peut
représenter une charge de payload et de rendu non négligeable.

**Demande :** Aligner cet endpoint sur le format de pagination standard du
guide (§4), avec `?page&limit`.

---

### GET /promotions/active — Pas de vue "historique" ou "à venir" publique

**Contexte :** Ce point n'est pas encore un besoin confirmé côté produit, mais
noté en passant pendant l'audit des pages publiques : `GET /promotions/active`
(§6.17) ne renvoie que les promotions actuellement actives, triées par date de
fin. Il n'existe aucun endpoint public pour lister les promotions à venir
(`SCHEDULED`) ou passées (`EXPIRED`), ce qui limiterait la possibilité de
construire une page `/promotions` (listing global) au-delà des seules
promotions actives du moment.

**Demande :** Question ouverte, à trancher une fois la décision produit prise
sur l'opportunité d'une page de listing global des promotions. Si retenue,
il faudrait soit élargir `GET /promotions/active` avec un paramètre de statut,
soit exposer une version publique paginée de `GET /promotions` (actuellement
Admin uniquement, §6.17).

---

_Document en cours de constitution — complété au fil de l'audit des pages
publiques du frontend. Sera finalisé et transmis à l'équipe backend une fois
toutes les pages publiques passées en revue._
