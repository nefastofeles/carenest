"use client";

import type { doctorBrief } from "@/utils/brief";

type Brief = NonNullable<ReturnType<typeof doctorBrief>>;

export function DoctorBriefView({ brief }: { brief: Brief }) {
  return (
    <article className="brief-sheet space-y-6 rounded-2xl border border-nest-peach/70 bg-white p-6 shadow-sm shadow-nest-peach/30 print:border-0 print:shadow-none">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Pre-appointment brief · generated {brief.generated_on} · synthetic demo
        </p>
        <h1 className="mt-1 text-2xl font-semibold">
          {brief.member.display_name}, {brief.member.age}
        </h1>
        <p className="text-sm capitalize text-slate-600">{brief.member.role}</p>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-nest-magenta">
          Reason for consultation
        </h2>
        <p className="mt-1 text-sm text-slate-800">{brief.reason}</p>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-nest-magenta">
          Since last visit
        </h2>
        {brief.last_visit ? (
          <p className="mt-1 text-sm text-slate-600">
            Last visit on file: {brief.last_visit.date} — {brief.last_visit.topic} (
            {brief.last_visit.provider}). From {brief.last_visit.source}.
          </p>
        ) : (
          <p className="mt-1 text-sm text-slate-600">No record found for a prior visit.</p>
        )}
        <ul className="mt-3 space-y-2 text-sm">
          {brief.since_last_visit.tests_completed.map((t) => (
            <li key={t.lab_id}>
              <strong>{t.date} · {t.test_name}</strong> — {t.interpretation}
              <span className="block text-xs text-slate-500">From {t.source}</span>
            </li>
          ))}
          {!brief.since_last_visit.tests_completed.length && (
            <li className="text-slate-500">No record found for tests since last visit.</li>
          )}
        </ul>
        {brief.since_last_visit.device_changes.length > 0 && (
          <div className="mt-3 rounded-md bg-violet-50 p-3 text-sm text-violet-950">
            <p className="font-medium">Device-reported context (not medical diagnosis)</p>
            <ul className="mt-1 list-disc pl-5">
              {brief.since_last_visit.device_changes.map((d) => (
                <li key={d.id}>
                  {d.date}: {d.narrative}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-nest-magenta">
          Open actions
        </h2>
        {brief.open_actions.length ? (
          <ul className="mt-2 space-y-2 text-sm">
            {brief.open_actions.map((a) => (
              <li key={a.id}>
                <strong>{a.title}</strong> — {a.detail}
                <span className="block text-xs text-slate-500">
                  Record {a.record_id}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-slate-500">No record found for open actions.</p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-nest-magenta">
          Questions to discuss
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {brief.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-nest-magenta">
          Sources
        </h2>
        <ul className="mt-2 list-disc pl-5 text-xs text-slate-600">
          {brief.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-slate-200 pt-3 text-xs text-slate-500">
        CareNest organises records. It does not recommend treatment, order tests, or change
        medication.
      </footer>
    </article>
  );
}
