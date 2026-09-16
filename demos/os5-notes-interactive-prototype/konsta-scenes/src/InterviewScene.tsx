import { useRef, useState } from "react";
import { Button } from "konsta/react";
import { createPortal } from "react-dom";
import type { HostBridge, NoteRecord, SceneSnapshot, SourceRecord } from "./types";
import { InsightCard } from "./InsightCard";
import { AiConversationPage, GeneratedNotePage, RecordingTranscriptPage, captureFlowFocus, restoreFlowFocus, type FlowFocusSnapshot, type TranscriptLine } from "./FlowViews";
import { AiMark, ComposerSheet, LegacyIcon, NoteDetail, PageTitle, SceneTopbar, SourceLink, SourceList } from "./shared";

type Tab = "insights" | "people";
type SheetState = { type: "sources" } | { type: "note"; note: NoteRecord } | { type: "compose" } | null;
type FlowState = { type: "chat"; question?: string } | { type: "recording"; source: SourceRecord } | { type: "generated" } | null;

const PEOPLE = [
  { id: "chen", name: "陈曦", role: "租房白领", tags: ["自动化优先", "省心"], text: "期待扫地、倒灰和洗拖布都能自动完成。" },
  { id: "liu", name: "刘婷", role: "有娃家庭", tags: ["清洁效果优先", "可靠"], text: "愿意为效果付费，更担心机器扫不干净、需要返工。" },
  { id: "zhou", name: "老周", role: "退休", tags: ["操作简单优先", "一键启动"], text: "不希望依赖手机设置，期待按一个键就能开始打扫。" },
];

const INTERVIEW_SUGGESTIONS = ["三类用户，我们最该主打哪一类？", "这些结论分别来自哪些原话？", "下一轮访谈应该补问什么？"];

const TRANSCRIPTS: Record<string, TranscriptLine[]> = {
  chen: [
    { time: "00:18", speaker: "访谈员", text: "你现在住的房子大概是什么情况？平时多久打扫一次？" },
    { time: "03:46", speaker: "陈曦", text: "一居室，工作日基本没时间收拾，所以才想让机器每天自己跑。" },
    { time: "08:12", speaker: "陈曦", text: "我要的是彻底解放双手。每天回来不用再想着扫地、倒灰、洗拖布。", highlighted: true },
    { time: "10:34", speaker: "访谈员", text: "你会为什么功能多花钱？" },
    { time: "10:47", speaker: "陈曦", text: "自动集尘和洗拖布。如果最后还要我一直伺候它，就没什么意义了。" },
  ],
  liu: [
    { time: "01:05", speaker: "访谈员", text: "购买前你最担心什么？" },
    { time: "12:46", speaker: "刘婷", text: "我怕它扫不干净还得我返工。家里有孩子，地板上经常有食物碎屑。", highlighted: true },
    { time: "14:20", speaker: "刘婷", text: "贵一点能接受，我更想知道它到底能不能扫干净。" },
  ],
  zhou: [
    { time: "00:42", speaker: "访谈员", text: "平时会打开手机上的扫地机应用吗？" },
    { time: "05:20", speaker: "老周", text: "我就想按一个键它就开始扫。每次还要打开手机，设置房间，太复杂了。", highlighted: true },
    { time: "07:11", speaker: "老周", text: "我不想为了打扫屋子先学一遍说明书。" },
  ],
};

function interviewAnswer(question: string): string {
  if (/主打|哪一类/.test(question)) return "如果只能先选一类，建议主打“愿意为省心付费的年轻租房白领”。\n\n原因有三点：\n1. 他们把自动集尘、洗拖布直接视为购买理由，价值最清晰。\n2. 使用环境相对标准，能先把“彻底解放双手”的体验做完整。\n3. 这不代表放弃家庭和银发用户，而是先用一类人群建立明确口碑。\n\n下一步要验证的是：这类用户愿意为完整自动化多付多少钱，以及机器需要多久维护一次才仍被认为“省心”。";
  if (/原话|依据|结论/.test(question)) return "三条核心依据分别是：\n\n陈曦：「我要的是彻底解放双手。」\n刘婷：「我怕它扫不干净还得我返工。」\n老周：「我就想按一个键它就开始扫。」\n\n它们对应自动化、清洁效果和操作简单三种不同优先级。";
  if (/下一轮|补问/.test(question)) return "下一轮可以重点补三组问题：\n1. 什么情况下用户会觉得自动化仍然麻烦？\n2. 用户用什么具体场景判断“扫得干净”？\n3. 银发用户能接受的最复杂操作到哪一步？\n\n同时增加不同户型、养宠和不同使用经验的样本。";
  return "可以先把问题拆回三类用户的目标、顾虑和愿意付出的成本，再用原始访谈逐条核对。当前样本只有三位，适合形成方向，不适合直接代表全部市场。";
}

function InterviewFooter({ host, onAdd, onChat }: { host: HostBridge; onAdd: () => void; onChat: () => void }) {
  const target = document.getElementById("floating-bar");
  if (!target) return null;
  return createPortal(<div className="konsta-footer-actions"><Button clear className="detail-pill" data-konsta-role="footer-add" onClick={onAdd}><LegacyIcon host={host} name="plus" />添加内容</Button><Button clear className="detail-pill" data-konsta-role="footer-chat" onClick={onChat}><AiMark host={host} />继续聊聊</Button></div>, target);
}

export function InterviewScene({ host, snapshot, onSnapshot }: { host: HostBridge; snapshot: SceneSnapshot; onSnapshot: (next: SceneSnapshot) => void }) {
  const [tab, setTab] = useState<Tab>("insights");
  const [openedInsights, setOpenedInsights] = useState<Set<number>>(() => new Set([0]));
  const [openedPeople, setOpenedPeople] = useState<Set<number>>(() => new Set([0]));
  const [full, setFull] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [flow, setFlow] = useState<FlowState>(null);
  const scrollTopRef = useRef(0);
  const focusRef = useRef<FlowFocusSnapshot | null>(null);
  const generatedSections = [{ heading: "访谈目标", body: snapshot.interviewGoal }, { heading: "核心结论", body: snapshot.interviewConclusion }, { heading: "关键发现", body: "1. 自动化对年轻用户是卖点，对银发用户可能是负担。\n2. 家庭用户先要确认具体场景能否扫干净。\n3. 挡住成交的往往不是价格，而是选不明白、用不明白。" }, { heading: "下一步验证", body: "增加不同户型、养宠家庭和不同使用经验的样本，让三类用户试用同一流程，再观察各自卡在哪一步。" }];
  const generatedText = [snapshot.interviewConclusion, ...generatedSections.flatMap((section) => [section.heading, section.body])].join("\n\n");
  const saved = snapshot.notes.some((note) => note.id === "summary-interview");

  const toggleInsight = (index: number) => setOpenedInsights((current) => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; });
  const togglePerson = (index: number) => setOpenedPeople((current) => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; });
  const openFlow = (next: Exclude<FlowState, null>) => {
    scrollTopRef.current = document.getElementById("app")?.scrollTop ?? 0;
    focusRef.current = captureFlowFocus();
    setSheet(null);
    setFlow(next);
    requestAnimationFrame(() => { const app = document.getElementById("app"); if (app) app.scrollTop = 0; });
  };
  const closeFlow = () => {
    setFlow(null);
    requestAnimationFrame(() => { const app = document.getElementById("app"); if (app) app.scrollTop = scrollTopRef.current; restoreFlowFocus(focusRef.current); });
  };
  const openRecording = (id: string) => { const source = snapshot.sources[id]; if (source) openFlow({ type: "recording", source }); };
  const openGeneratedNote = () => { if (!saved) onSnapshot(host.saveGeneratedNote("interview", "interview", "扫地机器人购买决策", generatedText)); openFlow({ type: "generated" }); };

  if (flow?.type === "chat") return <div className="konsta-scene" data-konsta-scene="interview"><AiConversationPage host={host} contextTitle="扫地机用户访谈" intro="我已带上三位受访者的原话，可以继续比较人群、判断定位或追溯结论依据。" suggestions={INTERVIEW_SUGGESTIONS} initialQuestion={flow.question} getAnswer={interviewAnswer} onBack={closeFlow} testId="interview-chat" suggestionTestIdPrefix="interview-chat-suggestion" /></div>;
  if (flow?.type === "recording") {
    const sourceId = Object.entries(snapshot.sources).find(([, source]) => source === flow.source)?.[0] ?? "chen";
    return <div className="konsta-scene" data-konsta-scene="interview"><RecordingTranscriptPage host={host} source={flow.source} transcript={TRANSCRIPTS[sourceId] ?? TRANSCRIPTS.chen} onBack={closeFlow} testId="interview-recording" /></div>;
  }
  if (flow?.type === "generated") return <div className="konsta-scene" data-konsta-scene="interview"><GeneratedNotePage host={host} title="扫地机器人购买决策" collection="扫地机用户访谈" intro={snapshot.interviewConclusion} sections={generatedSections} onBack={closeFlow} testId="interview-saved-note" /></div>;

  return <div className="konsta-scene" data-konsta-scene="interview">
    <div className="page interview-page" data-konsta-background>
      <SceneTopbar host={host} onSources={() => setSheet({ type: "sources" })} />
      <PageTitle title="扫地机用户访谈" meta="共 3 位受访者  |  更新时间：今天10:31" />
      <section className="interview-summary"><p className="eyebrow"><LegacyIcon host={host} name="bulb" />访谈小结</p><h2>用户选购扫地机器人，最看重什么？</h2><p>{snapshot.interviewOverview}</p></section>
      <div className="segmented-control" role="tablist" aria-label="访谈内容"><Button clear role="tab" data-konsta-role="interview-tab" data-testid="interview-tab-insights" aria-selected={tab === "insights"} className={tab === "insights" ? "active" : ""} onClick={() => setTab("insights")}>关键洞察</Button><Button clear role="tab" data-konsta-role="interview-tab" data-testid="interview-tab-people" aria-selected={tab === "people"} className={tab === "people" ? "active" : ""} onClick={() => setTab("people")}>受访者</Button></div>
      {tab === "insights" ? <div id="interview-insights-panel" role="tabpanel">
        {snapshot.interviewInsights.map((insight, index) => <InsightCard key={insight.title} host={host} snapshot={snapshot} insight={insight} index={index} opened={openedInsights.has(index)} onToggle={() => toggleInsight(index)} onSource={openRecording} question={index === 0 ? "三类用户，我们最该主打哪一类？" : undefined} onQuestion={index === 0 ? () => openFlow({ type: "chat", question: "三类用户，我们最该主打哪一类？" }) : undefined} testIdPrefix="interview" />)}
        <h2 className="page-section-title">访谈总结</h2>
        <section className="result-card"><div className="result-heading"><h3>扫地机器人购买决策</h3><Button clear className="subtle-pill" data-konsta-role="save-summary" onClick={openGeneratedNote}>{saved ? "查看笔记" : "另存为笔记"}</Button></div><div className="result-content"><h4>访谈目标</h4><p>{snapshot.interviewGoal}</p><h4>核心结论</h4><p>{snapshot.interviewConclusion}</p><h4>关键发现</h4><p><b>1. 自动化是双刃剑。</b> 同样的高端自动化功能，对年轻人是买单理由，对老人是弃用原因。高端功能并非越多越好，对银发人群反而是负担。</p>{full && <><p><b>2. 先证明扫得干净。</b> 家庭用户更担心需要返工。应围绕食物碎屑、边角与地毯等具体场景展示清洁效果。</p><p><b>3. 帮用户选明白、用明白。</b> 减少术语与复杂设置，把适用家庭和上手方式说清楚。</p><h4>下一步验证</h4><p>当前结论来自三位示例受访者。增加不同居住环境与使用经验的样本，再判断这些差异是否稳定。</p></>}</div><Button clear className="read-more" data-konsta-role="summary-expand" onClick={() => setFull((value) => !value)}>{full ? "收起全文" : "查看全文"}</Button></section>
      </div> : <div className="respondent-list" id="interview-people-panel" role="tabpanel">
        {PEOPLE.map((person, index) => { const source = snapshot.sources[person.id]; const opened = openedPeople.has(index); return <article className={`respondent-card ${opened ? "is-open" : "is-closed"}`} key={person.id}><Button clear className="respondent-header respondent-toggle" aria-expanded={opened} onClick={() => togglePerson(index)}><span className="respondent-avatar">{person.name.slice(0, 1)}</span><div><h3>{person.name}</h3><small>{person.role} · {source?.date}</small></div><LegacyIcon host={host} name={opened ? "down" : "up"} /></Button>{opened && <div className="respondent-body"><p>{person.text}</p>{person.tags.map((tag) => <span className="respondent-tag" key={tag}>{tag}</span>)}{source && <SourceLink host={host} source={source} label="查看原始访谈" onOpen={() => openRecording(person.id)} />}</div>}</article>; })}
      </div>}
    </div>
    <InterviewFooter host={host} onAdd={() => setSheet({ type: "compose" })} onChat={() => openFlow({ type: "chat" })} />
    {sheet?.type === "sources" && <SourceList host={host} scene="interview" snapshot={snapshot} onClose={() => setSheet(null)} onSource={openRecording} onNote={(note) => setSheet({ type: "note", note })} />}
    {sheet?.type === "note" && <NoteDetail note={sheet.note} onClose={() => setSheet(null)} />}
    {sheet?.type === "compose" && <ComposerSheet scene="interview" host={host} onClose={() => setSheet(null)} onSaved={onSnapshot} />}
  </div>;
}
