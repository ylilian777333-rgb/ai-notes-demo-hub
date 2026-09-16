import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "konsta/react";
import type { HostBridge, SceneSnapshot } from "./types";
import { LegacyIcon, PageTitle } from "./shared";
import "./cards-scene.css";

type CredentialRecord = {
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

type CardsSnapshot = SceneSnapshot & {
  credentials: CredentialRecord[];
};

type CredentialKind = "identity" | "wifi" | "invoice" | "driver" | "other";
type MainView = "list" | "detail" | "assistant" | "booking";
type AssistantStage = "listening" | "result";
type BookingStage = "flights" | "consent" | "denied" | "allowed" | "order" | "complete";
type SafeCredential = {
  id: string;
  kind: CredentialKind;
  title: string;
  name: string;
  label: string;
  secretLabel: string;
  mask: string;
  demoValue: string;
  category: string;
  palette: "blue" | "yellow" | "green" | "gray";
  icon: string;
  searchText: string;
};

const DEMO_CREDENTIALS: CredentialRecord[] = [
  {
    id: "demo-identity",
    title: "居民身份证",
    name: "演示用户 A",
    label: "身份卡证",
    secretLabel: "证件号码",
    mask: "DEMO-ID-****-0001",
    value: "DEMO-ID-0000-0001",
    category: "身份",
    style: "blue",
    icon: "person",
  },
  {
    id: "demo-passport",
    title: "护照",
    name: "演示用户 A",
    label: "出行卡证",
    secretLabel: "护照号码",
    mask: "DEMO-P-****-0002",
    value: "DEMO-PASSPORT-0002",
    category: "出行",
    style: "purple",
    icon: "globe",
  },
  {
    id: "demo-driver",
    title: "驾驶证",
    name: "演示用户 A",
    label: "车辆卡证",
    secretLabel: "证件号码",
    mask: "DEMO-DL-****-0003",
    value: "DEMO-DRIVER-0003",
    category: "车辆",
    style: "orange",
    icon: "steering",
  },
  {
    id: "demo-receipt",
    title: "电子票据",
    name: "演示票据",
    label: "消费凭证",
    secretLabel: "票据号码",
    mask: "DEMO-RCPT-****-0004",
    value: "DEMO-RECEIPT-0004",
    category: "票据",
    style: "gray",
    icon: "receipt",
  },
];

const KNOWN_ICONS = new Set(["person", "globe", "receipt", "steering", "note"]);

function getCredentialKind(record: CredentialRecord): CredentialKind {
  const text = `${record.title} ${record.category} ${record.label}`.toLowerCase();
  if (/身份证|identity|id card/.test(text)) return "identity";
  if (/wifi|wi-fi|卡密|密码/.test(text)) return "wifi";
  if (/发票|抬头|invoice|receipt/.test(text)) return "invoice";
  if (/驾驶|driver|licen[cs]e/.test(text)) return "driver";
  return "other";
}

function safePalette(style: string, kind: CredentialKind): SafeCredential["palette"] {
  const normalized = style.toLowerCase();
  if (normalized.includes("wifi")) return "yellow";
  if (normalized.includes("license")) return "green";
  if (normalized.includes("invoice")) return "gray";
  if (kind === "wifi") return "yellow";
  if (kind === "driver") return "green";
  if (kind === "invoice" || kind === "other") return "gray";
  return "blue";
}

function safeCredential(record: CredentialRecord, index: number): SafeCredential {
  const kind = getCredentialKind(record);
  const sequence = String(index + 1).padStart(4, "0");
  const configs: Record<CredentialKind, Pick<SafeCredential, "title" | "label" | "secretLabel" | "category" | "icon"> & { prefix: string }> = {
    identity: { title: index === 0 ? "演示用户 A 的身份证" : "演示用户 B 身份证", label: "姓名", secretLabel: "号码", category: "身份证", icon: "person", prefix: "ID" },
    wifi: { title: "我家的 Wi-Fi", label: "名称", secretLabel: "密码", category: "卡密", icon: "globe", prefix: "WIFI" },
    invoice: { title: "公司发票抬头", label: "抬头", secretLabel: "税号", category: "发票抬头", icon: "receipt", prefix: "INVOICE" },
    driver: { title: "驾驶证", label: "姓名", secretLabel: "号码", category: "驾驶证", icon: "steering", prefix: "DRIVER" },
    other: { title: "其他卡证", label: "名称", secretLabel: "号码", category: "其他", icon: "note", prefix: "CARD" },
  };
  const config = configs[kind];
  return {
    id: `${kind}-${index + 1}`,
    kind,
    title: config.title,
    name: kind === "wifi" ? "A08-1211" : kind === "invoice" ? "演示科技有限公司" : kind === "identity" && index > 0 ? "演示用户 B" : "演示用户 A",
    label: config.label,
    secretLabel: config.secretLabel,
    mask: `DEMO-${config.prefix}-••••-${sequence}`,
    demoValue: `DEMO-${config.prefix}-0000-${sequence}`,
    category: config.category,
    palette: safePalette(record.style, kind),
    icon: KNOWN_ICONS.has(record.icon) ? record.icon : config.icon,
    searchText: [record.title, record.name, record.label, record.secretLabel, record.category, config.title, config.category]
      .join(" ")
      .toLowerCase(),
  };
}

export function CardsScene({ host, snapshot }: { host: HostBridge; snapshot: CardsSnapshot }) {
  const credentials = useMemo(() => {
    const source = snapshot.credentials?.length ? snapshot.credentials : DEMO_CREDENTIALS;
    const safe = source.map(safeCredential);
    if (safe.some((credential) => credential.kind === "identity")) return safe;
    return [safeCredential(DEMO_CREDENTIALS[0], safe.length), ...safe];
  }, [snapshot.credentials]);
  const identityCredential = credentials.find((credential) => credential.kind === "identity") ?? credentials[0];

  const entryCredentialId = snapshot.entry?.credentialId;
  const initialCredentialId = entryCredentialId && credentials.some((credential) => credential.id === entryCredentialId) ? entryCredentialId : identityCredential.id;
  const [view, setView] = useState<MainView>(entryCredentialId ? "detail" : "list");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialCredentialId);
  const listScrollRef = useRef(0);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());
  const [assistantStage, setAssistantStage] = useState<AssistantStage>("listening");
  const [assistantRevealed, setAssistantRevealed] = useState(false);
  const [assistantFilled, setAssistantFilled] = useState(false);
  const [bookingStage, setBookingStage] = useState<BookingStage>("flights");

  const selectedCredential = credentials.find((credential) => credential.id === selectedId) ?? identityCredential;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCredentials = credentials.filter((credential) => !normalizedQuery || credential.searchText.includes(normalizedQuery));

  useEffect(() => {
    const restoreMasks = () => {
      if (document.visibilityState === "hidden") {
        setRevealedIds(new Set());
        setAssistantRevealed(false);
      }
    };
    document.addEventListener("visibilitychange", restoreMasks);
    return () => document.removeEventListener("visibilitychange", restoreMasks);
  }, []);

  const toggleReveal = (id: string) => {
    setRevealedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyDemoValue = async (credential: SafeCredential) => {
    try {
      await navigator.clipboard?.writeText(credential.demoValue);
      host.toast("已复制虚构 DEMO 号码");
    } catch {
      host.toast("复制不可用，仍保持 DEMO 数据展示");
    }
  };

  const openChildView = (next: MainView) => {
    if (view === "list") listScrollRef.current = document.getElementById("app")?.scrollTop ?? 0;
    setView(next);
    requestAnimationFrame(() => document.getElementById("app")?.scrollTo({ top: 0, behavior: "auto" }));
  };
  const openDetail = (credential: SafeCredential) => {
    setSelectedId(credential.id);
    openChildView("detail");
  };

  const openAssistant = () => {
    setAssistantStage("listening");
    setAssistantRevealed(false);
    setAssistantFilled(false);
    openChildView("assistant");
  };

  const openBooking = () => {
    setBookingStage("flights");
    openChildView("booking");
  };

  const goBack = () => {
    setAssistantRevealed(false);
    if (view === "list") {
      host.back();
      return;
    }
    if (view === "assistant" && assistantStage === "result") {
      setAssistantStage("listening");
      return;
    }
    if (view === "booking" && bookingStage !== "flights") {
      setBookingStage("flights");
      return;
    }
    setView("list");
    requestAnimationFrame(() => document.getElementById("app")?.scrollTo({ top: listScrollRef.current, behavior: "auto" }));
  };

  const viewTitle: Record<MainView, string> = {
    list: "卡证票据",
    detail: "卡证详情",
    assistant: "小爱查询证件",
    booking: "小爱订机票",
  };

  return (
    <div className="konsta-scene cards-latest-root" data-konsta-scene="cards">
      <main className="cards-latest-page" data-view={view}>
        <header className="cards-latest-topbar">
          <Button clear className="cards-latest-icon-button" aria-label="返回" onClick={goBack}>
            <LegacyIcon host={host} name="back" />
          </Button>
          {view === "list" ? <span aria-hidden="true" /> : <strong>{viewTitle[view]}</strong>}
          <Button clear className="cards-latest-icon-button" aria-label="卡证来源" onClick={() => host.toast("卡证均来自虚构演示笔记")}>
            <LegacyIcon host={host} name="note" />
          </Button>
        </header>

        {view === "list" && (
          <>
            <div className="cards-latest-heading">
              <PageTitle title="卡证票据" meta="" />
              <span className="cards-latest-privacy-pill">默认掩码保护</span>
            </div>

            <section className="cards-latest-entry-grid" aria-label="演示场景入口">
              <Button clear className="cards-latest-entry cards-latest-entry-assistant" data-testid="card-assistant-entry" onClick={openAssistant}>
                <span className="cards-latest-entry-icon"><LegacyIcon host={host} name="search" /></span>
                <span><strong>小爱查询证件</strong><small>说一句，快速找到</small></span>
                <LegacyIcon host={host} name="right" />
              </Button>
              <Button clear className="cards-latest-entry cards-latest-entry-booking" data-testid="card-booking-entry" onClick={openBooking}>
                <span className="cards-latest-entry-icon"><LegacyIcon host={host} name="send" /></span>
                <span><strong>模拟订机票</strong><small>授权与订单演示</small></span>
                <LegacyIcon host={host} name="right" />
              </Button>
            </section>

            <label className="cards-latest-search">
              <span className="cards-latest-sr-only">搜索卡证票据</span>
              <LegacyIcon host={host} name="search" />
              <input
                data-testid="card-search"
                type="search"
                value={query}
                placeholder="搜索"
                autoComplete="off"
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && <button type="button" aria-label="清空搜索" onClick={() => setQuery("")}>×</button>}
            </label>

            <div className="cards-latest-list" aria-live="polite">
              {filteredCredentials.map((credential) => {
                const revealed = revealedIds.has(credential.id);
                return (
                  <article
                    key={credential.id}
                    className={`cards-latest-card cards-latest-card-${credential.palette}`}
                    data-testid={`card-row-${credential.id}`}
                  >
                    <button type="button" className="cards-latest-card-main" onClick={() => openDetail(credential)}>
                      <span className="cards-latest-card-icon"><LegacyIcon host={host} name={credential.icon} /></span>
                      <span className="cards-latest-card-copy">
                        <strong>{credential.title}</strong>
                        <span>{credential.label}：{credential.name}</span>
                      </span>
                      <span className="cards-latest-card-chevron"><LegacyIcon host={host} name="right" /></span>
                    </button>
                    <div className="cards-latest-secret-row">
                      <span><small>{credential.secretLabel}</small><b>{revealed ? credential.demoValue : credential.mask}</b></span>
                      <Button
                        clear
                        className="cards-latest-reveal"
                        data-testid={`card-reveal-${credential.id}`}
                        aria-label={`${revealed ? "隐藏" : "显示"}${credential.title}演示号码`}
                        aria-pressed={revealed}
                        onClick={() => toggleReveal(credential.id)}
                      >
                        <LegacyIcon host={host} name={revealed ? "eyeoff" : "eye"} />
                      </Button>
                    </div>
                  </article>
                );
              })}
              {!filteredCredentials.length && (
                <div className="cards-latest-empty">
                  <LegacyIcon host={host} name="search" />
                  <strong>没有找到相关卡证</strong>
                  <span>换个关键词试试</span>
                </div>
              )}
            </div>
          </>
        )}

        {view === "detail" && (
          <section className="cards-latest-detail" data-testid="card-detail">
            <div className={`cards-latest-detail-card cards-latest-card-${selectedCredential.palette}`}>
              <div className="cards-latest-detail-brand">
                <span><LegacyIcon host={host} name={selectedCredential.icon} /></span>
                <small>DEMO CREDENTIAL</small>
              </div>
              <h1>{selectedCredential.title}</h1>
              <p>{selectedCredential.name}</p>
              <div className="cards-latest-detail-number">
                <span><small>{selectedCredential.secretLabel}</small><b>{revealedIds.has(selectedCredential.id) ? selectedCredential.demoValue : selectedCredential.mask}</b></span>
                <Button
                  clear
                  className="cards-latest-detail-action"
                  data-testid={`card-reveal-${selectedCredential.id}`}
                  aria-label={revealedIds.has(selectedCredential.id) ? "隐藏演示号码" : "显示演示号码"}
                  onClick={() => toggleReveal(selectedCredential.id)}
                >
                  <LegacyIcon host={host} name={revealedIds.has(selectedCredential.id) ? "eyeoff" : "eye"} />
                </Button>
              </div>
            </div>
            <div className="cards-latest-detail-info">
              <div><span>持有人</span><strong>{selectedCredential.name}</strong></div>
              <div><span>数据性质</span><strong>虚构 DEMO 数据</strong></div>
              <div><span>隐私状态</span><strong>离开页面自动恢复掩码</strong></div>
            </div>
            <Button className="cards-latest-primary" onClick={() => void copyDemoValue(selectedCredential)}>
              <LegacyIcon host={host} name="copy" />复制演示号码
            </Button>
            <p className="cards-latest-safe-note">本页不读取或展示任何真实姓名、证件号、地址或出生日期。</p>
          </section>
        )}

        {view === "assistant" && (
          <section className="cards-latest-assistant">
            <div className="cards-latest-assistant-orb" aria-hidden="true">
              <span /><span /><span />
            </div>
            {assistantStage === "listening" ? (
              <div className="cards-latest-listening">
                <h1>我在听...</h1>
                <p>试试说“查询我的身份证号码”</p>
                <Button className="cards-latest-primary" onClick={() => setAssistantStage("result")}>
                  查询演示身份证
                </Button>
                <small>仅在本地演示，不会访问真实卡证</small>
              </div>
            ) : (
              <div className="cards-latest-assistant-result" data-testid="assistant-result">
                <div className="cards-latest-chat-query">查询我的身份证号码</div>
                <div className="cards-latest-result-card">
                  <div className="cards-latest-result-heading">
                    <span><LegacyIcon host={host} name="person" /></span>
                    <div><small>已找到 1 张</small><strong>居民身份证</strong></div>
                  </div>
                  <p>演示用户 A</p>
                  <div className="cards-latest-result-number">
                    <b>{assistantRevealed ? identityCredential.demoValue : identityCredential.mask}</b>
                    <Button clear aria-label={assistantRevealed ? "隐藏演示号码" : "显示演示号码"} onClick={() => setAssistantRevealed((value) => !value)}>
                      <LegacyIcon host={host} name={assistantRevealed ? "eyeoff" : "eye"} />
                    </Button>
                    <Button clear aria-label="复制演示号码" onClick={() => void copyDemoValue(identityCredential)}>
                      <LegacyIcon host={host} name="copy" />
                    </Button>
                  </div>
                  <Button
                    className={`cards-latest-primary ${assistantFilled ? "cards-latest-primary-done" : ""}`}
                    disabled={assistantFilled}
                    onClick={() => {
                      setAssistantFilled(true);
                      setAssistantRevealed(false);
                      host.toast("已填入虚构 DEMO 证件");
                    }}
                  >
                    {assistantFilled ? "已填入演示" : "填入演示"}
                  </Button>
                </div>
                {assistantFilled && (
                  <Button clear className="cards-latest-next-link" onClick={openBooking}>
                    继续体验模拟订机票<LegacyIcon host={host} name="right" />
                  </Button>
                )}
              </div>
            )}
          </section>
        )}

        {view === "booking" && (
          <section className="cards-latest-booking">
            <div className="cards-latest-chat-assistant">我找到了两班今天从北京到上海的直飞航班：</div>

            {bookingStage === "flights" && (
              <div className="cards-latest-flight-list">
                <button type="button" className="cards-latest-flight-card" data-testid="flight-mu5196" onClick={() => setBookingStage("consent")}>
                  <div className="cards-latest-flight-head"><strong>东方航空 · MU5196</strong><span>¥1133</span></div>
                  <div className="cards-latest-flight-route">
                    <span><b>14:10</b><small>首都 T2</small></span>
                    <i><em>2小时04分</em><span /></i>
                    <span><b>16:14</b><small>虹桥 T2</small></span>
                  </div>
                  <div className="cards-latest-flight-foot"><span>经济舱</span><strong>选择这班<LegacyIcon host={host} name="right" /></strong></div>
                </button>
                <button type="button" className="cards-latest-flight-card" onClick={() => host.toast("本次演示请选择第一班东航")}>
                  <div className="cards-latest-flight-head"><strong>中国国航 · CA1563</strong><span>¥1415</span></div>
                  <div className="cards-latest-flight-route">
                    <span><b>16:30</b><small>大兴</small></span>
                    <i><em>3小时16分</em><span /></i>
                    <span><b>19:46</b><small>浦东 T2</small></span>
                  </div>
                  <div className="cards-latest-flight-foot"><span>经济舱</span><strong>查看<LegacyIcon host={host} name="right" /></strong></div>
                </button>
              </div>
            )}

            {bookingStage !== "flights" && bookingStage !== "complete" && (
              <div className="cards-latest-chat-user">第一班东航这个</div>
            )}

            {bookingStage === "consent" && (
              <div className="cards-latest-consent-card">
                <div className="cards-latest-consent-icon"><LegacyIcon host={host} name="person" /></div>
                <h2>需要你的授权</h2>
                <p>为了完成本次模拟订票，小爱需要使用一张虚构身份证。</p>
                <ul>
                  <li><span>读取身份证号</span><small>仅使用掩码 DEMO 数据</small></li>
                  <li><span>创建订单</span><small>仅生成本地演示订单</small></li>
                </ul>
                <div className="cards-latest-consent-actions">
                  <Button clear data-testid="consent-deny" onClick={() => setBookingStage("denied")}>拒绝</Button>
                  <Button data-testid="consent-allow" onClick={() => setBookingStage("allowed")}>允许</Button>
                </div>
              </div>
            )}

            {bookingStage === "denied" && (
              <div className="cards-latest-consent-card cards-latest-consent-denied">
                <div className="cards-latest-status-mark">×</div>
                <h2>未授权</h2>
                <p>已拒绝读取演示证件，暂时无法创建订单。你可以重新选择。</p>
                <div className="cards-latest-consent-actions">
                  <Button clear onClick={() => setBookingStage("flights")}>返回航班</Button>
                  <Button onClick={() => setBookingStage("consent")}>重新授权</Button>
                </div>
              </div>
            )}

            {bookingStage === "allowed" && (
              <div className="cards-latest-consent-card cards-latest-consent-allowed">
                <div className="cards-latest-status-mark"><LegacyIcon host={host} name="person" /></div>
                <span className="cards-latest-allowed-pill">已允许</span>
                <h2>授权完成</h2>
                <p>已使用掩码 DEMO 证件，接下来只会创建本地演示订单。</p>
                <ul>
                  <li><span>读取身份证号</span><small>{identityCredential.mask}</small></li>
                  <li><span>创建订单</span><small>东方航空 MU5196</small></li>
                </ul>
                <Button className="cards-latest-primary" onClick={() => setBookingStage("order")}>创建演示订单</Button>
              </div>
            )}

            {bookingStage === "order" && (
              <div className="cards-latest-order-card" data-testid="booking-order">
                <div className="cards-latest-order-state"><span>演示订单</span><strong>待支付</strong></div>
                <h2>北京 → 上海</h2>
                <p>东方航空 MU5196 · 经济舱</p>
                <div className="cards-latest-order-route">
                  <span><b>14:10</b><small>首都 T2</small></span>
                  <i>→</i>
                  <span><b>16:14</b><small>虹桥 T2</small></span>
                </div>
                <dl>
                  <div><dt>乘机人</dt><dd>演示用户 A</dd></div>
                  <div><dt>证件号（已脱敏）</dt><dd>{identityCredential.mask}</dd></div>
                  <div><dt>订单金额</dt><dd>¥1133</dd></div>
                </dl>
                <Button className="cards-latest-pay" data-testid="booking-pay" onClick={() => setBookingStage("complete")}>去支付 · 演示</Button>
                <small className="cards-latest-order-tip">不会连接支付服务，也不会产生真实订单</small>
              </div>
            )}

            {bookingStage === "complete" && (
              <div className="cards-latest-complete">
                <div className="cards-latest-complete-mark">✓</div>
                <h1>演示完成</h1>
                <p>模拟订单未提交，未产生任何费用。</p>
                <div><span>东方航空 MU5196</span><strong>北京 → 上海</strong></div>
                <Button className="cards-latest-primary" onClick={() => setBookingStage("flights")}>重新体验</Button>
                <Button clear className="cards-latest-next-link" onClick={() => setView("list")}>返回卡证票据</Button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
