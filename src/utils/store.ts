import raw from "@/data/family_health_dataset.json";
import type { Dataset, ExtractedKind, GuidanceDecision } from "@/types";

export type PendingExtraction = {
  kind: ExtractedKind;
  member_id: string;
  record_id: string;
};

type MemoryState = {
  dataset: Dataset;
  dismissedLoopIds: Set<string>;
  connectedDevices: Set<string>;
  confirmedLabIds: Set<string>;
  guidanceDecisions: GuidanceDecision[];
  pendingExtraction: PendingExtraction | null;
};

function cloneDataset(): Dataset {
  return JSON.parse(JSON.stringify(raw)) as Dataset;
}

const globalForStore = globalThis as typeof globalThis & {
  __careRelayStore?: MemoryState;
};

function createState(): MemoryState {
  return {
    dataset: cloneDataset(),
    dismissedLoopIds: new Set(),
    connectedDevices: new Set(),
    confirmedLabIds: new Set(),
    guidanceDecisions: [],
    pendingExtraction: null,
  };
}

export function getStore(): MemoryState {
  if (
    !globalForStore.__careRelayStore ||
    !globalForStore.__careRelayStore.dataset.physicians?.length ||
    !globalForStore.__careRelayStore.dataset.meta.locale?.startsWith("Paris")
  ) {
    globalForStore.__careRelayStore = createState();
  }
  return globalForStore.__careRelayStore;
}

export function getDataset(): Dataset {
  return getStore().dataset;
}

export function resetStore() {
  globalForStore.__careRelayStore = createState();
}

export function demoToday(): string {
  return getDataset().meta.demo_today;
}
