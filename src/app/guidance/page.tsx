import { GuidanceNotification } from "@/components/GuidanceNotification";
import { getDataset, getStore } from "@/utils/store";

export const dynamic = "force-dynamic";

export default function GuidancePage() {
  const items = getDataset().guidance;
  const decisions = getStore().guidanceDecisions;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Official guidance</h1>
      <p className="text-sm text-slate-600">
        One labelled demo notice. Official programmes may apply. CareNest does not determine
        that a vaccine is medically required.
      </p>
      {items.map((item) => (
        <GuidanceNotification
          key={item.id}
          item={item}
          decision={decisions.find((d) => d.guidance_id === item.id)}
        />
      ))}
    </div>
  );
}
