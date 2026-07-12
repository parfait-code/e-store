### PATCH /product/:productId renvoie 404 "Product not found" alors que le produit existe

**Requête exacte reproduisant le bug :**
PATCH /product/cmrhb245w000pl4vd9hzlio1g?includeInactive=true
Body: {"sku":"MIROIR-ROND-SOLEIL","name":"Miroir rond Soleil","description":"Miroir rond avec cadre en rotin façon soleil","price":38000,"weight":6,"status":"ACTIVE"}
Réponse: {"status":false,"error":{"message":"Product not found"}}

**Constat clé :** GET /product/cmrhb245w000pl4vd9hzlio1g (même ID, même produit)
fonctionne parfaitement et renvoie le produit. Seul le PATCH échoue.

**Hypothèse de cause :** Product.id est un cuid() (string), comme observé dans
l'ID ci-dessus — pas un Int comme documenté au §5 du guide d'intégration.
Le handler de PATCH /product/:productId semble être le seul à ne pas avoir
été migré : il traite probablement encore productId comme un nombre
(ex: Number(productId) ou parseInt(productId) avant la requête Prisma), ce
qui produit NaN pour un cuid et fait échouer le findUnique/update, remonté
comme "not found" au lieu d'une erreur de type explicite.

**Demande :** Vérifier le handler PATCH /product/:productId — s'assurer
qu'il traite productId comme une string (cuid), cohérent avec GET
/product/:productId qui fonctionne déjà correctement sur ce même produit.
Vérifier aussi par la même occasion DELETE /product/:productId et les
sous-routes (/images, /attributes, /tags) qui partagent probablement le
même pattern de résolution d'ID.
