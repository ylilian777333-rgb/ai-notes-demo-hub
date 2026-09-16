export type SceneName = "course" | "tasks" | "ideas" | "interview" | "cards";
export type SummaryScene = "ideas" | "interview";

export type SourceRecord = {
  title: string;
  date: string;
  time?: string;
  quote: string;
  body: string;
  scope: SceneName;
};

export type Insight = {
  title: string;
  text: string;
  sources: string[];
};

export type NoteRecord = {
  id: string;
  title: string;
  text: string;
  date: string;
  category?: string;
  collection?: string;
};

export type TaskRecord = {
  id: string;
  title: string;
  time?: string;
  category?: string;
  source?: string;
  done: boolean;
  week?: boolean;
  pinned?: boolean;
  children?: TaskRecord[];
};

export type CredentialRecord = {
  id: string;
  title: string;
  name: string;
  label: string;
  secretLabel: string;
  mask: string;
  value: string;
  category: string;
  style: string;
  icon: string;
};

export type ChapterRecord = {
  id?: string;
  title: string;
  summary: string;
  total: number;
  mastered?: number;
  baseMastered?: number;
  updated?: string;
  points: Array<string | {
    title?: string;
    heading?: string;
    detail?: string;
    definition?: string;
    tip?: string;
  }>;
  short?: string[];
};

export type SceneEntry = {
  ideaCollection?: "career" | "pet" | "wishes";
  tasksFilter?: "all" | "week" | "open" | "done";
  credentialId?: string;
};

export type SceneSnapshot = {
  notes: NoteRecord[];
  tasks: TaskRecord[];
  mastered: string[];
  savedSummaries: string[];
  addedActions: number[];
  supplements: Record<string, string[]>;
  sources: Record<string, SourceRecord>;
  ideaInsights: Insight[];
  interviewInsights: Insight[];
  ideaSummary: string;
  ideaDirection: string;
  ideaActions: string[];
  interviewOverview: string;
  interviewGoal: string;
  interviewConclusion: string;
  chapters: ChapterRecord[];
  credentials: CredentialRecord[];
  entry?: SceneEntry;
};

export type HostBridge = {
  getSnapshot: () => SceneSnapshot;
  icon: (name: string) => string;
  aiIcon: () => string;
  back: () => void;
  navigate: (scene: string) => void;
  toast: (message: string) => void;
  saveSummary: (scene: SummaryScene) => SceneSnapshot;
  addIdeaActions: (index?: number) => SceneSnapshot;
  addSupplement: (scene: SceneName, text: string, collectionKey?: string) => SceneSnapshot;
  saveChat: (scene: SceneName, title: string, text: string) => SceneSnapshot;
  saveGeneratedNote: (scene: SummaryScene, key: string, title: string, text: string) => SceneSnapshot;
  toggleTask: (id: string) => SceneSnapshot;
  saveTask: (task: TaskRecord) => SceneSnapshot;
  markMastered: (key: string) => SceneSnapshot;
};

export type SceneBundleApi = {
  mount: (container: HTMLElement, scene: SceneName, host: HostBridge) => void;
  unmount: () => void;
  isMounted: () => boolean;
};

declare global {
  interface Window {
    OS5KonstaScenes?: SceneBundleApi;
  }
}
