import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompanionAdviceItem } from "@/types";

const DISCLAIMER =
  "Doctor companion. General practice recommendations from official guidelines. Not clinical advice, not a diagnosis, and not a prescription. Your physicians decide.";

function AdviceList({
  items,
  showMember,
}: {
  items: CompanionAdviceItem[];
  showMember: boolean;
}) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="rounded-xl bg-nest-cream/80 p-3.5 ring-1 ring-nest-peach/60">
          {showMember && (
            <Link
              href={`/members/${item.member_id}`}
              className="text-[11px] font-semibold uppercase tracking-wide text-nest-magenta hover:underline"
            >
              {item.member_name}
            </Link>
          )}
          <p className="text-sm font-medium text-nest-ink">{item.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.body}</p>
          <p className="mt-2 text-[11px] text-slate-400">Based on: {item.based_on}</p>
          <a
            href={item.guideline_url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-[11px] text-nest-magenta underline"
          >
            {item.guideline}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function CompanionAdvicePanel({
  variant,
  summary,
  items,
  memberName,
}: {
  variant: "family" | "member";
  summary?: string;
  items: CompanionAdviceItem[];
  memberName?: string;
}) {
  return (
    <Card className="border-nest-gold/40 bg-gradient-to-br from-white via-white to-nest-peach/25">
      <CardHeader>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-nest-magenta">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Doctor companion
        </p>
        <CardTitle>AI medical companion advice</CardTitle>
        <p className="pt-1 text-xs text-slate-500">{DISCLAIMER}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {variant === "family" && summary && (
          <p className="text-sm leading-relaxed text-nest-ink">{summary}</p>
        )}
        {variant === "member" && (
          <p className="text-sm text-slate-600">
            Suggestions for {memberName} from results and notes already on file.
          </p>
        )}
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No record found to base companion advice on.</p>
        ) : (
          <AdviceList items={items} showMember={variant === "family"} />
        )}
        {variant === "family" && (
          <p className="text-[11px] text-slate-400">
            Open a member profile for the full companion note for that person.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
