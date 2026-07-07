# API Admin — Référence complète des routes

> Toutes les routes ci-dessous nécessitent le header :
> `Authorization: Bearer <token_admin>`
> (`authGuard` + `adminGuard` — l'utilisateur doit avoir `role: "ADMIN"`)
>
> Format de réponse standard :
>
> - Succès : `{ "status": true, "data": { ... } }`
> - Erreur : `{ "status": false, "error": { "message": "..." } }`
>
> Dans les payloads ci-dessous, tous les champs (obligatoires **et** optionnels) sont inclus. Les champs optionnels sont annotés `// optionnel`.

---

## 1. Users (`/user`)

### GET `/user/all`

Liste tous les utilisateurs.

**Réponse 200**

```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": null,
      "phone": null,
      "role": "USER",
      "isActive": true,
      "deletedAt": null,
      "createdAt": "2026-06-20T10:00:00.000Z",
      "updatedAt": "2026-06-20T10:00:00.000Z"
    }
  ]
}
```

### GET `/user/:userId`

Détail d'un utilisateur. Réponse identique à un élément du tableau ci-dessus.

### POST `/user`

Création d'un utilisateur par un admin.

**Body**

```json
{
  "username": "jane_admin",
  "email": "jane@example.com",
  "password": "motdepasse123",
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "1990-05-14T00:00:00.000Z",
  "phone": "+237600000000",
  "role": "MANAGER"
}
```

> `dateOfBirth`, `phone`, `role` sont optionnels (`role` par défaut `USER`).

**Réponse 201** → même forme qu'un `PublicUser` (sans `password`).

### PATCH `/user/change-role/:userId`

**Body**

```json
{ "role": "ADMIN" }
```

**Réponse 200** → `PublicUser` mis à jour.

### PATCH `/user/:userId/status`

Suspend / réactive un compte.

**Body**

```json
{ "isActive": false }
```

**Réponse 200** → `PublicUser` mis à jour.

### DELETE `/user/:userId`

Soft delete (400 si auto-suppression).

**Réponse 200**

```json
{ "status": true, "data": { "numberOfUsersDeleted": 1 } }
```

---

## 2. Products (`/product`)

### POST `/product`

**Body**

```json
{
  "sku": "TSH-001",
  "name": "T-shirt col rond",
  "description": "T-shirt en coton bio 100%",
  "price": 5000,
  "categoryId": "cat_abc123",
  "status": "DRAFT",
  "weight": 0.3
}
```

> `description` optionnel. `status` optionnel (forcé à `DRAFT` côté serveur, quelle que soit la valeur envoyée).

**Réponse 201**

```json
{
  "status": true,
  "data": {
    "id": 42,
    "sku": "TSH-001",
    "name": "T-shirt col rond",
    "description": "T-shirt en coton bio 100%",
    "price": 5000,
    "categoryId": "cat_abc123",
    "category": { "id": "cat_abc123", "name": "Hauts", "slug": "hauts" },
    "status": "DRAFT",
    "weight": 0.3,
    "brand": null,
    "metaTitle": null,
    "metaDescription": null,
    "images": [],
    "combinations": [],
    "attributeValues": [],
    "attributeSelections": [],
    "createdAt": "2026-07-07T10:00:00.000Z",
    "updatedAt": "2026-07-07T10:00:00.000Z"
  }
}
```

### PATCH `/product/:productId`

**Body** (tous les champs optionnels, `categoryId` immuable donc absent)

```json
{
  "sku": "TSH-001-V2",
  "name": "T-shirt col rond premium",
  "description": "Nouvelle description",
  "price": 5500,
  "status": "ACTIVE",
  "weight": 0.32
}
```

**Réponse 200** → `Product` mis à jour (voir plus haut). ⚠️ `400` si `status:"ACTIVE"` et attributs requis manquants.

### DELETE `/product/:productId`

**Réponse 200**

```json
{ "status": true, "data": { "numberOfProductsDeleted": 1 } }
```

### POST `/product/:productId/images`

`multipart/form-data` — champ `images` (1 à 5 fichiers, jpeg/png/webp/gif, 5MB max), champ texte `combinationId` optionnel.

**Réponse 200** → `Product` avec `images[]` mis à jour.

### DELETE `/product/:productId/images`

**Body**

```json
{ "imageId": "img_xyz789" }
```

**Réponse 200** → `Product` mis à jour.

---

## 3. Combinations (`/product/:productId/combinations`)

### PUT `/product/:productId/combinations/selections/:attributeDefinitionId`

**Body**

```json
{ "optionIds": ["opt_red_id", "opt_blue_id", "opt_green_id"] }
```

**Réponse 200**

```json
{
  "status": true,
  "data": [
    {
      "id": "sel_1",
      "productId": 42,
      "attributeDefinitionId": "attr_color",
      "attributeOptionId": "opt_red_id",
      "attributeOption": {
        "id": "opt_red_id",
        "value": "Rouge",
        "colorHex": "#FF0000"
      }
    }
  ]
}
```

### POST `/product/:productId/combinations/generate`

Aucun body.

**Réponse 201**

```json
{
  "status": true,
  "data": [
    {
      "id": "cmb_1",
      "productId": 42,
      "optionsKey": "opt_blue_id:opt_m_id",
      "sku": null,
      "price": null,
      "isActive": true,
      "values": [
        {
          "attributeDefinition": {
            "id": "attr_color",
            "name": "Couleur",
            "slug": "couleur"
          },
          "attributeOption": {
            "id": "opt_blue_id",
            "value": "Bleu",
            "colorHex": "#0000FF"
          }
        }
      ],
      "inventory": [],
      "images": []
    }
  ]
}
```

### PATCH `/product/:productId/combinations/:combinationId`

**Body** (tous optionnels)

```json
{
  "sku": "TSH-001-BLUE-M",
  "price": 5200,
  "isActive": true
}
```

**Réponse 200** → `ProductCombination` mise à jour.

### DELETE `/product/:productId/combinations/:combinationId`

**Réponse 200** (400 si inventaire non vide)

```json
{ "status": true, "data": { "message": "Combination deleted successfully" } }
```

---

## 4. Orders (`/orders`, `/user/:userId/orders`)

### PUT `/orders/:orderId/status`

**Body**

```json
{
  "status": "SHIPPED",
  "reason": "Expédié via DHL",
  "shippingCarrier": "DHL",
  "trackingNumber": "DHL123456789",
  "estimatedDeliveryDate": "2026-07-15T00:00:00.000Z"
}
```

> `reason`, `shippingCarrier`, `trackingNumber`, `estimatedDeliveryDate` optionnels.

**Réponse 200**

```json
{
  "status": true,
  "data": {
    "id": "order_abc",
    "userId": 1,
    "status": "SHIPPED",
    "shippingAddressSnapshot": {
      "street": "1 rue Test",
      "city": "Yaoundé",
      "country": "CM",
      "postalCode": "0000"
    },
    "billingAddressSnapshot": null,
    "shippingMethod": { "id": "sm_1", "name": "Standard", "estimatedDays": 5 },
    "notes": null,
    "appliedCoupon": null,
    "totalAmount": 9999,
    "discountedAmount": null,
    "items": [],
    "statusHistory": [
      {
        "id": "h_1",
        "fromStatus": "PROCESSING",
        "toStatus": "SHIPPED",
        "changedBy": 7,
        "reason": "Expédié via DHL",
        "createdAt": "2026-07-07T10:00:00.000Z"
      }
    ],
    "createdAt": "2026-07-01T10:00:00.000Z",
    "updatedAt": "2026-07-07T10:00:00.000Z"
  }
}
```

⚠️ `400` si transition invalide (voir state machine dans `STATUS_MANAGEMENT.md`).

### GET `/user/:userId/orders`

Query : `?page=1&limit=20`

**Réponse 200**

```json
{
  "status": true,
  "data": {
    "items": [
      /* Order[] */
    ],
    "total": 12,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## 5. Payments (`/payments`)

### PUT `/payments/:payment_id/status`

**Body**

```json
{
  "status": "REFUNDED",
  "notes": "Remboursement suite retour produit"
}
```

> `notes` optionnel. ⚠️ Pour un acteur ADMIN, seule la transition vers `REFUNDED` est autorisée manuellement — les autres statuts (`COMPLETED`, `FAILED`, `CANCELLED`) sont posés automatiquement par le système.

**Réponse 200**

```json
{
  "status": true,
  "data": {
    "id": "pay_1",
    "orderId": "order_abc",
    "userId": 1,
    "method": "CASH_ON_DELIVERY",
    "status": "REFUNDED",
    "amount": 9999,
    "currency": "XAF",
    "notes": "Remboursement suite retour produit",
    "createdAt": "2026-07-01T10:00:00.000Z",
    "updatedAt": "2026-07-07T10:00:00.000Z"
  }
}
```

### PUT `/payments/:payment_id/complete` (déprécié)

Aucun body — alias de `status: "COMPLETED"`.

### GET `/payments`

Query : `?page=1&limit=20&status=PENDING&method=CASH_ON_DELIVERY&order_id=order_abc` (tous optionnels)

**Réponse 200**

```json
{
  "status": true,
  "data": {
    "items": [
      /* Payment[] */
    ],
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## 6. Warehouses (`/warehouses`)

### POST `/warehouses`

**Body**

```json
{
  "name": "Entrepôt Douala",
  "location": "Douala, Cameroun",
  "capacity": 5000
}
```

> `capacity` optionnel.

**Réponse 201**

```json
{
  "status": true,
  "data": {
    "id": "wh_1",
    "name": "Entrepôt Douala",
    "location": "Douala, Cameroun",
    "capacity": 5000,
    "createdAt": "2026-07-07T10:00:00.000Z",
    "updatedAt": "2026-07-07T10:00:00.000Z"
  }
}
```

### PUT `/warehouses/:warehouse_id`

**Body** (tous optionnels)

```json
{
  "name": "Entrepôt Douala Port",
  "location": "Douala, Zone portuaire",
  "capacity": 8000
}
```

**Réponse 200** → `Warehouse` mis à jour.

### DELETE `/warehouses/:warehouse_id`

**Réponse 200** (400 si stock actif restant)

```json
{ "status": true, "data": { "message": "Warehouse deleted successfully" } }
```

---

## 7. Inventory (`/inventory`)

### POST `/inventory`

**Body**

```json
{
  "product_id": 42,
  "warehouse_id": "wh_1",
  "combination_id": "cmb_1",
  "quantity": 100
}
```

> `combination_id` optionnel, `quantity` optionnel (défaut `0`).

**Réponse 201**

```json
{
  "status": true,
  "data": {
    "id": "inv_1",
    "productId": 42,
    "combinationId": "cmb_1",
    "warehouseId": "wh_1",
    "quantity": 100,
    "createdAt": "2026-07-07T10:00:00.000Z",
    "updatedAt": "2026-07-07T10:00:00.000Z"
  }
}
```

⚠️ `409` si doublon `(product, warehouse, combination)`.

### PUT `/inventory/:item_id`

**Body** (tous optionnels)

```json
{ "quantity": 80, "warehouse_id": "wh_2" }
```

**Réponse 200** → `InventoryItem` mis à jour.

### DELETE `/inventory/:item_id`

**Réponse 200**

```json
{ "status": true, "data": { "message": "Inventory item deleted successfully" } }
```

### POST `/inventory/transfer`

**Body**

```json
{
  "item_id": "inv_1",
  "from_warehouse": "wh_1",
  "to_warehouse": "wh_2",
  "quantity": 20
}
```

**Réponse 200**

```json
{
  "status": true,
  "data": {
    "item_id": "inv_1",
    "from_warehouse": "wh_1",
    "to_warehouse": "wh_2",
    "quantity": 20
  }
}
```

---

## 8. Shipments (`/shipments`, `/pickup-requests`)

### POST `/shipments`

**Body**

```json
{
  "sender_name": "E-Store Warehouse",
  "sender_address": "12 Rue du Commerce, Douala",
  "recipient_name": "John Doe",
  "recipient_address": "45 Avenue Kennedy, Yaoundé",
  "weight": 2.5,
  "dimensions": { "length": 30, "width": 20, "height": 15 },
  "order_id": "order_abc",
  "estimated_delivery_at": "2026-07-15T00:00:00.000Z"
}
```

> `dimensions`, `order_id`, `estimated_delivery_at` optionnels.

**Réponse 201**

```json
{
  "status": true,
  "data": {
    "id": "ship_1",
    "orderId": "order_abc",
    "senderName": "E-Store Warehouse",
    "senderAddress": "12 Rue du Commerce, Douala",
    "recipientName": "John Doe",
    "recipientAddress": "45 Avenue Kennedy, Yaoundé",
    "weight": 2.5,
    "dimensions": { "length": 30, "width": 20, "height": 15 },
    "status": "PENDING",
    "trackingNumber": "AB12CD34EF",
    "estimatedDeliveryDate": "2026-07-15T00:00:00.000Z",
    "trackingEvents": [],
    "label": null
  }
}
```

### GET `/shipments`

Query : `?page=1&limit=20&status=IN_TRANSIT&order_id=order_abc` (tous optionnels)

**Réponse 200** → `Paginated<Shipment>`.

### PUT `/shipments/:shipmentId/status`

**Body**

```json
{ "status": "DELIVERED", "reason": "Colis remis en main propre" }
```

> `reason` optionnel.

**Réponse 200** → `Shipment` mis à jour.

### GET `/pickup-requests`

Query : `?page=1&limit=20&status=PENDING` (tous optionnels)

**Réponse 200** → `Paginated<PickupRequest>`.

---

## 9. Dashboard (`/dashboard`)

### GET `/dashboard/stats`

Aucun body/query.

**Réponse 200**

```json
{
  "status": true,
  "data": {
    "products": { "total": 120, "addedThisMonth": 8 },
    "orders": { "total": 340, "thisMonth": 45, "trend": 12 },
    "users": { "total": 500, "active": 500 },
    "payments": {
      "totalAmountThisMonth": 2500000,
      "currency": "XAF",
      "trend": 8
    },
    "inventory": { "lowStockCount": 6 },
    "shipments": { "inProgress": 14, "trend": -3 },
    "promotions": {
      "active": 2,
      "couponUsageThisMonth": 34,
      "revenueFromCouponsThisMonth": 150000,
      "currency": "XAF"
    }
  }
}
```

### GET `/dashboard/sales-chart`

Query : `?year=2026&period=monthly` (tous optionnels)

**Réponse 200**

```json
{
  "status": true,
  "data": {
    "period": "monthly",
    "year": 2026,
    "points": [
      { "label": "Jan", "amount": 120000, "orderCount": 10 },
      { "label": "Fév", "amount": 150000, "orderCount": 14 }
    ],
    "currency": "XAF"
  }
}
```

---

## 10. Categories (`/categories`)

### POST `/categories`

**Body**

```json
{
  "name": "Hauts",
  "slug": "hauts",
  "description": "T-shirts, chemises, pulls et vestes",
  "imageUrl": "https://cdn.example.com/hauts.jpg",
  "iconUrl": "https://cdn.example.com/icons/hauts.svg",
  "metaTitle": "Hauts pour homme et femme",
  "metaDescription": "Découvrez notre sélection de hauts",
  "isActive": true,
  "parentId": "cat_parent_id"
}
```

> `description`, `imageUrl`, `iconUrl`, `metaTitle`, `metaDescription`, `isActive` (défaut `true`), `parentId` optionnels. Préférer l'upload dédié plutôt que `imageUrl`/`iconUrl`.

**Réponse 201**

```json
{
  "status": true,
  "data": {
    "id": "cat_1",
    "name": "Hauts",
    "slug": "hauts",
    "description": "T-shirts, chemises, pulls et vestes",
    "imageUrl": "https://cdn.example.com/hauts.jpg",
    "iconUrl": "https://cdn.example.com/icons/hauts.svg",
    "metaTitle": "Hauts pour homme et femme",
    "metaDescription": "Découvrez notre sélection de hauts",
    "isActive": true,
    "parentId": "cat_parent_id",
    "parent": {
      "id": "cat_parent_id",
      "name": "Vêtements",
      "slug": "vetements"
    },
    "children": [],
    "_count": { "products": 0 },
    "createdAt": "2026-07-07T10:00:00.000Z",
    "updatedAt": "2026-07-07T10:00:00.000Z"
  }
}
```

### PUT `/categories/:categoryId`

**Body** (tous optionnels, même forme que la création)

```json
{
  "name": "Hauts & Vestes",
  "slug": "hauts-vestes",
  "description": "Description mise à jour",
  "metaTitle": "Nouveau titre SEO",
  "metaDescription": "Nouvelle description SEO",
  "isActive": false,
  "parentId": "cat_parent_id"
}
```

**Réponse 200** → `Category` mise à jour.

### DELETE `/categories/:categoryId`

**Réponse 200** (400 si produits rattachés ou discounts la ciblant)

```json
{ "status": true, "data": { "message": "Category deleted successfully" } }
```

### POST `/categories/:categoryId/assets`

`multipart/form-data` — champs `image` et/ou `icon` (1 fichier chacun).

**Réponse 200** → `Category` avec `imageUrl`/`iconUrl` mis à jour.

### DELETE `/categories/:categoryId/image`

**Réponse 200** (404 si pas d'image définie) → `Category` mise à jour (`imageUrl: null`).

### DELETE `/categories/:categoryId/icon`

**Réponse 200** (404 si pas d'icône définie) → `Category` mise à jour (`iconUrl: null`).

---

## 11. Promotions, Discounts & Coupons (`/promotions`)

### GET `/promotions`

Query : `?status=ACTIVE&isActive=true` (optionnels)

**Réponse 200** → `Promotion[]` (voir format ci-dessous).

### GET `/promotions/:promotionId`

**Réponse 200**

```json
{
  "status": true,
  "data": {
    "id": "promo_1",
    "name": "Soldes d'été",
    "slug": "soldes-ete",
    "description": "Jusqu'à -30% sur une sélection",
    "images": ["https://cdn.example.com/promo1.jpg"],
    "status": "ACTIVE",
    "isActive": true,
    "startDate": "2026-07-01T00:00:00.000Z",
    "endDate": "2026-07-31T23:59:59.000Z",
    "discounts": [],
    "coupons": [],
    "_count": { "coupons": 0, "discounts": 0 },
    "createdAt": "2026-06-25T10:00:00.000Z",
    "updatedAt": "2026-06-25T10:00:00.000Z"
  }
}
```

### GET `/promotions/:promotionId/products`

**Réponse 200**

```json
{
  "status": true,
  "data": {
    "promotionId": "promo_1",
    "promotionName": "Soldes d'été",
    "count": 2,
    "products": [
      /* Product & { pricing } */
    ]
  }
}
```

### POST `/promotions`

**Body**

```json
{
  "name": "Soldes d'été",
  "slug": "soldes-ete",
  "description": "Jusqu'à -30% sur une sélection",
  "startDate": "2026-07-01T00:00:00.000Z",
  "endDate": "2026-07-31T23:59:59.000Z",
  "isActive": true
}
```

> `description` optionnel, `isActive` optionnel (défaut `true`). `endDate` doit être après `startDate`.

**Réponse 201** → `Promotion` (voir format GET par id).

### PUT `/promotions/:promotionId`

**Body** (tous optionnels)

```json
{
  "name": "Soldes d'été prolongés",
  "slug": "soldes-ete-prolonges",
  "description": "Prolongation jusqu'au 15 août",
  "startDate": "2026-07-01T00:00:00.000Z",
  "endDate": "2026-08-15T23:59:59.000Z",
  "isActive": true
}
```

**Réponse 200** → `Promotion` mise à jour.

### PATCH `/promotions/:promotionId/toggle`

Aucun body — bascule `isActive`.

**Réponse 200** → `Promotion` mise à jour.

### DELETE `/promotions/:promotionId`

**Réponse 200**

```json
{ "status": true, "data": { "message": "Promotion deleted successfully" } }
```

### POST `/promotions/:promotionId/images`

`multipart/form-data` — champ `images` (1-5 fichiers).

**Réponse 200** → `Promotion` avec `images[]` mis à jour.

### DELETE `/promotions/:promotionId/images`

**Body**

```json
{ "imageUrl": "https://cdn.example.com/promo1.jpg" }
```

**Réponse 200** → `Promotion` mise à jour.

### POST `/promotions/:promotionId/discounts`

**Body**

```json
{
  "type": "PERCENTAGE",
  "value": 30,
  "categoryId": "cat_1",
  "productIds": [42, 43]
}
```

> `categoryId` et `productIds` optionnels individuellement, mais **au moins un des deux est requis**. `type` : `"PERCENTAGE"` ou `"FIXED_AMOUNT"`.

**Réponse 201**

```json
{
  "status": true,
  "data": {
    "id": "disc_1",
    "promotionId": "promo_1",
    "type": "PERCENTAGE",
    "value": 30,
    "categoryId": "cat_1",
    "category": { "id": "cat_1", "name": "Hauts", "slug": "hauts" },
    "products": [
      {
        "product": {
          "id": 42,
          "name": "T-shirt col rond",
          "images": [],
          "price": 5000
        }
      }
    ]
  }
}
```

### DELETE `/promotions/:promotionId/discounts/:discountId`

**Réponse 200**

```json
{ "status": true, "data": { "message": "Discount deleted successfully" } }
```

### GET `/promotions/:promotionId/coupons`

**Réponse 200**

```json
{
  "status": true,
  "data": [
    {
      "id": "coupon_1",
      "code": "ETE30",
      "maxUses": 100,
      "usedCount": 12,
      "perUserLimit": 1,
      "startDate": "2026-07-01T00:00:00.000Z",
      "endDate": "2026-07-31T23:59:59.000Z",
      "isActive": true,
      "effectiveIsActive": true
    }
  ]
}
```

### POST `/promotions/:promotionId/coupons`

**Body**

```json
{
  "code": "ete30",
  "maxUses": 100,
  "perUserLimit": 1,
  "startDate": "2026-07-01T00:00:00.000Z",
  "endDate": "2026-07-31T23:59:59.000Z",
  "isActive": true
}
```

> `maxUses`, `startDate`, `endDate` optionnels. `perUserLimit` optionnel (défaut `1`). `isActive` optionnel (défaut `true`). `code` est automatiquement mis en majuscules (`"ETE30"`).

**Réponse 201**

```json
{
  "status": true,
  "data": {
    "id": "coupon_1",
    "code": "ETE30",
    "promotionId": "promo_1",
    "maxUses": 100,
    "usedCount": 0,
    "perUserLimit": 1,
    "minOrderAmount": null,
    "startDate": "2026-07-01T00:00:00.000Z",
    "endDate": "2026-07-31T23:59:59.000Z",
    "isActive": true,
    "createdAt": "2026-07-07T10:00:00.000Z",
    "updatedAt": "2026-07-07T10:00:00.000Z"
  }
}
```

### DELETE `/promotions/:promotionId/coupons/:couponId`

**Réponse 200**

```json
{ "status": true, "data": { "message": "Coupon deleted successfully" } }
```

---

## 12. Attributes (`/categories/:categoryId/attributes`, `/attributes`, `/product/:productId/attributes`)

### POST `/categories/:categoryId/attributes`

**Body**

```json
{
  "name": "Couleur",
  "slug": "couleur",
  "type": "SELECT",
  "unit": "cm",
  "isVariant": true,
  "isFilterable": true,
  "isRequired": false,
  "position": 0
}
```

> `unit` optionnel. `isVariant` optionnel (défaut `false`), `isFilterable` optionnel (défaut `true`), `isRequired` optionnel (défaut `false`), `position` optionnel (défaut `0`). `type` : `"TEXT"|"NUMBER"|"COLOR"|"BOOLEAN"|"SELECT"`.

**Réponse 201**

```json
{
  "status": true,
  "data": {
    "id": "attr_1",
    "categoryId": "cat_1",
    "name": "Couleur",
    "slug": "couleur",
    "type": "SELECT",
    "unit": "cm",
    "isVariant": true,
    "isFilterable": true,
    "isRequired": false,
    "position": 0,
    "options": [],
    "category": { "id": "cat_1", "name": "Hauts", "slug": "hauts" }
  }
}
```

### PATCH `/attributes/:definitionId`

**Body** (tous optionnels, mêmes champs que la création)

```json
{
  "name": "Couleur principale",
  "isFilterable": false,
  "position": 1
}
```

**Réponse 200** → `AttributeDefinition` mise à jour.

### DELETE `/attributes/:definitionId`

**Réponse 200**

```json
{
  "status": true,
  "data": { "message": "Attribute definition deleted successfully" }
}
```

### POST `/attributes/:definitionId/options`

**Body**

```json
{
  "value": "Rouge",
  "colorHex": "#FF0000",
  "position": 0
}
```

> `colorHex` optionnel (format `#RRGGBB`). `position` optionnel (défaut `0`).

**Réponse 201**

```json
{
  "status": true,
  "data": {
    "id": "opt_1",
    "attributeDefinitionId": "attr_1",
    "value": "Rouge",
    "colorHex": "#FF0000",
    "position": 0
  }
}
```

### PATCH `/attributes/options/:optionId`

**Body** (tous optionnels)

```json
{ "value": "Rouge vif", "colorHex": "#FF1111", "position": 1 }
```

**Réponse 200** → `AttributeOption` mise à jour.

### DELETE `/attributes/options/:optionId`

**Réponse 200**

```json
{ "status": true, "data": { "message": "Option deleted successfully" } }
```

### PUT `/product/:productId/attributes`

Uniquement pour attributs produit (`isVariant:false`) — remplace toutes les valeurs.

**Body**

```json
{
  "attributes": [
    { "attributeDefinitionId": "attr_material", "value": "Coton" },
    { "attributeDefinitionId": "attr_care", "value": "Lavage à 30°C" }
  ]
}
```

**Réponse 200**

```json
{
  "status": true,
  "data": [
    {
      "id": "pav_1",
      "productId": 42,
      "attributeDefinitionId": "attr_material",
      "value": "Coton",
      "attributeDefinition": {
        "id": "attr_material",
        "name": "Matière",
        "slug": "matiere",
        "type": "TEXT",
        "unit": null
      }
    }
  ]
}
```

---

## 13. Tags (`/tags`, `/product/:productId/tags`)

### POST `/tags`

**Body**

```json
{ "name": "Nouveauté", "slug": "nouveaute" }
```

**Réponse 201**

```json
{
  "status": true,
  "data": { "id": "tag_1", "name": "Nouveauté", "slug": "nouveaute" }
}
```

### PATCH `/tags/:tagId`

**Body** (tous optionnels)

```json
{ "name": "Nouveautés", "slug": "nouveautes" }
```

**Réponse 200** → `Tag` mis à jour.

### DELETE `/tags/:tagId`

**Réponse 200**

```json
{ "status": true, "data": { "message": "Tag deleted successfully" } }
```

### PUT `/product/:productId/tags`

Remplace tous les tags du produit.

**Body**

```json
{ "tagIds": ["tag_1", "tag_2"] }
```

**Réponse 200**

```json
{
  "status": true,
  "data": {
    "id": 42,
    "name": "T-shirt col rond",
    "tags": [
      {
        "productId": 42,
        "tagId": "tag_1",
        "tag": { "id": "tag_1", "name": "Nouveauté", "slug": "nouveaute" }
      }
    ]
  }
}
```

---

## 14. Shipping Methods (`/shipping-methods`)

### POST `/shipping-methods`

**Body**

```json
{
  "name": "Livraison Express",
  "description": "Livraison en 24-48h",
  "estimatedDays": 2,
  "basePrice": 2000,
  "pricePerKg": 300,
  "isActive": true,
  "zones": ["CM", "GA", "TD"]
}
```

> `description` optionnel. `pricePerKg` optionnel (défaut `0`). `isActive` optionnel (défaut `true`). `zones` = codes pays 2 lettres, au moins 1.

**Réponse 201**

```json
{
  "status": true,
  "data": {
    "id": "sm_1",
    "name": "Livraison Express",
    "description": "Livraison en 24-48h",
    "estimatedDays": 2,
    "basePrice": 2000,
    "pricePerKg": 300,
    "isActive": true,
    "zones": ["CM", "GA", "TD"],
    "createdAt": "2026-07-07T10:00:00.000Z",
    "updatedAt": "2026-07-07T10:00:00.000Z"
  }
}
```

### PATCH `/shipping-methods/:methodId`

**Body** (tous optionnels, mêmes champs)

```json
{ "basePrice": 2200, "isActive": false }
```

**Réponse 200** → `ShippingMethod` mise à jour.

### DELETE `/shipping-methods/:methodId`

**Réponse 200**

```json
{
  "status": true,
  "data": { "message": "Shipping method deleted successfully" }
}
```

---

## 15. Loyalty (`/loyalty/adjust`)

### POST `/loyalty/adjust`

**Body**

```json
{
  "userId": 1,
  "points": -50,
  "type": "REDEEMED",
  "orderId": "order_abc"
}
```

> `orderId` optionnel. `type` : `"EARNED"|"REDEEMED"|"EXPIRED"|"ADJUSTED"`. `points` ≠ 0. Rejette (`400`) si un `REDEEMED` rendrait le solde négatif.

**Réponse 201**

```json
{
  "status": true,
  "data": {
    "id": "lt_1",
    "userId": 1,
    "orderId": "order_abc",
    "points": -50,
    "type": "REDEEMED",
    "createdAt": "2026-07-07T10:00:00.000Z"
  }
}
```

---

## 16. Returns (`/returns`)

### GET `/returns`

Query : `?page=1&limit=20&status=PENDING` (tous optionnels)

**Réponse 200**

```json
{
  "status": true,
  "data": {
    "items": [
      {
        "id": "ret_1",
        "orderId": "order_abc",
        "userId": 1,
        "status": "PENDING",
        "reason": "Produit défectueux",
        "notes": null,
        "items": [
          {
            "id": "ri_1",
            "orderItemId": "item_1",
            "orderItem": {
              "id": "item_1",
              "productId": 42,
              "quantity": 1,
              "price": 5000
            },
            "quantity": 1,
            "condition": "Endommagé à la réception"
          }
        ],
        "createdAt": "2026-07-05T10:00:00.000Z",
        "updatedAt": "2026-07-05T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### PUT `/returns/:returnId/status`

**Body**

```json
{
  "status": "COMPLETED",
  "notes": "Remboursement effectué, stock réintégré"
}
```

> `notes` optionnel. `400` si déjà `COMPLETED`. Un passage à `COMPLETED` déclenche automatiquement : remboursement paiement, réintégration stock, reversal points fidélité.

**Réponse 200** → `ReturnRequest` mise à jour.

---

## Récapitulatif — codes d'erreur communs

| Code | Signification                                                    |
| ---- | ---------------------------------------------------------------- |
| 400  | Validation échouée / règle métier violée                         |
| 401  | Token manquant ou invalide                                       |
| 403  | Rôle insuffisant (`adminGuard` — nécessite `role: "ADMIN"`)      |
| 404  | Ressource introuvable                                            |
| 409  | Conflit (doublon : slug, SKU, code coupon, etc.)                 |
| 429  | Rate limit dépassé (100 req / 15 min)                            |
| 500  | Erreur interne serveur                                           |
| 503  | Fonctionnalité temporairement indisponible (méthode de paiement) |
