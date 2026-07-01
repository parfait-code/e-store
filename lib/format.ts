// lib/format.ts

export function formatXAF(amount: number) {
  return (
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
      amount,
    ) + " XAF"
  );
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
    new Date(iso),
  );
}
