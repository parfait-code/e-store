// lib/api/shop/pickupRequests.ts
import { apiClient } from "@/lib/api-client";
import type { PickupRequest, Paginated } from "@/lib/types";

// Pas de route de listing dédiée côté user (voir §6.15 du guide backend —
// seul GET /pickup-requests/:id existe, réservé au demandeur). On reconstitue
// donc la liste à partir des retours de l'utilisateur, chacun exposant
// désormais un champ `pickupRequest` nullable (§6.19).
export const shopPickupRequestsApi = {
  listViaOrders: async (): Promise<PickupRequest[]> => {
    const orders =
      await apiClient.get<Paginated<{ id: string }>>("/orders?limit=50");
    const returnsByOrder = await Promise.all(
      (orders.items ?? []).map((o) =>
        apiClient
          .get<
            { pickupRequest: PickupRequest | null }[]
          >(`/orders/${o.id}/returns`)
          .catch(() => []),
      ),
    );
    return returnsByOrder
      .flat()
      .map((r) => r.pickupRequest)
      .filter((p): p is PickupRequest => p !== null);
  },
};
