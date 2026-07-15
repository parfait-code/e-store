// app/(account)/account/addresses/page.tsx
import { redirect } from "next/navigation";

export default function AddressesRedirect() {
  redirect("/account");
}
