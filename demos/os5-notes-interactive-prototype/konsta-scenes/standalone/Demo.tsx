"use client";
import { useState, type CSSProperties } from "react";
import { App, Button, Sheet, Tabbar, TabbarLink } from "konsta/react";
import {
  Signal, Wifi, Check, Sparkles, MoreVertical, Plus, ArrowLeft, FileText, ChevronRight,
  X, CalendarDays, Clock3, Car, TrainFront, Bell, MapPin, Utensils, Stethoscope, Luggage,
  Compass, UserRound, Info,
} from "./icons";

type Ctrl =
  | { kind: "after"; text: string }
  | { kind: "tag"; text: string }
  | { kind: "cta"; text: string; toast: string }
  | { kind: "toggle" };
type PlanRow = { icon: "clock" | "car" | "bell" | "pin" | "train" | "cal"; tone: string; title: string; sub?: string; ctrl: Ctrl };
type Scene = {
  key: string; symbol: "dine" | "med" | "train"; tone: "" | "tone-blue" | "tone-green";
  when: string; title: string; where: string; preview: string[];
  say: string; aiText: string; plan: PlanRow[]; bring?: string[]; notdo: string;
};

const TONE: Record<string, [string, string]> = {
  amber: ["#a97f16", "#fff1c6"], blue: ["#5979b0", "#edf3fe"], green: ["#5e8c74", "#eaf3ee"],
  violet: ["#7e6d99", "#efeafa"], rose: ["#b5705a", "#fbe9e3"],
};
function tileStyle(t: string): CSSProperties { const [c, b] = TONE[t]; return { color: c, background: b }; }
const PlanIcon = { clock: Clock3, car: Car, bell: Bell, pin: MapPin, train: TrainFront, cal: CalendarDays };
const SymbolIcon = { dine: Utensils, med: Stethoscope, train: TrainFront };

const SCENES: Scene[] = [
  {
    key: "吃饭", symbol: "dine", tone: "", when: "今晚 19:00", title: "和小敏吃饭", where: "三里屯 · 比目鱼火锅",
    preview: ["18:20 出发 · 晚高峰", "打车约 ¥32 · 到点提醒"],
    say: "今晚 7 点和小敏在三里屯吃饭",
    aiText: "记好了今晚的饭局。按晚高峰帮你算了出发时间，到点会提醒你，打车也可以一键叫。",
    plan: [
      { icon: "clock", tone: "amber", title: "18:20 出发最稳", sub: "晚高峰，路上约 25 分钟", ctrl: { kind: "after", text: "25 分钟" } },
      { icon: "car", tone: "blue", title: "打车去三里屯", sub: "预计 ¥32 · 快车", ctrl: { kind: "cta", text: "叫车", toast: "已为你叫车 · 预计 3 分钟到" } },
      { icon: "bell", tone: "amber", title: "18:10 提醒你出发", sub: "提前 10 分钟", ctrl: { kind: "toggle" } },
      { icon: "pin", tone: "green", title: "到店导航", sub: "比目鱼火锅 · 可帮你订位", ctrl: { kind: "tag", text: "可选" } },
    ],
    notdo: "不做：不给你推荐「三里屯还有什么好玩的」——只把吃饭这件事办利索。",
  },
  {
    key: "看病", symbol: "med", tone: "tone-blue", when: "明天 09:30", title: "带宝宝看儿科", where: "市儿童医院 · 门诊 3 楼",
    preview: ["08:30 出发 · 已挂号", "4 样别忘带 · 出门前提醒"],
    say: "明天上午带宝宝去儿童医院看医生",
    aiText: "按挂号时间帮你倒推了出发。就医最容易忘的证件和资料我都列好了，出门前会提醒你核对一遍。",
    plan: [
      { icon: "clock", tone: "blue", title: "08:30 出发", sub: "早高峰，路上约 35 分钟", ctrl: { kind: "after", text: "35 分钟" } },
      { icon: "car", tone: "blue", title: "打车去儿童医院", sub: "预计 ¥45 · 快车", ctrl: { kind: "cta", text: "叫车", toast: "已为你叫车 · 预计 4 分钟到" } },
      { icon: "bell", tone: "amber", title: "08:20 提醒出发", sub: "并提醒核对要带的东西", ctrl: { kind: "toggle" } },
      { icon: "pin", tone: "green", title: "到院导航到门诊 3 楼", sub: "可在线取号排队", ctrl: { kind: "tag", text: "可选" } },
    ],
    bring: ["宝宝社保卡 / 就诊卡", "病历本 + 之前的检查单", "退烧药 / 常用药", "水杯、备用尿不湿"],
    notdo: "不做：不推荐「医院周边吃喝玩」——只保顺利看上病。",
  },
  {
    key: "回老家", symbol: "train", tone: "tone-green", when: "周五 18:00", title: "回老家 · 带东西", where: "G1234 高铁 · 两次提醒",
    preview: ["周五 18:00 高铁 G1234", "4 样要带 · 两次提醒"],
    say: "周五回老家，别忘了提醒我带东西",
    aiText: "周五回老家的车票已经在你日程里了。要带的东西帮你列好，出发前一晚和出门前各提醒你一次。",
    plan: [
      { icon: "train", tone: "blue", title: "周五 18:00 高铁 G1234", sub: "北京南 → 济南西", ctrl: { kind: "tag", text: "已入日程" } },
      { icon: "bell", tone: "amber", title: "周四 21:00 提醒收拾", sub: "照清单先装进包里", ctrl: { kind: "toggle" } },
      { icon: "bell", tone: "amber", title: "周五出门前再提醒一次", sub: "核对一遍别落下", ctrl: { kind: "after", text: "出门前" } },
    ],
    bring: ["给爸妈买的茶叶", "常用药", "充电器 / 充电宝", "老家要用的证件"],
    notdo: "不做：不扩成「老家周边游玩推荐」——就把带东西这件事办好。",
  },
];

function keyToIdx(t: string) {
  if (/医院|宝宝|看病|儿科|娃|挂号/.test(t)) return 1;
  if (/老家|回家|带东西|探亲|高铁/.test(t)) return 2;
  return 0;
}

export function Demo() {
  const initHash = typeof window !== "undefined" ? window.location.hash : "";
  const dm = initHash.match(/^#d([0-2])/);
  const [view, setView] = useState<"home" | "detail">(dm ? "detail" : "home");
  const [idx, setIdx] = useState(dm ? Number(dm[1]) : 0);
  const [composeOpen, setComposeOpen] = useState(initHash === "#compose");
  const [askOpen, setAskOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [remind, setRemind] = useState<Record<string, boolean>>({});
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState("");
  const [askActive, setAskActive] = useState<number | null>(null);

  const s = SCENES[idx];
  const notify = (t: string) => { setToast(t); window.setTimeout(() => setToast(""), 2600); };
  const openDetail = (i: number) => { setIdx(i); setAskActive(null); setView("detail"); };
  const rk = (i: number, r: number) => i + ":" + r;
  const isOn = (i: number, r: number) => remind[rk(i, r)] ?? true;
  const ck = (i: number, b: number) => i + "#" + b;
  const isChk = (i: number, b: number) => checks[ck(i, b)] ?? false;

  const statusBar = (
    <div className="status-bar" aria-hidden="true"><span>11:45</span>
      <div className="status-right"><small>5G</small><Signal size={15} /><Wifi size={16} /><span className="battery">92</span></div>
    </div>
  );

  return (
    <App theme="material" dark={false} safeAreas={false} className="notes-os">
      <div className="phone">
        {statusBar}
        <div className="app-surface">

          {/* ---------------- HOME ---------------- */}
          <main className="screen collections-screen" hidden={view !== "home"} aria-label="出行首页">
            <div className="top-actions"><Button clear className="icon-button" aria-label="更多"><MoreVertical size={23} /></Button></div>
            <h1 className="page-title">出行</h1>
            <button className="say-bar" onClick={() => { setDraft(""); setComposeOpen(true); }}>
              <Sparkles size={19} /><span>说一句，帮你安排出门…</span>
            </button>

            <section className="collection-section" aria-label="小爱发现">
              <div className="pending-stack" style={{ padding: "0 2px", margin: "2px 0 8px" }}>
                <div className="pending-card">
                  <span className="small-eyebrow"><Sparkles size={13} />小爱发现</span>
                  <h3>周五要回老家，帮你建好了出行安排</h3>
                  <p>看到你周五的高铁票（G1234），要带的东西也一起列好了，出发前会提醒你。</p>
                  <div className="pending-actions">
                    <Button clear onClick={() => notify("已收起，安排仍保留在列表里")}>先收起</Button>
                    <Button className="small-primary" onClick={() => openDetail(2)}>查看安排</Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="collection-section" aria-labelledby="h-next">
              <div className="section-heading"><h2 id="h-next">接下来要出门</h2></div>
              <div className="horizontal collection-rail outing-rail">
                {SCENES.map((x, i) => {
                  const Icon = SymbolIcon[x.symbol];
                  return (
                    <button key={x.key} className={"collection-card schedule-card " + x.tone} onClick={() => openDetail(i)} aria-label={"打开" + x.title}>
                      <div className="collection-card-top"><span className="collection-symbol"><Icon size={20} /></span><span className="card-small">{x.when}</span></div>
                      <h3>{x.title}</h3>
                      <div className="task-preview">
                        <div><span className="task-dot active" /><span>{x.preview[0]}</span></div>
                        <div><span className="task-dot" /><span>{x.preview[1]}</span></div>
                        <div><span className="task-dot" /><span>{x.where}</span></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <p className="notes-total">说一句话，出门的时间、路线、提醒和要带的东西，小爱帮你安排好</p>
            <Button className="new-note-button" aria-label="说一句" onClick={() => { setDraft(""); setComposeOpen(true); }}><Plus size={27} /></Button>
            <Tabbar icons labels className="bottom-tabs" innerClassName="bottom-inner">
              <TabbarLink component="button" active className="tab-selected" icon={<Compass size={25} />} label="出行" />
              <TabbarLink component="button" icon={<UserRound size={25} />} label="我的" />
            </Tabbar>
          </main>

          {/* ---------------- DETAIL ---------------- */}
          {view === "detail" && (
            <section className="experience-page experience-schedule" aria-label={s.title + "详情"}>
              <header className="detail-nav experience-nav">
                <Button clear className="icon-button" aria-label="返回" onClick={() => setView("home")}><ArrowLeft size={23} /></Button>
                <span className="experience-category">日常出行</span>
                <Button clear className="icon-button" aria-label="原始记录" onClick={() => notify("这条安排来自你说的一句话")}><FileText size={21} /></Button>
              </header>
              <main className="experience-body">
                <div className="experience-heading"><h1>{s.title}</h1></div>
                <p className="detail-subtitle">{s.when} · {s.where}</p>

                <div className="assistant-message">
                  <span className="small-eyebrow"><Sparkles size={14} />小爱已安排</span>
                  <p>{s.aiText}</p>
                </div>

                <div className="detail-section-title"><h2>怎么安排</h2><span className="section-note">{s.plan.length} 步</span></div>
                <div className="surface plan-list">
                  {s.plan.map((r, ri) => {
                    const Icon = PlanIcon[r.icon];
                    return (
                      <div className="plan-row" key={ri}>
                        <span className="plan-ic" style={tileStyle(r.tone)}><Icon size={19} /></span>
                        <span className="pc"><strong>{r.title}</strong>{r.sub && <span>{r.sub}</span>}</span>
                        {r.ctrl.kind === "after" && <span className="plan-after">{r.ctrl.text}</span>}
                        {r.ctrl.kind === "tag" && <span className="plan-tag">{r.ctrl.text}</span>}
                        {r.ctrl.kind === "cta" && <Button className="plan-cta" onClick={() => notify((r.ctrl as { toast: string }).toast)}>{r.ctrl.text}</Button>}
                        {r.ctrl.kind === "toggle" && (
                          <button
                            className={"task-check " + (isOn(idx, ri) ? "is-done" : "")}
                            aria-pressed={isOn(idx, ri)} aria-label="提醒开关"
                            onClick={() => setRemind((m) => ({ ...m, [rk(idx, ri)]: !isOn(idx, ri) }))}
                          >{isOn(idx, ri) && <Bell size={15} />}</button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {s.bring && (
                  <>
                    <div className="detail-section-title"><h2>别忘带</h2><span className="section-note">点一下勾掉</span></div>
                    <div className="surface task-list">
                      {s.bring.map((b, bi) => (
                        <div className={"task-row " + (isChk(idx, bi) ? "task-completed" : "")} key={bi}>
                          <button className={"task-check " + (isChk(idx, bi) ? "is-done" : "")} aria-pressed={isChk(idx, bi)} aria-label={"勾掉：" + b}
                            onClick={() => setChecks((m) => ({ ...m, [ck(idx, bi)]: !isChk(idx, bi) }))}>{isChk(idx, bi) && <Check size={17} />}</button>
                          <button className="task-content" onClick={() => setChecks((m) => ({ ...m, [ck(idx, bi)]: !isChk(idx, bi) }))}><strong>{b}</strong></button>
                        </div>
                      ))}
                    </div>
                    <p className="bring-tip">出门前我会提醒你把没勾的再核对一遍。</p>
                  </>
                )}

                <div className="not-do"><Info size={14} />{s.notdo}</div>
              </main>
              <div className="experience-footer">
                <Button clear className="footer-add" onClick={() => notify("可以补充一条，比如再带点什么")}><Plus size={18} />补充一条</Button>
                <Button className="ask-button" onClick={() => { setAskActive(null); setAskOpen(true); }}><Sparkles size={17} />问一问</Button>
              </div>
            </section>
          )}
        </div>

        <div className="home-bar" />
        {toast && <div className="notice-toast" role="status"><Check size={16} />{toast}</div>}

        {/* compose */}
        {composeOpen && <>
          <button className="sheet-backdrop" aria-label="关闭" onClick={() => setComposeOpen(false)} />
          <Sheet opened backdrop={false} className="notes-sheet" role="dialog" aria-modal="true">
            <div><div className="sheet-handle" />
              <header className="sheet-header"><h2>说一句</h2><Button clear className="icon-button" aria-label="关闭" onClick={() => setComposeOpen(false)}><X size={21} /></Button></header>
              <form className="create-form" onSubmit={(e) => { e.preventDefault(); if (!draft.trim()) return; const i = keyToIdx(draft); setComposeOpen(false); openDetail(i); notify("已为你安排好 · 到点会提醒你"); }}>
                <p className="demo-caption" style={{ margin: "0 0 2px" }}>想去做什么？说一句话，小爱帮你把出门这件事安排好。</p>
                <textarea aria-label="说一句" placeholder="例如：明天上午带宝宝去医院看医生" maxLength={200} value={draft} onChange={(e) => setDraft(e.target.value)} />
                <div className="say-sheet-chips">
                  {SCENES.map((x) => <Button key={x.key} clear className="say-chip" onClick={() => setDraft(x.say)}>{x.say}</Button>)}
                </div>
                <Button className="primary-button" type="submit" disabled={!draft.trim()}>让小爱安排</Button>
              </form>
            </div>
          </Sheet>
        </>}

        {/* ask */}
        {askOpen && <>
          <button className="sheet-backdrop" aria-label="关闭" onClick={() => setAskOpen(false)} />
          <Sheet opened backdrop={false} className="notes-sheet" role="dialog" aria-modal="true">
            <div><div className="sheet-handle" />
              <header className="sheet-header"><h2>问一问</h2><Button clear className="icon-button" aria-label="关闭" onClick={() => setAskOpen(false)}><X size={21} /></Button></header>
              <p className="subtle-copy">关于「{s.title}」· 示例问答</p>
              <div className="ask-questions">
                {["会不会迟到？要几点出门？", "有什么要提前准备的？"].map((q, i) => (
                  <Button key={q} clear className={askActive === i ? "question-choice active" : "question-choice"} onClick={() => setAskActive(i)}>{q}<ChevronRight size={16} /></Button>
                ))}
              </div>
              {askActive !== null && <div className="answer-block" role="status"><Sparkles size={18} /><p>{askActive === 0
                ? "按现在的路况，" + s.plan[0].title + "就不会迟到；我已经设了到点提醒，出发前会叫你。"
                : (s.bring ? "要带的东西我列了 " + s.bring.length + " 样：" + s.bring.join("、") + "。出门前会提醒你核对。" : "出发时间、打车和到点提醒都准备好了，到点跟着提醒走就行。")}</p></div>}
            </div>
          </Sheet>
        </>}
      </div>
    </App>
  );
}
