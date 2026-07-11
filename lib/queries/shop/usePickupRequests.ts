// lib/queries/shop/usePickupRequests.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { shopPickupRequestsApi } from "@/lib/api/shop/pickupRequests";
import { queryKeys } from "@/lib/queries/keys";

export function useMyPickupRequests() {
  return useQuery({
    queryKey: queryKeys.shop.myPickupRequests,
    queryFn: shopPickupRequestsApi.listViaOrders,
  });
}
