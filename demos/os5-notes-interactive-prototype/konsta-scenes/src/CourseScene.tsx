import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "konsta/react";
import type { HostBridge, SceneSnapshot } from "./types";
import { AiMark, DetailSheet, FooterPortal, LegacyIcon, PageTitle } from "./shared";
import "./course-scene.css";

type CoursePoint = {
  title: string;
  heading: string;
  detail: string;
  definition: string;
  tip: string;
};

type CourseChapter = {
  id: string;
  title: string;
  summary: string;
  total: number;
  baseMastered: number;
  updated: string;
  points: CoursePoint[];
};

type SnapshotChapter = {
  id?: string;
  title?: string;
  summary?: string;
  total?: number;
  mastered?: number;
  baseMastered?: number;
  updated?: string;
  points?: Array<string | Partial<CoursePoint>>;
};

type CourseSnapshot = SceneSnapshot & {
  chapters?: SnapshotChapter[];
  mastered?: string[];
};

type CourseHost = HostBridge & {
  markMastered: (key: string) => SceneSnapshot;
  addSupplement: HostBridge["addSupplement"] & ((scene: "course", text: string) => SceneSnapshot);
};

type CourseView =
  | "home"
  | "knowledge"
  | "chat"
  | "podcast-generating"
  | "podcast-player"
  | "review"
  | "source-note"
  | "interactive"
  | "quiz-single"
  | "quiz-boolean"
  | "quiz-calculation"
  | "quiz-complete";

type SheetState = "chapters" | "compose" | null;
type ChatMessage = { role: "user" | "assistant"; text: string };
type InteractiveStage = "prompt" | "followup" | "mastered";

const COURSE_CHAPTERS: CourseChapter[] = [
  {
    id: "limits",
    title: "极限与连续",
    summary: "本章是整个微积分的地基。用 ε 语言把“无限趋近”讲严格，掌握极限的计算方法，再理解函数的连续性与间断点。重点是极限计算。",
    total: 10,
    baseMastered: 4,
    updated: "9月10日",
    points: [
      { title: "ε-N / ε-δ 定义——写法和使用", heading: "把“靠近”说清楚", detail: "任意给定一个误差范围 ε，都能找到足够小的 δ，使 x 靠近 a 时，f(x) 落在 L 附近。", definition: "0 < |x − a| < δ  ⇒  |f(x) − L| < ε", tip: "函数在 a 点的值不决定极限是否存在。" },
      { title: "夹逼定理——证明题必考", heading: "从两侧夹住同一个值", detail: "若 g(x) ≤ f(x) ≤ h(x)，并且 g(x)、h(x) 都趋向 L，那么 f(x) 也趋向 L。", definition: "g(x) ≤ f(x) ≤ h(x)", tip: "先找到上下界，再证明上下界具有相同极限。" },
      { title: "单调有界准则——判定收敛", heading: "单调加有界，保证收敛", detail: "单调递增且有上界的数列必收敛；单调递减且有下界的数列同理。", definition: "单调 + 有界  ⇒  收敛", tip: "单调和有界两个条件缺一不可。" },
      { title: "连续三条件与间断点分类", heading: "连续需要三个条件", detail: "函数在该点有定义、该点极限存在，而且极限等于函数值，三项同时满足才连续。", definition: "lim f(x) = f(a)，x → a", tip: "极限存在不等于连续，还要检查函数值。" }
    ]
  },
  {
    id: "derivatives",
    title: "导数与微分",
    summary: "本章刻画函数的变化快慢，从导数定义和几何意义出发，掌握求导法则与链式法则，理解微分作为线性近似。",
    total: 8,
    baseMastered: 2,
    updated: "9月6日",
    points: [
      { title: "导数定义与几何意义", heading: "变化率，也是切线斜率", detail: "导数是平均变化率在区间缩小时的极限，描述函数在某点附近变化的快慢。", definition: "f′(x) = lim [f(x+h)−f(x)] / h", tip: "可导一定连续，连续不一定可导。" },
      { title: "链式法则——后续所有计算的基础", heading: "复合函数，一层一层求导", detail: "先求外层导数，再乘以内层导数，不要漏掉内层的变化率。", definition: "(f(g(x)))′ = f′(g(x)) · g′(x)", tip: "sin(x²) 的导数是 2x cos(x²)。" },
      { title: "隐函数求导", heading: "把 y 也看成 x 的函数", detail: "对等式两边同时求导，遇到 y 的项，要用链式法则带上 y′。", definition: "x² + y² = 1  ⇒  y′ = −x/y", tip: "该表达式适用于 y ≠ 0 的位置。" },
      { title: "洛必达法则", heading: "先检查是否为未定式", detail: "满足适用条件时，可通过分子、分母分别求导计算 0/0 或 ∞/∞ 型极限。", definition: "lim f(x)/g(x) = lim f′(x)/g′(x)", tip: "使用前必须核对未定式、可导性和分母导数。" }
    ]
  },
  {
    id: "mean-value",
    title: "微分中值定理与导数的应用",
    summary: "本章是导数的用武之地：先学三大中值定理，再用导数求极限、判断单调与凹凸、求极值最值。",
    total: 8,
    baseMastered: 0,
    updated: "9月6日",
    points: [
      { title: "罗尔定理与拉格朗日中值定理", heading: "局部变化连接整体变化", detail: "闭区间连续、开区间可导时，至少存在一点的导数等于区间平均变化率。", definition: "f′(ξ) = [f(b)−f(a)] / (b−a)", tip: "罗尔定理对应端点函数值相等的情况。" },
      { title: "柯西中值定理", heading: "比较两个函数的变化", detail: "柯西中值定理把两个函数的总体变化量与某点导数联系起来。", definition: "[f(b)−f(a)]g′(ξ) = [g(b)−g(a)]f′(ξ)", tip: "先确认两个函数都满足连续和可导条件。" },
      { title: "函数的单调性与极值", heading: "看导数符号的变化", detail: "导数由正变负对应局部极大，由负变正对应局部极小。", definition: "f′ > 0：递增  ·  f′ < 0：递减", tip: "驻点不一定是极值点，还要检查邻域变化。" },
      { title: "函数图形与最值问题", heading: "端点和关键点一起比较", detail: "闭区间上的最值，要比较端点、驻点和不可导点的函数值。", definition: "候选点 → 计算值 → 比较", tip: "不能只求导数为零的位置。" }
    ]
  },
  {
    id: "indefinite-integrals",
    title: "不定积分",
    summary: "本章学习求导的逆运算，核心是换元积分法与分部积分法。难点在于没有固定套路，需要通过练习识别结构。",
    total: 9,
    baseMastered: 0,
    updated: "9月1日",
    points: [
      { title: "原函数与不定积分", heading: "从导数反推原函数", detail: "若 F′(x)=f(x)，则 F(x) 是 f(x) 的一个原函数，所有原函数只相差一个常数。", definition: "∫f(x)dx = F(x) + C", tip: "积分结果不要漏写任意常数 C。" },
      { title: "第一类换元积分法", heading: "把复合结构凑成微分", detail: "观察被积函数是否含某个内层函数及其导数，把它们整体替换成新变量。", definition: "∫f(φ(x))φ′(x)dx = ∫f(u)du", tip: "换元后要把积分变量和上下文一起换干净。" },
      { title: "第二类换元积分法", heading: "用新变量化简根式", detail: "令 x=φ(t)，把复杂根式或三角结构转成更容易积分的形式。", definition: "dx = φ′(t)dt", tip: "最后必须换回原变量。" },
      { title: "分部积分法", heading: "把难积分拆成一求导一积分", detail: "适合多项式与指数、三角或对数函数相乘的情形。", definition: "∫u dv = uv − ∫v du", tip: "通常优先让对数或反三角函数作 u。" }
    ]
  }
];

const COURSE_SUGGESTIONS = ["帮我整理一页考前速览", "讲讲可导和连续的区别", "出几道高频考题练手"];

function normalizeChapters(snapshotChapters: SnapshotChapter[] | undefined): CourseChapter[] {
  return COURSE_CHAPTERS.map((fallback, chapterIndex) => {
    const incoming = snapshotChapters?.[chapterIndex];
    const points = fallback.points.map((point, pointIndex) => {
      const next = incoming?.points?.[pointIndex];
      return typeof next === "string" ? { ...point, title: next } : { ...point, ...next };
    });
    return {
      ...fallback,
      ...incoming,
      id: incoming?.id ?? fallback.id,
      title: incoming?.title ?? fallback.title,
      summary: incoming?.summary ?? fallback.summary,
      total: incoming?.total ?? fallback.total,
      baseMastered: incoming?.baseMastered ?? incoming?.mastered ?? fallback.baseMastered,
      updated: incoming?.updated ?? fallback.updated,
      points
    };
  });
}

function CourseTopbar({ host, onSource }: { host: HostBridge; onSource: () => void }) {
  return <div className="course-latest-topbar">
    <Button clear className="course-latest-icon-button" aria-label="返回合集" onClick={host.back}><LegacyIcon host={host} name="back" /></Button>
    <Button clear className="course-latest-icon-button" aria-label="查看课程原笔记" onClick={onSource}><LegacyIcon host={host} name="note" /></Button>
  </div>;
}

function CourseSubpageHeader({ host, title, subtitle, onBack }: { host: HostBridge; title: string; subtitle?: string; onBack: () => void }) {
  return <header className="course-latest-subpage-header">
    <Button clear className="course-latest-icon-button" aria-label="返回" onClick={onBack}><LegacyIcon host={host} name="back" /></Button>
    <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
    <span className="course-latest-header-spacer" aria-hidden="true" />
  </header>;
}

function ChapterDrawer({ host, chapters, current, query, onQuery, onChoose, onClose }: { host: HostBridge; chapters: CourseChapter[]; current: number; query: string; onQuery: (value: string) => void; onChoose: (index: number) => void; onClose: () => void }) {
  const normalized = query.trim().toLowerCase();
  const filtered = chapters.map((chapter, index) => ({ chapter, index })).filter(({ chapter }) => !normalized || `${chapter.title} ${chapter.summary} ${chapter.points.map(point => point.title).join(" ")}`.toLowerCase().includes(normalized));
  return <DetailSheet title="切换章节" onClose={onClose}>
    <div className="course-latest-drawer" data-testid="chapter-drawer">
      <label className="course-latest-search"><LegacyIcon host={host} name="search" /><input aria-label="搜索章节" placeholder="搜索" value={query} onChange={event => onQuery(event.target.value)} /></label>
      <div className="course-latest-chapter-options">
        {filtered.map(({ chapter, index }) => <Button clear key={chapter.id} className={`course-latest-chapter-option ${current === index ? "active" : ""}`} aria-current={current === index ? "true" : undefined} onClick={() => onChoose(index)}>
          <span className="course-latest-number">{String(index + 1).padStart(2, "0")}</span>
          <span><strong>{chapter.title}</strong><small>{chapter.summary}</small><em>更新于：{chapter.updated}</em></span>
          <LegacyIcon host={host} name="right" />
        </Button>)}
        {!filtered.length && <p className="course-latest-empty">没有找到相关章节</p>}
      </div>
    </div>
  </DetailSheet>;
}

function CourseComposer({ host, onClose, onSaved }: { host: CourseHost; onClose: () => void; onSaved: (snapshot: SceneSnapshot) => void }) {
  const [value, setValue] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSaved(host.addSupplement("course", text));
    onClose();
  };
  return <DetailSheet title="补充课程记录" onClose={onClose}>
    <form className="course-latest-composer" onSubmit={submit}>
      <p>补充课堂观察、公式、作业或老师强调的重点，保存后会进入“高等数学”课程。</p>
      <textarea autoFocus aria-label="补充课程记录" maxLength={10000} placeholder="写下内容…" value={value} onChange={event => setValue(event.target.value)} />
      <Button className="course-latest-primary" type="submit" disabled={!value.trim()}>保存到课程</Button>
    </form>
  </DetailSheet>;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function courseAnswer(question: string) {
  if (/速览|复习|考前/.test(question)) return "考前先抓住三条主线：\n1. 极限关注“靠近时的趋势”，左右极限必须一致。\n2. 连续要求有定义、极限存在且等于函数值。\n3. 可导一定连续，但连续不一定可导。\n\n建议先复述定义，再做一道有界性判断和一道极限计算。";
  if (/可导|连续/.test(question)) return "可导比连续要求更强。函数在一点可导，一定能推出它在该点连续；但连续只能说明图像没有断开，尖点处仍可能没有唯一切线，所以未必可导。\n\n例子：f(x)=|x| 在 x=0 连续，但左右导数分别为 −1 和 1，因此不可导。";
  if (/考题|练手|题/.test(question)) return "可以从这三题开始：\n1. 单选：函数有界的充要条件是什么？\n2. 判断：对任意 M>0 都能找到 |f(x)|>M，是否表示无界？\n3. 计算：在 x≥1 上证明 f(x)=−1/x 有界，并给出一个 M。\n\n第三题注意定义域是 x≥1。";
  return "我已经带上高等数学课程的章节、知识点和课堂笔记。可以先说你卡住的定义或题目，我会优先依据课程内容回答，并指出可回看的章节。";
}

export function CourseScene({ host, snapshot, onSnapshot }: { host: CourseHost; snapshot: CourseSnapshot; onSnapshot: (next: SceneSnapshot) => void }) {
  const chapters = useMemo(() => normalizeChapters(snapshot.chapters), [snapshot.chapters]);
  const [view, setView] = useState<CourseView>("home");
  const [sheet, setSheet] = useState<SheetState>(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [pointIndex, setPointIndex] = useState(0);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([0, 1]));
  const [chapterQuery, setChapterQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatValue, setChatValue] = useState("");
  const [podcastPlaying, setPodcastPlaying] = useState(false);
  const [sourceAudioPlaying, setSourceAudioPlaying] = useState(false);
  const [podcastSeconds, setPodcastSeconds] = useState(23 * 60 + 54);
  const [slideIndex, setSlideIndex] = useState(0);
  const [interactiveStage, setInteractiveStage] = useState<InteractiveStage>("prompt");
  const [interactiveAnswer, setInteractiveAnswer] = useState("");
  const [followupAnswer, setFollowupAnswer] = useState("");
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [singleAnswer, setSingleAnswer] = useState<number | null>(null);
  const [singleSubmitted, setSingleSubmitted] = useState(false);
  const [booleanAnswer, setBooleanAnswer] = useState<boolean | null>(null);
  const [booleanSubmitted, setBooleanSubmitted] = useState(false);
  const [calculationAnswer, setCalculationAnswer] = useState("");
  const [calculationSubmitted, setCalculationSubmitted] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [sourceReturn, setSourceReturn] = useState<CourseView>("home");
  const homeScrollRef = useRef(0);

  const activeChapter = chapters[chapterIndex] ?? chapters[0];
  const activePoint = activeChapter.points[pointIndex] ?? activeChapter.points[0];
  const mastered = snapshot.mastered ?? [];
  const newlyMastered = new Set(mastered.filter(key => key.startsWith(`${chapterIndex}-`))).size;
  const masteredCount = Math.min(activeChapter.total, activeChapter.baseMastered + newlyMastered);
  const progress = Math.round(masteredCount / activeChapter.total * 100);
  const source = snapshot.sources.course0;
  const supplementCount = snapshot.supplements.course?.length ?? 0;

  const openView = (next: CourseView) => {
    if (view === "home" && next !== "home") homeScrollRef.current = document.getElementById("app")?.scrollTop ?? 0;
    setView(next);
    window.requestAnimationFrame(() => document.getElementById("app")?.scrollTo({ top: 0, behavior: "auto" }));
  };
  const goHome = () => {
    setView("home");
    window.requestAnimationFrame(() => document.getElementById("app")?.scrollTo({ top: homeScrollRef.current, behavior: "auto" }));
  };
  const openSource = (returnTo: CourseView = "home") => {
    setSourceReturn(returnTo);
    openView("source-note");
  };
  const openKnowledge = (nextChapter: number, nextPoint: number) => {
    setChapterIndex(nextChapter);
    setPointIndex(nextPoint);
    openView("knowledge");
  };
  const chooseChapter = (index: number) => {
    setChapterIndex(index);
    setPointIndex(0);
    setExpanded(current => new Set(current).add(index));
    setSheet(null);
    setChapterQuery("");
  };
  const toggleChapter = (index: number) => setExpanded(current => {
    const next = new Set(current);
    next.has(index) ? next.delete(index) : next.add(index);
    return next;
  });
  const markPoint = (key: string) => {
    onSnapshot(host.markMastered(key));
    host.toast("已更新学习进度");
  };
  const startPodcast = () => {
    setPodcastPlaying(false);
    setPodcastSeconds(23 * 60 + 54);
    openView("podcast-generating");
  };
  const startInteractive = () => {
    setChapterIndex(1);
    setPointIndex(3);
    setInteractiveStage("prompt");
    setInteractiveAnswer("");
    setFollowupAnswer("");
    setReferenceOpen(false);
    openView("interactive");
  };
  const openQuiz = () => {
    setSingleAnswer(null);
    setSingleSubmitted(false);
    setBooleanAnswer(null);
    setBooleanSubmitted(false);
    setCalculationAnswer("");
    setCalculationSubmitted(false);
    setStepsOpen(false);
    openView("quiz-single");
  };
  const sendQuestion = (question: string) => {
    const text = question.trim();
    if (!text) return;
    setChatMessages(current => [...current, { role: "user", text }, { role: "assistant", text: courseAnswer(text) }]);
    setChatValue("");
  };

  useEffect(() => {
    if (view !== "podcast-generating") return;
    const timeout = window.setTimeout(() => openView("podcast-player"), 2200);
    return () => window.clearTimeout(timeout);
  }, [view]);

  useEffect(() => {
    if (view !== "podcast-player" || !podcastPlaying) return;
    const interval = window.setInterval(() => setPodcastSeconds(current => {
      if (current >= 83 * 60 + 11) {
        setPodcastPlaying(false);
        return current;
      }
      return current + 1;
    }), 1000);
    return () => window.clearInterval(interval);
  }, [podcastPlaying, view]);

  const home = <div className="course-latest-page course-latest-home" data-testid="course-home">
    <CourseTopbar host={host} onSource={() => openSource("home")} />
    <PageTitle title="高等数学" meta={`2026 秋季学期  |  更新时间：今天10:31${supplementCount ? `  ·  新增 ${supplementCount} 条` : ""}`} />
    <section className="course-latest-hero">
      <div className="course-latest-hero-heading"><h2>第{chapterIndex + 1}章 {activeChapter.title}</h2><Button clear data-testid="chapter-switch" className="course-latest-switch" onClick={() => setSheet("chapters")}>切换章节</Button></div>
      <p>{activeChapter.summary}</p>
      <div className="course-latest-progress-copy"><span>知识点已掌握 {masteredCount}/{activeChapter.total}</span><span>{progress}%</span></div>
      <div className="course-latest-progress" role="progressbar" aria-label="章节掌握进度" aria-valuemin={0} aria-valuemax={activeChapter.total} aria-valuenow={masteredCount}><i style={{ width: `${progress}%` }} /></div>
      <Button className="course-latest-continue" onClick={startInteractive}>继续学习</Button>
    </section>
    <div className="course-latest-quick-actions" aria-label="课程复习工具">
      <Button clear className="course-latest-quick-card" onClick={startPodcast}><span className="blue">🎧</span><strong>播客精讲</strong><small>听一遍这一章</small></Button>
      <Button clear className="course-latest-quick-card" onClick={() => { setSlideIndex(0); openView("review"); }}><span className="green">📚</span><strong>复习课件</strong><small>翻看重点内容</small></Button>
      <Button clear className="course-latest-quick-card" onClick={openQuiz}><span className="orange">📝</span><strong>考题自测</strong><small>动手做题试试</small></Button>
    </div>
    <h2 className="course-latest-section-title">章节与知识点</h2>
    <div className="course-latest-chapter-list">
      {chapters.map((chapter, index) => {
        const opened = expanded.has(index);
        return <section className={`course-latest-chapter-card ${opened ? "open" : ""}`} key={chapter.id}>
          <Button clear className="course-latest-chapter-heading" aria-expanded={opened} onClick={() => toggleChapter(index)}><span className="course-latest-number">{String(index + 1).padStart(2, "0")}</span><strong>{chapter.title}</strong><LegacyIcon host={host} name={opened ? "down" : "up"} /></Button>
          {opened && <div className="course-latest-point-list">{chapter.points.map((point, pointOffset) => {
            const key = `${index}-${pointOffset}`;
            const learned = mastered.includes(key);
            return <Button clear className={`course-latest-point ${learned ? "mastered" : ""}`} key={point.title} onClick={() => openKnowledge(index, pointOffset)}><span className="course-latest-dot" /><span>{point.title}</span>{learned && <span className="course-latest-learned">已掌握</span>}<LegacyIcon host={host} name="right" /></Button>;
          })}</div>}
        </section>;
      })}
    </div>
  </div>;

  const knowledge = <div className="course-latest-page course-latest-subpage course-latest-knowledge">
    <CourseSubpageHeader host={host} title={activePoint.heading} subtitle={`第${chapterIndex + 1}章 · ${activeChapter.title}`} onBack={goHome} />
    <main>
      <section className="course-latest-definition-card"><span>知识点 {pointIndex + 1}</span><h2>{activePoint.title}</h2><p>{activePoint.detail}</p><strong>{activePoint.definition}</strong><p className="course-latest-tip">易错点：{activePoint.tip}</p></section>
      <section className="course-latest-related-card"><h3>相关笔记</h3><Button clear onClick={() => openSource("knowledge")}><LegacyIcon host={host} name="note" /><span><strong>函数的有界性</strong><small>课堂录音 · AI生成</small></span><LegacyIcon host={host} name="right" /></Button></section>
      <div className="course-latest-action-stack"><Button className="course-latest-primary" onClick={() => markPoint(`${chapterIndex}-${pointIndex}`)}>{mastered.includes(`${chapterIndex}-${pointIndex}`) ? "已掌握" : "标记为已掌握"}</Button><Button className="course-latest-secondary" onClick={startInteractive}>开始互动问答</Button></div>
    </main>
  </div>;

  const chat = <div className="course-latest-page course-latest-chat" data-testid="course-chat">
    <CourseSubpageHeader host={host} title="超级小爱" subtitle="内容由AI生成" onBack={goHome} />
    <main>
      <div className="course-latest-chat-hero"><AiMark host={host} /><span>高等数学</span><p>需要我帮你做点什么？</p></div>
      <div className="course-latest-context-chip"><LegacyIcon host={host} name="note" />基于“高等数学”提问</div>
      {!chatMessages.length && <div className="course-latest-suggestions">{COURSE_SUGGESTIONS.map(question => <Button clear key={question} onClick={() => sendQuestion(question)}>{question}<LegacyIcon host={host} name="right" /></Button>)}</div>}
      <div className="course-latest-chat-messages" aria-live="polite">{chatMessages.map((message, index) => <div key={`${message.role}-${index}`} className={`course-latest-chat-message ${message.role}`}>{message.role === "assistant" && <AiMark host={host} />}<p>{message.text}</p></div>)}</div>
    </main>
    <form className="course-latest-chat-form" onSubmit={event => { event.preventDefault(); sendQuestion(chatValue); }}><input aria-label="基于课程提问" placeholder="基于“高等数学”提问" value={chatValue} onChange={event => setChatValue(event.target.value)} /><Button clear type="submit" aria-label="发送" disabled={!chatValue.trim()}><LegacyIcon host={host} name="send" /></Button></form>
  </div>;

  const podcastGenerating = <div className="course-latest-page course-latest-generating" data-testid="podcast-generating">
    <CourseSubpageHeader host={host} title="播客精讲" subtitle={`第${chapterIndex + 1}章 ${activeChapter.title}`} onBack={goHome} />
    <main aria-live="polite"><div className="course-latest-generating-mark"><span>🎧</span><i /><i /><i /></div><h2>正在生成播客…</h2><p>生成大约需要 2–5 分钟，完成后我会通知你。</p><div className="course-latest-generation-progress"><i /></div><Button clear className="course-latest-secondary" onClick={() => openView("podcast-player")}>立即查看演示结果</Button></main>
  </div>;

  const podcastPlayer = <div className="course-latest-page course-latest-player" data-testid="podcast-player">
    <CourseSubpageHeader host={host} title="播客精讲" subtitle={`第${chapterIndex + 1}章 ${activeChapter.title}`} onBack={goHome} />
    <main>
      <section className="course-latest-outline"><div><AiMark host={host} /><h2>课程大纲</h2></div>{["开场：为什么先学极限", "两个基础符号：任意与存在", "从“越来越接近”到严格定义", "极限存在的充要条件"].map((item, index) => <Button clear key={item} onClick={() => setPodcastSeconds([52, 193, 467, 729][index])}><u>{["0:00:52", "0:03:13", "0:07:47", "0:12:09"][index]}</u><span>{item}</span></Button>)}</section>
      <article className="course-latest-script"><h2>讲解文稿</h2><h3>1. 极限到底是什么</h3><p>极限讲的是：当自变量往某个地方靠的时候，函数值往哪儿去。我们关心的是靠近过程中的趋势，不一定关心最后那个点的函数值。</p><h3>2. 极限怎么算</h3><p className={podcastPlaying ? "highlight" : ""}>先看四则运算法则，再识别两个重要极限。等价无穷小只能在乘除中替换，加减中不能直接替换。</p></article>
    </main>
    <div className="course-latest-player-bar"><div className="course-latest-player-progress"><i style={{ width: `${podcastSeconds / (83 * 60 + 11) * 100}%` }} /></div><div><span>{formatTime(podcastSeconds)}</span><span>01:23:11</span></div><Button clear aria-label={podcastPlaying ? "暂停" : "播放"} aria-pressed={podcastPlaying} onClick={() => setPodcastPlaying(value => !value)}><LegacyIcon host={host} name={podcastPlaying ? "pause" : "play"} /></Button></div>
  </div>;

  const review = <div className="course-latest-page course-latest-review">
    <CourseSubpageHeader host={host} title="复习课件" subtitle={`第${chapterIndex + 1}章 ${activeChapter.title}`} onBack={goHome} />
    <main><div className="course-latest-slide-progress"><span>{slideIndex + 1}/{activeChapter.points.length}</span><i><b style={{ width: `${(slideIndex + 1) / activeChapter.points.length * 100}%` }} /></i></div><article className="course-latest-slide"><small>核心知识 · {String(slideIndex + 1).padStart(2, "0")}</small><h2>{activeChapter.points[slideIndex].heading}</h2><p>{activeChapter.points[slideIndex].detail}</p><strong>{activeChapter.points[slideIndex].definition}</strong><div>记住：{activeChapter.points[slideIndex].tip}</div></article><Button clear className="course-latest-source-button" onClick={() => openSource("review")}><LegacyIcon host={host} name="note" />查看课堂原笔记<LegacyIcon host={host} name="right" /></Button></main>
    <div className="course-latest-dual-actions"><Button className="course-latest-secondary" disabled={slideIndex === 0} onClick={() => setSlideIndex(index => Math.max(0, index - 1))}>上一页</Button><Button className="course-latest-primary" onClick={() => slideIndex < activeChapter.points.length - 1 ? setSlideIndex(index => index + 1) : goHome()}>{slideIndex < activeChapter.points.length - 1 ? "下一页" : "完成复习"}</Button></div>
  </div>;

  const sourceNote = <div className="course-latest-page course-latest-source-note" data-testid="course-source-note">
    <CourseSubpageHeader host={host} title="课堂录音" onBack={() => openView(sourceReturn)} />
    <main><header><h1>函数的有界性</h1><p>2026年7月10日 15:10 · AI生成</p></header><section className="course-latest-audio-card"><div><Button clear aria-label={sourceAudioPlaying ? "暂停课堂录音" : "播放课堂录音"} aria-pressed={sourceAudioPlaying} onClick={() => setSourceAudioPlaying(value => !value)}><LegacyIcon host={host} name={sourceAudioPlaying ? "pause" : "play"} /></Button><span><strong>2026年7月10日 15点10分</strong><small>{source?.time ?? "45:38"}</small></span></div><hr /><p><AiMark host={host} /><strong>AI总结</strong><br />本节课讲解函数的有界性、单调性和奇偶性三大特性，重点是有界性。核心在于分清“任意”与“存在”两个量词。</p></section><article className="course-latest-note-copy"><h2>核心知识点</h2><ul><li><b>有界：</b>存在正数 M，使得对定义域中任意 x 都有 |f(x)| ≤ M。</li><li><b>奇偶性：</b>定义域关于原点对称是判断前提。</li><li><b>单调性：</b>比较定义域内 x₁ &lt; x₂ 时函数值的大小。</li><li><b>单调有界准则：</b>单调递增且有上界的数列必收敛。</li></ul><h2>课堂要点</h2><h3>1. 两个基础符号</h3><p>任意（∀）表示“随便取哪一个都成立”；存在（∃）表示“能找到一个就行”。有界定义使用的是“存在一个 M”。</p><h3>2. 有界与无界</h3><p>有界意味着能用一个有限区间框住全部函数值。无界则表示无论给多大的 M，总能找到函数值跑出区间。</p><blockquote>{source?.quote ?? "极限关注靠近时的趋势。函数在这一点有没有定义，是另一个问题。"}</blockquote></article></main>
  </div>;

  const submitInitialAnswer = (event: FormEvent) => { event.preventDefault(); if (interactiveAnswer.trim()) setInteractiveStage("followup"); };
  const submitFollowup = (event: FormEvent) => {
    event.preventDefault();
    if (!followupAnswer.trim()) return;
    onSnapshot(host.markMastered("1-3"));
    setInteractiveStage("mastered");
  };
  const interactive = <div className="course-latest-page course-latest-interactive" data-testid="interactive-learning">
    <CourseSubpageHeader host={host} title="互动问答" subtitle="导数与积分" onBack={goHome} />
    {interactiveStage === "prompt" && <main><div className="course-latest-interactive-progress"><span>1/10</span><i><b style={{ width: "10%" }} /></i></div><section className="course-latest-question-card"><small>用自己的话说出答案</small><h2>洛必达法则的适用条件是什么？</h2><Button clear aria-expanded={referenceOpen} aria-controls="course-reference-answer" onClick={() => setReferenceOpen(value => !value)}>{referenceOpen ? "隐藏参考答案" : "查看参考答案"}</Button>{referenceOpen && <p id="course-reference-answer" className="course-latest-reference">只适用于 0/0 型与 ∞/∞ 型未定式，还要满足邻域内可导、分母导数不为零等条件。</p>}</section><form className="course-latest-answer-form" onSubmit={submitInitialAnswer}><textarea aria-label="初答" placeholder="提交解释或按住说出答案" value={interactiveAnswer} onChange={event => setInteractiveAnswer(event.target.value)} /><Button clear type="button" className="course-latest-example" onClick={() => setInteractiveAnswer("分子分母都趋近于 0，或者都趋近于无穷时，可以对上下同时求导再算极限。")}>使用示例初答</Button><Button className="course-latest-primary" type="submit" disabled={!interactiveAnswer.trim()}>提交初答</Button></form></main>}
    {interactiveStage === "followup" && <main><div className="course-latest-interactive-progress"><span>1/10 · AI追问</span><i><b style={{ width: "10%" }} /></i></div><div className="course-latest-dialog"><div className="user">{interactiveAnswer}</div><div className="assistant"><AiMark host={host} /><p>说对了适用类型。再想一步：如果一个极限算出来是 2/0 这种形式，能用洛必达吗？为什么？</p></div></div><form className="course-latest-answer-form" onSubmit={submitFollowup}><textarea aria-label="第二答" placeholder="回答 AI 的追问" value={followupAnswer} onChange={event => setFollowupAnswer(event.target.value)} /><Button clear type="button" className="course-latest-example" onClick={() => setFollowupAnswer("不能。2/0 不是未定式，不满足洛必达法则的前提，应直接分析左右趋势。")}>使用示例第二答</Button><Button className="course-latest-primary" type="submit" disabled={!followupAnswer.trim()}>提交第二答</Button></form></main>}
    {interactiveStage === "mastered" && <main className="course-latest-mastered" data-testid="interactive-mastered"><div>✓</div><h2>基本掌握</h2><p>你能说出洛必达法则适用的两类未定式，也能识别 2/0 不属于未定式。这个知识点已更新到学习进度。</p><section><span><strong>5</strong>完全掌握</span><span><strong>3</strong>基本掌握</span><span><strong>2</strong>需要加强</span></section><Button className="course-latest-primary" onClick={goHome}>完成</Button></main>}
  </div>;

  const singleOptions = ["f(x) 有上界", "f(x) 有下界", "f(x) 既有上界又有下界", "存在 M > 0 使 f(x) ≤ M"];
  const singleQuiz = <div className="course-latest-page course-latest-quiz" data-testid="quiz-single"><CourseSubpageHeader host={host} title="考题自测" subtitle={`第${chapterIndex + 1}章 ${activeChapter.title}`} onBack={goHome} /><main><div className="course-latest-quiz-progress"><i><b style={{ width: "8.33%" }} /></i><span>1/12</span></div><div className="course-latest-quiz-kind">Q1 · 单选题</div><section><h2>函数 f(x) 有界的充要条件是：</h2><p>选择一项正确答案</p></section><div className="course-latest-options" role="radiogroup" aria-label="单选题选项">{singleOptions.map((option, index) => { const selected = singleAnswer === index; const correct = singleSubmitted && index === 2; const wrong = singleSubmitted && selected && index !== 2; return <Button clear role="radio" aria-checked={selected} key={option} disabled={singleSubmitted} className={`${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`} onClick={() => setSingleAnswer(index)}><span>{"ABCD"[index]}</span>{option}</Button>; })}</div>{singleSubmitted && <p role="status" className={`course-latest-feedback ${singleAnswer === 2 ? "correct" : "wrong"}`}>{singleAnswer === 2 ? "回答正确：有界等价于既有上界又有下界。" : "回答错误，正确答案是 C：既有上界又有下界。"}</p>}</main><div className="course-latest-quiz-actions"><Button className="course-latest-primary" disabled={singleAnswer === null} onClick={() => singleSubmitted ? openView("quiz-boolean") : setSingleSubmitted(true)}>{singleSubmitted ? "下一题" : "提交答案"}</Button></div></div>;

  const booleanQuiz = <div className="course-latest-page course-latest-quiz" data-testid="quiz-boolean"><CourseSubpageHeader host={host} title="考题自测" subtitle={`第${chapterIndex + 1}章 ${activeChapter.title}`} onBack={goHome} /><main><div className="course-latest-quiz-progress"><i><b style={{ width: "33.33%" }} /></i><span>4/12</span></div><div className="course-latest-quiz-kind">Q4 · 判断题</div><section><h2>“对任意正数 M，无论定得多大，都存在 x₁ 使 |f(x₁)| &gt; M”——这是无界函数的定义。</h2><p>判断上面的说法是否正确</p></section><div className="course-latest-options" role="radiogroup" aria-label="判断题选项">{[{ label: "正确", value: true }, { label: "错误", value: false }].map(option => { const selected = booleanAnswer === option.value; const correct = booleanSubmitted && option.value; const wrong = booleanSubmitted && selected && !option.value; return <Button clear role="radio" aria-checked={selected} key={option.label} disabled={booleanSubmitted} className={`${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`} onClick={() => setBooleanAnswer(option.value)}>{option.label}</Button>; })}</div>{booleanSubmitted && <p role="status" className={`course-latest-feedback ${booleanAnswer ? "correct" : "wrong"}`}>{booleanAnswer ? "正确！这正是无界函数的定义。" : "再想想：它表达的是任何有限区间都框不住函数值。"}</p>}</main><div className="course-latest-quiz-actions dual"><Button className="course-latest-secondary" onClick={() => openView("quiz-single")}>上一题</Button><Button className="course-latest-primary" disabled={booleanAnswer === null} onClick={() => booleanSubmitted ? openView("quiz-calculation") : setBooleanSubmitted(true)}>{booleanSubmitted ? "下一题" : "提交答案"}</Button></div></div>;

  const calculationQuiz = <div className="course-latest-page course-latest-quiz course-latest-calculation" data-testid="quiz-calculation"><CourseSubpageHeader host={host} title="考题自测" subtitle={`第${chapterIndex + 1}章 ${activeChapter.title}`} onBack={goHome} /><main><div className="course-latest-quiz-progress"><i><b style={{ width: "66.67%" }} /></i><span>8/12</span></div><div className="course-latest-quiz-kind">Q8 · 计算题</div><section><h2>设 f(x) = −1/x（x ≥ 1），证明 f(x) 有界，并求一个满足条件的 M 值。</h2><p>完成推导后提交，或直接查看完整解题步骤</p></section><textarea aria-label="计算题答案" placeholder="写下你的推导…" value={calculationAnswer} onChange={event => setCalculationAnswer(event.target.value)} />{calculationSubmitted && <p role="status" className="course-latest-feedback correct">已提交。关键是利用 x ≥ 1 得到 0 &lt; 1/x ≤ 1。</p>}<Button clear className="course-latest-steps-toggle" aria-expanded={stepsOpen} aria-controls="course-calculation-steps" onClick={() => setStepsOpen(value => !value)}>{stepsOpen ? "收起解题步骤" : "查看解题步骤"}<LegacyIcon host={host} name={stepsOpen ? "up" : "down"} /></Button>{stepsOpen && <article id="course-calculation-steps" className="course-latest-steps"><p><b>Step 1</b>　因为 x ≥ 1，所以 0 &lt; 1/x ≤ 1。</p><p><b>Step 2</b>　f(x)=−1/x，因此 |f(x)|=1/x≤1。</p><p><b>结论</b>　存在 M=1，使定义域内任意 x 都满足 |f(x)|≤M，所以 f(x) 有界。</p></article>}</main><div className="course-latest-quiz-actions dual"><Button className="course-latest-secondary" onClick={() => openView("quiz-boolean")}>上一题</Button><Button className="course-latest-primary" disabled={!calculationSubmitted && !calculationAnswer.trim() && !stepsOpen} onClick={() => calculationSubmitted ? openView("quiz-complete") : setCalculationSubmitted(true)}>{calculationSubmitted ? "下一题" : "提交答案"}</Button></div></div>;

  const quizComplete = <div className="course-latest-page course-latest-quiz-complete"><CourseSubpageHeader host={host} title="考题自测" onBack={goHome} /><main><div>🎉</div><h2>本轮练习完成</h2><p>已体验单选、判断和计算三种题型。单选正确答案为 C，计算题定义域为 x ≥ 1。</p><Button className="course-latest-primary" onClick={goHome}>返回课程</Button></main></div>;

  const currentView = {
    home,
    knowledge,
    chat,
    "podcast-generating": podcastGenerating,
    "podcast-player": podcastPlayer,
    review,
    "source-note": sourceNote,
    interactive,
    "quiz-single": singleQuiz,
    "quiz-boolean": booleanQuiz,
    "quiz-calculation": calculationQuiz,
    "quiz-complete": quizComplete
  }[view];

  return <div className="konsta-scene" data-konsta-scene="course">
    {currentView}
    {view === "home" && <FooterPortal host={host} onAdd={() => setSheet("compose")} onAsk={() => openView("chat")} />}
    {sheet === "chapters" && <ChapterDrawer host={host} chapters={chapters} current={chapterIndex} query={chapterQuery} onQuery={setChapterQuery} onChoose={chooseChapter} onClose={() => setSheet(null)} />}
    {sheet === "compose" && <CourseComposer host={host} onClose={() => setSheet(null)} onSaved={onSnapshot} />}
  </div>;
}
