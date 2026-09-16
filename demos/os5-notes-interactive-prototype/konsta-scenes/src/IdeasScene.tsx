import { useRef, useState } from "react";
import { Button } from "konsta/react";
import type { HostBridge, Insight, NoteRecord, SceneSnapshot, SourceRecord, TaskRecord } from "./types";
import { InsightCard } from "./InsightCard";
import { AiConversationPage, GeneratedNotePage, SourceNotePage, captureFlowFocus, restoreFlowFocus, type FlowFocusSnapshot, type GeneratedNoteSection } from "./FlowViews";
import { ComposerSheet, DetailSheet, FooterPortal, LegacyIcon, NoteDetail, PageTitle, SceneTopbar } from "./shared";

type IdeaCollectionKey = "career" | "pet" | "wishes";
type IdeaEntrySnapshot = SceneSnapshot & { entry?: { ideaCollection?: string } };
type IdeasHostBridge = HostBridge & { saveTask?: (task: TaskRecord) => SceneSnapshot };
type SheetState =
  | { type: "sources" }
  | { type: "note"; note: NoteRecord }
  | { type: "compose" }
  | null;
type FlowState =
  | { type: "chat"; question?: string }
  | { type: "generated" }
  | { type: "source"; source: SourceRecord }
  | null;
type IdeaCollection = {
  key: IdeaCollectionKey;
  title: string;
  recordCount: number;
  summary: string;
  insightHeading: string;
  insights: Insight[];
  questions: string[];
  chatSuggestions: string[];
  sources: Record<string, SourceRecord>;
  timelineSourceIds: string[];
  resultTitle: string;
  aiIntro: string;
  summarySections: GeneratedNoteSection[];
  actions: string[];
  actionCategory: string;
  timelineHeading: string;
  generatedTitle: string;
  collapsibleSummary: boolean;
};

const CAREER_CHAT_SUGGESTIONS = [
  "我这半年最大的收获是什么？",
  "结合我的记录，帮我列个决策清单",
  "我还需要补齐哪些能力？",
];

const PET_SOURCES: Record<string, SourceRecord> = {
  "pet-walk": { title: "傍晚和豆包散步", date: "9月14日 19:10", quote: "只要走到小区东门，它就会主动放慢，等我一起看一会儿晚霞。", body: "今天带豆包沿着河边走了四十分钟。前半程特别兴奋，回到小区东门后却主动放慢脚步，回头看我。\n只要走到小区东门，它就会主动放慢，等我一起看一会儿晚霞。\n最近想把晚饭后的半小时固定留给它。", scope: "ideas" },
  "pet-food": { title: "换粮后的第三天", date: "9月12日 08:20", quote: "胃口正常，但喝水比之前少一点，先连续记录一周。", body: "换新粮第三天，豆包吃饭速度和精神都正常。今天喝水比之前少一点，晚上散步后补喝了一次。\n胃口正常，但喝水比之前少一点，先连续记录一周。", scope: "ideas" },
  "pet-photo": { title: "豆包的表情档案", date: "9月8日 22:06", quote: "原来它开心、紧张和想睡觉的时候，耳朵的方向完全不一样。", body: "整理相册时，把豆包最近的照片按情绪分了组。\n原来它开心、紧张和想睡觉的时候，耳朵的方向完全不一样。\n以后拍照时也记一句当时发生了什么。", scope: "ideas" },
};

const PET_INSIGHTS: Insight[] = [
  { title: "散步已经变成你们共同的固定仪式", text: "记录里最稳定出现的不是路线，而是晚饭后一起出门的那段时间。豆包会等你，你也借这段散步从工作状态慢慢放松下来。", sources: ["pet-walk"] },
  { title: "你开始用连续记录代替一次判断", text: "换粮后没有因为一天的变化立刻下结论，而是同时观察胃口、饮水和精神状态。连续一周的记录会比单次感受更可靠。", sources: ["pet-food"] },
  { title: "照片正在变成有上下文的成长档案", text: "你不再只保存可爱的瞬间，而是会补上当时的情绪和事件。时间久了，这些照片能看出豆包的习惯与变化。", sources: ["pet-photo"] },
];

const WISH_SOURCES: Record<string, SourceRecord> = {
  "wish-swim": { title: "今年想学会游泳", date: "9月13日 21:30", quote: "不是为了打卡，我想在海边时真的敢游出去一点。", body: "把学游泳重新写进今年的清单。\n不是为了打卡，我想在海边时真的敢游出去一点。\n先找离公司近的泳馆，每周留一个晚上练习。", scope: "ideas" },
  "wish-family": { title: "带爸妈拍一组正式合照", date: "9月6日 18:12", quote: "相册里全是随手拍，想认真留下一次大家都在的照片。", body: "翻相册时发现一家人的合照很少。\n相册里全是随手拍，想认真留下一次大家都在的照片。\n国庆回家前先约好时间和摄影师。", scope: "ideas" },
  "wish-writing": { title: "写完第一个短故事", date: "8月29日 23:05", quote: "我总在等完整灵感，也许先写完一个不完美的版本更重要。", body: "今天又记了一个故事开头，但没有继续。\n我总在等完整灵感，也许先写完一个不完美的版本更重要。\n下一次不改开头，直接往后写到结尾。", scope: "ideas" },
};

const WISH_INSIGHTS: Insight[] = [
  { title: "真正想完成的愿望都指向一种体验", text: "游泳、全家福和写故事看起来不同，但你在意的都不是拥有一个结果，而是亲自经历一次以前没有做到的事。", sources: ["wish-swim", "wish-family"] },
  { title: "愿望卡住时，通常是第一步还不够具体", text: "你已经知道为什么想做，却常停在“有空再说”。把下一步变成可以预约、可以放进日历的动作，会更容易开始。", sources: ["wish-family"] },
  { title: "你需要允许第一个版本不完美", text: "写故事的记录反复提到等待完整灵感。先完成再修改，可能也是其他愿望真正向前推进的共同方法。", sources: ["wish-writing"] },
];

function normalizeCollection(value?: string): IdeaCollectionKey {
  return value === "pet" || value === "wishes" ? value : "career";
}

function buildIdeaCollection(snapshot: SceneSnapshot, key: IdeaCollectionKey): IdeaCollection {
  if (key === "pet") return {
    key, title: "宠物日常", recordCount: 3,
    summary: "最近关于豆包的记录，已经从“今天发生了什么”变成了对饮食、情绪和陪伴习惯的连续观察。你正在慢慢形成一份真正有用的成长档案。",
    insightHeading: "最近看见的变化", insights: PET_INSIGHTS,
    questions: ["豆包最近最需要我持续留意什么？", "怎样记录，才能更早发现身体变化？", "这些照片可以整理成怎样的成长档案？"],
    chatSuggestions: ["豆包最近最需要我留意什么？", "帮我整理一份一周观察清单", "把这些记录整理成成长档案"],
    sources: PET_SOURCES, timelineSourceIds: ["pet-walk", "pet-food", "pet-photo"], resultTitle: "关于豆包的近况",
    aiIntro: "把散步、饮食和照片放在一起看，你最在意的不是记住每一件小事，而是确认豆包过得舒服，也让陪伴变得更稳定。",
    summarySections: [
      { heading: "陪伴上，晚饭后的散步最值得保留。", body: "这段时间同时回应了豆包的期待和你的放松需求。与其追求每天走很远，不如先稳定保留这段共同时间。" },
      { heading: "健康上，用一周趋势代替单日判断。", body: "继续同时记录胃口、饮水、排便和精神状态。出现连续变化时，再带着记录咨询医生，会比凭印象描述更准确。" },
      { heading: "记录上，给照片补一句当时发生的事。", body: "同一张照片有了情绪、地点和事件，才会在以后变成能看懂的成长档案。" },
    ],
    actions: ["连续 7 天记录豆包的饮水和胃口", "把晚饭后 30 分钟固定为散步时间", "给本月照片各补一句情绪备注"],
    actionCategory: "宠物", timelineHeading: "日常记录", generatedTitle: "豆包的近况与陪伴计划", collapsibleSummary: false,
  };
  if (key === "wishes") return {
    key, title: "心愿清单", recordCount: 3,
    summary: "你真正想完成的愿望并不多：学会游泳、和家人认真留下一张合照、写完第一个故事。它们都需要的不是更多想法，而是一个可以马上开始的第一步。",
    insightHeading: "反复想实现的事", insights: WISH_INSIGHTS,
    questions: ["这三个愿望，哪个最适合现在开始？", "帮我把愿望拆成可以预约的第一步", "怎样才能不再等一个完美开头？"],
    chatSuggestions: ["这三个愿望，哪个最适合先开始？", "帮我列一份本月心愿清单", "把每个愿望拆成最小一步"],
    sources: WISH_SOURCES, timelineSourceIds: ["wish-swim", "wish-family", "wish-writing"], resultTitle: "今年真正想完成的事",
    aiIntro: "这些愿望的共同点，是你希望亲自经历并留下真实记忆。先挑一个时间窗口明确、准备成本低的愿望，会比同时推进更容易获得正反馈。",
    summarySections: [
      { heading: "优先级上，先做能在两周内启动的。", body: "游泳课和家庭合照都可以通过一次预约开始；短故事则可以先设定一个两小时、不回头修改的写作时段。" },
      { heading: "执行上，把“有空”换成具体日期。", body: "愿望没有日期就会一直退后。每件事先确定一个最小动作和明确时间，不要求一次做完。" },
      { heading: "心态上，允许第一次完成得普通。", body: "第一节游泳课、第一组照片和第一个故事都只是起点。完成一次，才有机会知道下一次想改什么。" },
    ],
    actions: ["本周选定泳馆并预约一次体验课", "今晚和家人确认国庆拍照日期", "周日用两小时写完故事初稿"],
    actionCategory: "心愿", timelineHeading: "心愿记录", generatedTitle: "我的心愿清单与下一步", collapsibleSummary: false,
  };

  const careerSources = Object.fromEntries(Object.entries(snapshot.sources).filter(([, source]) => source.scope === "ideas"));
  return {
    key: "career", title: "职业方向思考", recordCount: 6,
    summary: "半年来你一直在纠结“要不要换工作”，但记着记着会发现，你真正想在意的不是去留，而是“想做有意思的事”和“想成长”。",
    insightHeading: "反复在想的事", insights: snapshot.ideaInsights,
    questions: ["从设计转产品，还需要补哪些能力？", "我真正想离开的，是公司还是工作内容？", "怎样把“提前对齐”变成稳定习惯？"],
    chatSuggestions: CAREER_CHAT_SUGGESTIONS,
    sources: careerSources, timelineSourceIds: ["transfer", "performance", "interviewjob", "product", "align", "growth"], resultTitle: "关于职业方向的思考",
    aiIntro: snapshot.ideaSummary,
    summarySections: [
      { heading: "方向上，转产品的意愿在逐渐清晰。", body: snapshot.ideaDirection },
      { heading: "去留上，可以先做一次低成本验证。", body: "先了解内部转岗的实际条件，参与一次需求定义，再判断新的工作内容是否符合期待。把“换不换公司”和“做什么工作”分开决策，能让下一步更明确。" },
      { heading: "协作上，把对齐的时间提前。", body: "不等到视觉稿收尾才确认技术边界。下个需求开始前，先和相关同事一起确认目标、约束与验收方式。" },
    ],
    actions: snapshot.ideaActions, actionCategory: "职业规划", timelineHeading: "思考记录", generatedTitle: "关于职业方向的思考", collapsibleSummary: true,
  };
}

function ideaAnswer(question: string, collection: IdeaCollection): string {
  if (collection.key === "pet") {
    if (/留意|观察|健康|身体|清单/.test(question)) return "最值得持续留意的是饮水、胃口、排便和精神状态是否连续变化。可以每天只记四项，用一周趋势判断；如果连续两天明显异常，再带着记录咨询医生。";
    if (/照片|档案|整理/.test(question)) return "按月份整理照片，每张只补三个信息：地点、当时的情绪、发生了什么。这样留下的不只是可爱瞬间，而是一份能看出习惯变化的成长档案。";
    return "豆包最近最稳定的需求是晚饭后的陪伴。先固定散步时间，再用简短记录观察身体和情绪变化，不需要把每件小事都记得很重。";
  }
  if (collection.key === "wishes") {
    if (/哪个|先开始|优先/.test(question)) return "最适合先开始的是游泳：两周内可以完成选泳馆和一次体验课，时间边界最清楚。完成第一次后，再安排家庭合照；写故事保留一个不回头修改的两小时时段。";
    if (/拆|最小|预约|清单/.test(question)) return "把三个愿望各压缩成一步：预约一次游泳体验课、和家人确认一个拍照日期、在日历里锁定两小时写到结尾。每一步都能在本周完成。";
    return "不要再等完整灵感。给第一个版本设一个结束条件：游完一节课、拍完一组照片、写到故事结尾。完成后再决定下一次怎么变好。";
  }
  if (/补齐|能力|设计转产品/.test(question)) return "从现有记录看，你已经具备用户感受和表达方案的基础，接下来最值得补四类能力：\n\n1. 用户研究：会访谈、会把原话整理成问题。\n2. 需求判断：能说清目标、范围和优先级。\n3. 数据与业务：知道用什么指标判断方案是否有效。\n4. 推动协作：在设计之前就和研发、业务对齐约束。\n\n不需要一次补齐。先在下个需求中参与一次目标与范围定义，就是最低成本的验证。";
  if (/收获/.test(question)) return `你这半年的最大收获，是把“要不要换工作”慢慢拆成了“我到底想做什么”。\n\n${collection.aiIntro}\n\n这让下一步不必从辞职开始，而可以先用一次内部转岗沟通、一次需求定义和一次提前对齐来验证。`;
  if (/决策清单/.test(question)) return "可以按这份清单判断：\n\n1. 我想改变的是公司，还是工作内容？\n2. 现团队是否有参与产品工作的真实机会？\n3. 新岗位每天在做的事，是否符合我的期待？\n4. 我愿意用一个月补哪项能力？\n5. 完成低成本验证后，再决定内部转岗还是外部机会。";
  if (/离开|公司|工作内容/.test(question)) return "记录更支持“想改变工作内容”，而不是单纯离开现在的公司。你仍然珍惜熟悉的团队与合作关系，真正反复出现的不满足，是只参与视觉执行、无法参与决定做什么。";
  if (/对齐|习惯/.test(question)) return "把提前对齐做成固定动作：每个需求开始时先写下目标、技术约束和验收方式，并在出第一版视觉前完成一次 15 分钟确认。连续执行一个月，再看返工是否减少。";
  return `把“${question}”放回「${collection.title}」的记录里看，先选一个两周内能完成的小验证，并把结果继续记回来。`;
}

function IdeaSourceList({ host, collection, supplements, onClose, onSource, onNote }: { host: HostBridge; collection: IdeaCollection; supplements: NoteRecord[]; onClose: () => void; onSource: (id: string) => void; onNote: (note: NoteRecord) => void }) {
  const entries = Object.entries(collection.sources);
  return <DetailSheet title="原始记录" onClose={onClose}>
    <p className="sheet-hint">{entries.length + supplements.length} 条记录 · {collection.title}</p>
    <div className="source-list">
      {supplements.map((note) => <Button clear key={note.id} className="sheet-option" onClick={() => onNote(note)}><LegacyIcon host={host} name="note" /><span><strong>{note.title}</strong><small>刚刚 · 补充记录</small></span><span>›</span></Button>)}
      {entries.map(([id, source]) => <Button clear key={id} className="sheet-option" onClick={() => onSource(id)}><span>▤</span><span><strong>{source.title}</strong><small>{source.date}</small></span><span>›</span></Button>)}
    </div>
  </DetailSheet>;
}

export function IdeasScene({ host, snapshot, onSnapshot }: { host: HostBridge; snapshot: SceneSnapshot; onSnapshot: (next: SceneSnapshot) => void }) {
  const collectionKey = normalizeCollection((snapshot as IdeaEntrySnapshot).entry?.ideaCollection);
  const collection = buildIdeaCollection(snapshot, collectionKey);
  const [opened, setOpened] = useState<Set<number>>(() => new Set([0]));
  const [full, setFull] = useState(false);
  const [timelineFull, setTimelineFull] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [flow, setFlow] = useState<FlowState>(null);
  const scrollTopRef = useRef(0);
  const focusRef = useRef<FlowFocusSnapshot | null>(null);
  const supplementKey = collectionKey === "career" ? "ideas" : `ideas:${collectionKey}`;
  const extraIds = snapshot.supplements[supplementKey] ?? [];
  const extraNotes = extraIds.map((id) => snapshot.notes.find((note) => note.id === id)).filter((note): note is NoteRecord => Boolean(note));
  const collectionSnapshot: SceneSnapshot = collection.key === "career" ? snapshot : { ...snapshot, sources: collection.sources, ideaInsights: collection.insights, ideaActions: collection.actions };
  const visibleTimeline = timelineFull ? collection.timelineSourceIds : collection.timelineSourceIds.slice(0, 4);
  const generatedKey = collection.key === "career" ? "ideas" : `ideas-${collection.key}`;
  const generatedSections = [...collection.summarySections, { heading: "给自己的下一步", body: collection.actions.map((action, index) => `${index + 1}. ${action}`).join("\n") }];
  const generatedText = [collection.aiIntro, ...generatedSections.flatMap((section) => [section.heading, section.body])].join("\n\n");
  const generatedSaved = snapshot.notes.some((note) => note.id === `summary-${generatedKey}`);
  const actionIds = collection.actions.map((_, index) => `idea-${collection.key}-action-${index}`);
  const addedActionCount = collection.key === "career" ? collection.actions.filter((_, index) => snapshot.addedActions.includes(index)).length : actionIds.filter((id) => snapshot.tasks.some((task) => task.id === id)).length;

  const toggle = (index: number) => setOpened((current) => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; });
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
  const openSource = (id: string) => { const source = collectionSnapshot.sources[id]; if (source) openFlow({ type: "source", source }); };
  const addAction = (index?: number) => {
    if (collection.key === "career") {
      if (index === undefined && addedActionCount === collection.actions.length) { host.navigate("tasks"); return; }
      onSnapshot(host.addIdeaActions(index));
      return;
    }
    const saveTask = (host as IdeasHostBridge).saveTask;
    if (!saveTask) { host.toast("待办能力接线后可添加"); return; }
    const indices = index === undefined ? collection.actions.map((_, actionIndex) => actionIndex) : [index];
    let nextSnapshot: SceneSnapshot | undefined;
    indices.forEach((actionIndex) => {
      if (snapshot.tasks.some((task) => task.id === actionIds[actionIndex])) return;
      nextSnapshot = saveTask({ id: actionIds[actionIndex], title: collection.actions[actionIndex], category: collection.actionCategory, source: `ideas:${collection.key}`, done: false });
    });
    if (nextSnapshot) onSnapshot(nextSnapshot);
    else if (index === undefined) host.navigate("tasks");
    else host.toast("这项建议已在待办中");
  };
  const openGeneratedNote = () => {
    if (!generatedSaved) onSnapshot(host.saveGeneratedNote("ideas", generatedKey, collection.generatedTitle, generatedText));
    openFlow({ type: "generated" });
  };
  const handleSupplementSaved = (next: SceneSnapshot) => onSnapshot(next);

  if (flow?.type === "chat") return <div className="konsta-scene" data-konsta-scene="ideas" data-idea-collection={collection.key}><AiConversationPage host={host} contextTitle={collection.title} intro="我已带上这个合集里的记录，可以继续梳理变化、依据和下一步。" suggestions={collection.chatSuggestions} initialQuestion={flow.question} getAnswer={(question) => ideaAnswer(question, collection)} onBack={closeFlow} testId="idea-chat" suggestionTestIdPrefix="idea-chat-suggestion" /></div>;
  if (flow?.type === "generated") return <div className="konsta-scene" data-konsta-scene="ideas" data-idea-collection={collection.key}><GeneratedNotePage host={host} title={collection.generatedTitle} collection={collection.title} intro={collection.aiIntro} sections={generatedSections} onBack={closeFlow} testId="idea-saved-note" /></div>;
  if (flow?.type === "source") return <div className="konsta-scene" data-konsta-scene="ideas" data-idea-collection={collection.key}><SourceNotePage host={host} source={flow.source} collection={collection.title} onBack={closeFlow} testId="idea-source-note" /></div>;

  return <div className="konsta-scene" data-konsta-scene="ideas" data-idea-collection={collection.key}>
    <div className="page ideas-page" data-konsta-background>
      <span className="idea-header-bulb"><LegacyIcon host={host} name="bulb" /></span>
      <SceneTopbar host={host} onSources={() => setSheet({ type: "sources" })} />
      <PageTitle title={collection.title} meta={`共 ${collection.recordCount + extraNotes.length} 条笔记  |  更新时间：今天10:31`} />
      <section className="one-line-summary"><p className="eyebrow">一句话小结</p><p>{collection.summary}</p></section>
      <h2 className="page-section-title">{collection.insightHeading}</h2>
      {collection.insights.map((insight, index) => <InsightCard key={insight.title} host={host} snapshot={collectionSnapshot} insight={insight} index={index} opened={opened.has(index)} onToggle={() => toggle(index)} onSource={openSource} question={collection.questions[index]} onQuestion={() => openFlow({ type: "chat", question: collection.questions[index] })} testIdPrefix="idea" />)}
      <h2 className="page-section-title">AI帮你看见的</h2>
      <section className="result-card">
        <div className="result-heading"><span className="tiny-bulb"><LegacyIcon host={host} name="bulb" /></span><h3>{collection.resultTitle}</h3><Button clear className="subtle-pill" data-konsta-role="save-summary" onClick={openGeneratedNote}>{generatedSaved ? "查看笔记" : "另存为笔记"}</Button></div>
        <div className="result-content"><p>{collection.aiIntro}</p>{collection.summarySections.map((section, index) => { const visible = !collection.collapsibleSummary || index === 0 || full; if (!visible) return null; const body = collection.collapsibleSummary && index === 0 && !full ? `${section.body.slice(0, 145)}…` : section.body; return <div key={section.heading}><h4>{section.heading}</h4><p>{body}</p></div>; })}</div>
        {collection.collapsibleSummary && <Button clear className="read-more" data-konsta-role="summary-expand" onClick={() => setFull((value) => !value)}>{full ? "收起全文" : "查看全文"}</Button>}
      </section>
      <h2 className="page-section-title">行动建议</h2>
      <section className="result-card action-suggestions">
        <div className="result-heading"><span className="tiny-bulb"><LegacyIcon host={host} name="bulb" /></span><h3>给自己的下一步</h3><Button clear className="subtle-pill" data-konsta-role="add-all-actions" onClick={() => addAction()}>{addedActionCount === collection.actions.length ? "查看待办" : "添加到待办"}</Button></div>
        {collection.actions.map((action, index) => { const checked = collection.key === "career" ? snapshot.addedActions.includes(index) : snapshot.tasks.some((task) => task.id === actionIds[index]); return <div className="task-line" key={action}><Button clear className={`task-check ${checked ? "checked" : ""}`} data-konsta-role="add-action" aria-pressed={checked} aria-label={`添加到待办：${action}`} onClick={() => addAction(index)}>{checked && <LegacyIcon host={host} name="check" />}</Button><div className="task-text"><strong>{action}</strong></div></div>; })}
      </section>
      <h2 className="page-section-title">{collection.timelineHeading}</h2>
      <div className="thought-timeline">
        {extraNotes.map((note) => <button className="timeline-row" key={note.id} onClick={() => setSheet({ type: "note", note })}><div><small>刚刚</small><p>{note.title}</p></div><LegacyIcon host={host} name="right" /></button>)}
        {visibleTimeline.map((id) => { const source = collectionSnapshot.sources[id]; return source ? <button className="timeline-row" key={id} onClick={() => openSource(id)}><div><small>{source.date}</small><p>{source.title}</p></div><LegacyIcon host={host} name="right" /></button> : null; })}
        {collection.timelineSourceIds.length > 4 && <Button clear className="read-more" data-konsta-role="timeline-expand" onClick={() => setTimelineFull((value) => !value)}>{timelineFull ? "收起" : "查看更多"}</Button>}
      </div>
    </div>
    <FooterPortal host={host} addLabel="添加内容" askLabel="继续聊聊" onAdd={() => setSheet({ type: "compose" })} onAsk={() => openFlow({ type: "chat" })} />
    {sheet?.type === "sources" && <IdeaSourceList host={host} collection={collection} supplements={extraNotes} onClose={() => setSheet(null)} onSource={openSource} onNote={(note) => setSheet({ type: "note", note })} />}
    {sheet?.type === "note" && <NoteDetail note={sheet.note} onClose={() => setSheet(null)} />}
    {sheet?.type === "compose" && <ComposerSheet scene="ideas" collectionKey={supplementKey} host={host} onClose={() => setSheet(null)} onSaved={handleSupplementSaved} />}
  </div>;
}
