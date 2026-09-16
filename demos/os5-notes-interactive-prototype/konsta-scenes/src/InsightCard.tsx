import { Button } from "konsta/react";
import type { HostBridge, Insight, SceneSnapshot } from "./types";
import { AiMark, LegacyIcon, SourceQuote } from "./shared";

export function InsightCard({
  host,
  snapshot,
  insight,
  index,
  opened,
  onToggle,
  onSource,
  question,
  onQuestion,
  testIdPrefix,
}: {
  host: HostBridge;
  snapshot: SceneSnapshot;
  insight: Insight;
  index: number;
  opened: boolean;
  onToggle: () => void;
  onSource: (id: string) => void;
  question?: string;
  onQuestion?: () => void;
  testIdPrefix?: string;
}) {
  return <article className={`insight-card ${opened ? "" : "closed"}`}>
    <Button clear className="insight-heading" data-konsta-role="insight-toggle" aria-expanded={opened} onClick={onToggle}>
      <span className="insight-number">{index + 1}</span><span>{insight.title}</span><LegacyIcon host={host} name={opened ? "down" : "up"} />
    </Button>
    {opened && <div className="insight-body">
      <p>{insight.text}</p>
      {insight.sources.map((id) => {
        const source = snapshot.sources[id];
        return source ? <SourceQuote key={id} host={host} source={source} onOpen={() => onSource(id)} /> : null;
      })}
      {question && onQuestion && <Button
        clear
        className="insight-question"
        data-testid={testIdPrefix ? `${testIdPrefix}-question-${index}` : undefined}
        onClick={onQuestion}
      >
        <span className="insight-question-mark"><AiMark host={host} /></span>
        <span>{question}</span>
        <LegacyIcon host={host} name="right" />
      </Button>}
    </div>}
  </article>;
}
