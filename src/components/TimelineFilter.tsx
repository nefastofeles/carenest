"use client";

import { useRouter, useSearchParams } from "next/navigation";

const FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "medical", label: "Medical" },
  { id: "lab", label: "Labs" },
  { id: "vaccination", label: "Vaccinations" },
  { id: "dental", label: "Dental" },
  { id: "device", label: "Device" },
];

export function TimelineFilter() {
  const params = useSearchParams();
  const router = useRouter();
  const current = params.get("cat") || "all";

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params.toString());
            if (f.id === "all") next.delete("cat");
            else next.set("cat", f.id);
            router.replace(`?${next.toString()}`);
          }}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            current === f.id
              ? "bg-nest-magenta text-white"
              : "bg-white text-slate-600 ring-1 ring-nest-peach"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
