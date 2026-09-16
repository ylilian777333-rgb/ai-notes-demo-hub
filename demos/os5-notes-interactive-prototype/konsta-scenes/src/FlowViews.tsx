import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "konsta/react";
import type { HostBridge, SourceRecord } from "./types";
import { AiMark, LegacyIcon } from "./shared";
import "./flow-views.css";

export type GeneratedNoteSection = {
  heading: string;
  body: string;
};

export type TranscriptLine = {
  time: string;
  speaker: string;
  text: string;
  highlighted?: boolean;
};

export type FlowFocusSnapshot = {
  testId?: string;
  role?: string;
  ariaLabel?: string;
  text: string;
};

export function captureFlowFocus(): FlowFocusSnapshot | null {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return null;
  return {
    testId: active.dataset.testid,
    role: active.dataset.konstaRole,
    ariaLabel: active.getAttribute("aria-label") ?? undefined,
    text: active.textContent?.trim() ?? "",
  };
}

export function restoreFlowFocus(snapshot: FlowFocusSnapshot | null): void {
  if (!snapshot) return;
  const candidates = Array.from(document.querySelectorAll<HTMLElement>("button,[href],input,textarea,select,[tabindex='0']"));
  const target = candidates.find((candidate) => snapshot.testId && candidate.dataset.testid === snapshot.testId)
    ?? candidates.find((candidate) => snapshot.ariaLabel && candidate.getAttribute("aria-label") === snapshot.ariaLabel)
    ?? candidates.find((candidate) => snapshot.role && candidate.dataset.konstaRole === snapshot.role && candidate.textContent?.trim() === snapshot.text)
    ?? candidates.find((candidate) => snapshot.text && candidate.textContent?.trim() === snapshot.text);
  target?.focus({ preventScroll: true });
}

export function FlowHeader({
  host,
  title,
  onBack,
  action,
}: {
  host: HostBridge;
  title: string;
  onBack: () => void;
  action?: ReactNode;
}) {
  return (
    <header className="flow-header">
      <Button clear autoFocus className="flow-header-back" aria-label="返回" onClick={onBack}>
        <LegacyIcon host={host} name="back" />
      </Button>
      <h1>{title}</h1>
      <div className="flow-header-action">{action}</div>
    </header>
  );
}

type ConversationTurn = {
  question: string;
  answer: string;
};

export function AiConversationPage({
  host,
  contextTitle,
  intro,
  suggestions,
  initialQuestion,
  getAnswer,
  onBack,
  testId,
  suggestionTestIdPrefix,
}: {
  host: HostBridge;
  contextTitle: string;
  intro: string;
  suggestions: string[];
  initialQuestion?: string;
  getAnswer: (question: string) => string;
  onBack: () => void;
  testId?: string;
  suggestionTestIdPrefix?: string;
}) {
  const answerRef = useRef(getAnswer);
  const initial = initialQuestion?.trim() ?? "";
  const [turns, setTurns] = useState<ConversationTurn[]>(() => initial ? [{ question: initial, answer: getAnswer(initial) }] : []);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    answerRef.current = getAnswer;
  }, [getAnswer]);

  useEffect(() => {
    const next = initialQuestion?.trim() ?? "";
    setTurns(next ? [{ question: next, answer: answerRef.current(next) }] : []);
    setDraft("");
  }, [initialQuestion]);

  const ask = (value: string) => {
    const next = value.trim();
    if (!next) return;
    setTurns((current) => [...current, { question: next, answer: answerRef.current(next) }]);
    setDraft("");
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(draft);
  };

  return (
    <main className="latest-flow-page latest-flow-ai" data-testid={testId}>
      <FlowHeader host={host} title="超级小爱" onBack={onBack} />
      <div className="flow-ai-content">
        <section className="flow-ai-context" aria-label="当前合集">
          <span className="flow-ai-logo"><AiMark host={host} /></span>
          <div>
            <small>正在结合合集内容回答</small>
            <strong>{contextTitle}</strong>
          </div>
        </section>

        {turns.length === 0 ? (
          <section className="flow-ai-empty">
            <span className="flow-ai-orbit"><AiMark host={host} /></span>
            <h2>想从这些记录里了解什么？</h2>
            <p>{intro}</p>
          </section>
        ) : (
          <section className="flow-ai-thread" aria-live="polite">
            {turns.map((turn, index) => <div className="flow-ai-turn" key={`${index}-${turn.question}`}>
              <div className="flow-user-bubble">{turn.question}</div>
              <div className="flow-thinking-complete">
                <span><LegacyIcon host={host} name="check" /></span>
                思考完成
              </div>
              <article className="flow-ai-answer">
                <div className="flow-ai-answer-heading"><AiMark host={host} /><strong>结合你的记录</strong></div>
                <p>{turn.answer}</p>
              </article>
            </div>)}
          </section>
        )}

        {turns.length === 0 && (
          <section className="flow-ai-suggestions" aria-label="建议问题">
            {suggestions.map((suggestion, index) => (
              <Button
                clear
                key={suggestion}
                className="flow-ai-suggestion"
                data-testid={suggestionTestIdPrefix ? `${suggestionTestIdPrefix}-${index}` : undefined}
                onClick={() => ask(suggestion)}
              >
                <span>{suggestion}</span>
                <LegacyIcon host={host} name="right" />
              </Button>
            ))}
          </section>
        )}

        <form className="flow-ai-composer" onSubmit={submit}>
          <input
            aria-label="向超级小爱提问"
            placeholder="继续问问…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button clear type="submit" aria-label="发送" disabled={!draft.trim()}>
            <LegacyIcon host={host} name="send" />
          </Button>
        </form>
      </div>
    </main>
  );
}

export function GeneratedNotePage({
  host,
  title,
  collection,
  intro,
  sections,
  onBack,
  testId,
}: {
  host: HostBridge;
  title: string;
  collection: string;
  intro: string;
  sections: GeneratedNoteSection[];
  onBack: () => void;
  testId?: string;
}) {
  return (
    <main className="latest-flow-page latest-generated-note" data-testid={testId}>
      <FlowHeader host={host} title="AI 生成笔记" onBack={onBack} />
      <article className="generated-note-paper">
        <div className="generated-note-kicker"><AiMark host={host} />AI 已根据合集整理</div>
        <h2>{title}</h2>
        <div className="generated-note-meta">
          <span>刚刚</span>
          <span>所属合集：{collection}</span>
        </div>
        <p className="generated-note-intro">{intro}</p>
        {sections.map((section) => (
          <section key={section.heading} className="generated-note-section">
            <h3>{section.heading}</h3>
            <p>{section.body}</p>
          </section>
        ))}
        <footer className="generated-note-footer"><AiMark host={host} />由超级小爱整理，可继续编辑</footer>
      </article>
    </main>
  );
}

export function SourceNotePage({
  host,
  source,
  collection,
  onBack,
  testId,
}: {
  host: HostBridge;
  source: SourceRecord;
  collection?: string;
  onBack: () => void;
  testId?: string;
}) {
  const paragraphs = source.body.split(/\n+/).filter(Boolean);
  return (
    <main className="latest-flow-page latest-source-note" data-testid={testId}>
      <FlowHeader host={host} title="原始记录" onBack={onBack} />
      <article className="source-note-paper">
        <h2>{source.title}</h2>
        <p className="source-note-meta">
          {source.date}{source.time ? ` · 录音转写 ${source.time}` : ""}
        </p>
        {collection && <span className="source-note-collection">来自合集：{collection}</span>}
        <blockquote>{source.quote}</blockquote>
        <div className="source-note-copy">
          {paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
        </div>
      </article>
    </main>
  );
}

function parseTimestamp(value: string): number {
  const parts = value.split(":").map(Number);
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

function formatTimestamp(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function RecordingTranscriptPage({
  host,
  source,
  transcript,
  duration = "18:36",
  onBack,
  testId,
}: {
  host: HostBridge;
  source: SourceRecord;
  transcript: TranscriptLine[];
  duration?: string;
  onBack: () => void;
  testId?: string;
}) {
  const startSeconds = parseTimestamp(source.time ?? "00:00");
  const durationSeconds = Math.max(parseTimestamp(duration), startSeconds + 60);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(startSeconds);

  useEffect(() => {
    setPlaying(false);
    setPosition(startSeconds);
  }, [source.title, source.time, startSeconds]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setPosition((current) => {
        if (current >= durationSeconds) {
          setPlaying(false);
          return durationSeconds;
        }
        return Math.min(current + 1, durationSeconds);
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [durationSeconds, playing]);

  const progress = Math.min(100, (position / durationSeconds) * 100);

  return (
    <main className="latest-flow-page latest-recording-page" data-testid={testId}>
      <FlowHeader host={host} title="录音原文" onBack={onBack} />
      <article className="recording-document">
        <h2>{source.title}</h2>
        <p className="recording-meta">{source.date} · 录音转写</p>

        <div className="recording-tabs" role="tablist" aria-label="录音内容">
          <Button clear id="recording-tab-original" role="tab" aria-controls="recording-original-panel" aria-selected="true" className="is-active">原文</Button>
          <Button clear disabled role="tab" aria-disabled="true" aria-selected="false">AI 摘要</Button>
        </div>

        <div id="recording-original-panel" role="tabpanel" aria-labelledby="recording-tab-original">
          <section className="recording-player" aria-label="录音播放器">
            <Button
              clear
              className="recording-play"
              data-testid="recording-play"
              aria-label={playing ? "暂停录音" : "播放录音"}
              aria-pressed={playing}
              onClick={() => setPlaying((value) => !value)}
            >
              <LegacyIcon host={host} name={playing ? "pause" : "play"} />
            </Button>
            <div className="recording-progress-wrap">
              <div className="recording-progress" role="progressbar" aria-valuemin={0} aria-valuemax={durationSeconds} aria-valuenow={position}>
                <span style={{ width: `${progress}%` }} />
              </div>
              <div className="recording-time"><span>{formatTimestamp(position)}</span><span>{duration}</span></div>
            </div>
          </section>
          <p className="recording-demo-hint">演示播放 · 时间点与原文保持对应</p>

          <section className="recording-transcript" aria-label="录音原文">
            {transcript.map((line) => (
              <article key={`${line.time}-${line.speaker}`} className={line.highlighted ? "is-highlighted" : ""}>
                <time>{line.time}</time>
                <div>
                  <strong>{line.speaker}</strong>
                  <p>{line.text}</p>
                </div>
              </article>
            ))}
          </section>
        </div>
      </article>
    </main>
  );
}
