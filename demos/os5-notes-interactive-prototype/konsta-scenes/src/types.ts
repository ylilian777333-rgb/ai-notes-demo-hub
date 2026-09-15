export type SceneName = "ideas" | "interview";

export type SourceRecord = {
  title: string;
  date: string;
  time?: string;
  quote: string;
  body: string;
  scope: SceneName | "course";
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
};

export type SceneSnapshot = {
  notes: NoteRecord[];
  tasks: TaskRecord[];
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
};

export type HostBridge = {
  getSnapshot: () => SceneSnapshot;
  icon: (name: string) => string;
  aiIcon: () => string;
  back: () => void;
  navigate: (scene: string) => void;
  toast: (message: string) => void;
  saveSummary: (scene: SceneName) => SceneSnapshot;
  addIdeaActions: (index?: number) => SceneSnapshot;
  addSupplement: (scene: SceneName, text: string) => SceneSnapshot;
  saveChat: (scene: SceneName, title: string, text: string) => SceneSnapshot;
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
