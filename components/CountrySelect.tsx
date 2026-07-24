// components/CountrySelect.tsx
"use client";

import { useSupportedCountries } from "@/lib/queries/shop/useSettings";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className: string;
}

function CountrySelectSkeleton({ className }: { className: string }) {
  return <div className={`${className} h-[38px] animate-pulse bg-gray-100`} />;
}

export function CountrySelect({
  value,
  onChange,
  required,
  className,
}: CountrySelectProps) {
  const countries = useSupportedCountries();

  if (countries.length === 0) {
    return (
      <input
        type="text"
        required={required}
        placeholder="Pays (ex: CM, FR, US)"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className={className}
      />
    );
  }

  return (
    <select
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="">Sélectionner un pays...</option>
      {countries.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
