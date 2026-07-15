// app/(account)/account/loyalty/page.tsx
import { redirect } from "next/navigation";

export default function LoyaltyRedirect() {
  redirect("/account");
}
