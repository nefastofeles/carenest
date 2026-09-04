# CareNest

Family health in one place. MVP organises evidence and open actions. It does not diagnose.

**Project log (decisions, data QA, changelog):** [Outputs/2026-09-03_CareRelay_ProjectLog_v1.md](Outputs/2026-09-03_CareRelay_ProjectLog_v1.md)

## Run locally

```bash
export PATH="$HOME/.local/node/bin:$PATH"   # if node is not on PATH
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo path

1. Home → four members (Marco, Sofie, Lukas, Emma).
2. Marco → timeline (hypertension, lipid panel, device events).
3. Care loops → repeat blood analysis due 13 Sep 2026.
4. Prepare appointment → doctor brief → print / save as PDF.
5. Anomalies → six seeded flags.
6. Official guidance → one labelled demo notification.

Dataset is synthetic. Locale is Paris, France. “Today” for due dates is 2026-09-03.
