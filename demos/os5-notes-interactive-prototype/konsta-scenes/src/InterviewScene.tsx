import { useState } from "react";
import { Button } from "konsta/react";
import type { HostBridge, NoteRecord, SceneSnapshot } from "./types";
import { InsightCard } from "./InsightCard";
import { ChatSheet, ComposerSheet, FooterPortal, LegacyIcon, NoteDetail, PageTitle, SavedNoteSheet, SceneTopbar, SourceDetail, SourceLink, SourceList } from "./shared";

type Tab="keywords"|"people";
type SheetState=
  |{type:"sources"}
  |{type:"source";id:string}
  |{type:"note";note:NoteRecord}
  |{type:"compose"}
  |{type:"chat"}
  |{type:"saved"}
  |null;

const people=[
  {id:"chen",name:"陈曦",role:"租房白领",tags:["自动化优先","省心"],text:"期待扫地、倒灰和洗拖布都能自动完成。"},
  {id:"liu",name:"刘婷",role:"有娃家庭",tags:["清洁效果优先","可靠"],text:"愿意为效果付费，更担心机器扫不干净、需要返工。"},
  {id:"zhou",name:"老周",role:"退休",tags:["操作简单优先","一键启动"],text:"不希望依赖手机设置，期待按一个键就能开始打扫。"}
];

export function InterviewScene({host,snapshot,onSnapshot}:{host:HostBridge;snapshot:SceneSnapshot;onSnapshot:(next:SceneSnapshot)=>void}) {
  const [tab,setTab]=useState<Tab>("keywords");
  const [opened,setOpened]=useState<Set<number>>(()=>new Set([0]));
  const [full,setFull]=useState(false);
  const [sheet,setSheet]=useState<SheetState>(null);
  const saved=snapshot.savedSummaries.includes("interview");
  const toggle=(index:number)=>setOpened(current=>{const next=new Set(current);next.has(index)?next.delete(index):next.add(index);return next;});
  const openSource=(id:string)=>setSheet({type:"source",id});
  return <div className="konsta-scene" data-konsta-scene="interview">
    <div className="page interview-page" data-konsta-background>
      <SceneTopbar host={host} onSources={()=>setSheet({type:"sources"})}/>
      <PageTitle title="扫地机用户访谈" meta="共 3 位受访者  |  更新时间：今天10:31"/>
      <section className="interview-summary"><p className="eyebrow"><LegacyIcon host={host} name="bulb"/>访谈小结</p><h2>用户选购扫地机器人，最看重什么？</h2><p>{snapshot.interviewOverview}</p></section>
      <div className="segmented-control" role="tablist" aria-label="访谈内容"><Button clear role="tab" data-konsta-role="interview-tab" aria-selected={tab==="keywords"} className={tab==="keywords"?"active":""} onClick={()=>setTab("keywords")}>关键词</Button><Button clear role="tab" data-konsta-role="interview-tab" aria-selected={tab==="people"} className={tab==="people"?"active":""} onClick={()=>setTab("people")}>受访者</Button></div>
      {tab==="keywords"?<>
        {snapshot.interviewInsights.map((insight,index)=><InsightCard key={insight.title} host={host} snapshot={snapshot} insight={insight} index={index} opened={opened.has(index)} onToggle={()=>toggle(index)} onSource={openSource}/>) }
        <h2 className="page-section-title">访谈总结</h2>
        <section className="result-card"><div className="result-heading"><h3>扫地机器人购买决策</h3><Button clear className="subtle-pill" data-konsta-role="save-summary" onClick={()=>saved?setSheet({type:"saved"}):onSnapshot(host.saveSummary("interview"))}>{saved?"查看笔记":"另存为笔记"}</Button></div><div className="result-content"><h4>访谈目标</h4><p>{snapshot.interviewGoal}</p><h4>核心结论</h4><p>{snapshot.interviewConclusion}</p><h4>关键发现</h4><p><b>1. 自动化是双刃剑。</b> 同样的高端自动化功能，对年轻人是买单理由，对老人是弃用原因。高端功能并非越多越好，对银发人群反而是负担。</p>{full&&<><p><b>2. 先证明扫得干净。</b> 家庭用户更担心需要返工。应围绕食物碎屑、边角与地毯等具体场景展示清洁效果。</p><p><b>3. 帮用户选明白、用明白。</b> 减少术语与复杂设置，把适用家庭和上手方式说清楚。</p><h4>下一步验证</h4><p>当前结论来自三位示例受访者。增加不同居住环境与使用经验的样本，再判断这些差异是否稳定。</p></>}</div><Button clear className="read-more" data-konsta-role="summary-expand" onClick={()=>setFull(value=>!value)}>{full?"收起全文":"查看全文"}</Button></section>
      </>:<div className="respondent-list">{people.map(person=>{const source=snapshot.sources[person.id];return <article className="respondent-card" key={person.id}><div className="respondent-header"><span className="respondent-avatar">{person.name.slice(0,1)}</span><div><h3>{person.name}</h3><small>{person.role} · {source?.date}</small></div></div><p>{person.text}</p>{person.tags.map(tag=><span className="respondent-tag" key={tag}>{tag}</span>)}{source&&<SourceLink host={host} source={source} label="查看原始访谈" onOpen={()=>openSource(person.id)}/>}</article>;})}</div>}
    </div>
    <FooterPortal host={host} onAdd={()=>setSheet({type:"compose"})} onAsk={()=>setSheet({type:"chat"})}/>
    {sheet?.type==="sources"&&<SourceList host={host} scene="interview" snapshot={snapshot} onClose={()=>setSheet(null)} onSource={openSource} onNote={note=>setSheet({type:"note",note})}/>} 
    {sheet?.type==="source"&&snapshot.sources[sheet.id]&&<SourceDetail source={snapshot.sources[sheet.id]} onClose={()=>setSheet(null)}/>} 
    {sheet?.type==="note"&&<NoteDetail note={sheet.note} onClose={()=>setSheet(null)}/>} 
    {sheet?.type==="compose"&&<ComposerSheet scene="interview" host={host} onClose={()=>setSheet(null)} onSaved={onSnapshot}/>} 
    {sheet?.type==="chat"&&<ChatSheet scene="interview" host={host} onClose={()=>setSheet(null)} onSaved={onSnapshot}/>} 
    {sheet?.type==="saved"&&<SavedNoteSheet scene="interview" snapshot={snapshot} onClose={()=>setSheet(null)}/>} 
  </div>;
}
