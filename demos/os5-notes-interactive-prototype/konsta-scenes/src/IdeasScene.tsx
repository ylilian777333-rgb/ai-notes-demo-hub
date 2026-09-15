import { useState } from "react";
import { Button } from "konsta/react";
import type { HostBridge, NoteRecord, SceneSnapshot } from "./types";
import { InsightCard } from "./InsightCard";
import { ChatSheet, ComposerSheet, FooterPortal, LegacyIcon, NoteDetail, PageTitle, SavedNoteSheet, SceneTopbar, SourceDetail, SourceList } from "./shared";

type SheetState=
  |{type:"sources"}
  |{type:"source";id:string}
  |{type:"note";note:NoteRecord}
  |{type:"compose"}
  |{type:"chat"}
  |{type:"saved"}
  |null;

export function IdeasScene({host,snapshot,onSnapshot}:{host:HostBridge;snapshot:SceneSnapshot;onSnapshot:(next:SceneSnapshot)=>void}) {
  const [opened,setOpened]=useState<Set<number>>(()=>new Set([0]));
  const [full,setFull]=useState(false);
  const [timelineFull,setTimelineFull]=useState(false);
  const [sheet,setSheet]=useState<SheetState>(null);
  const extraIds=snapshot.supplements.ideas??[];
  const extraNotes=extraIds.map(id=>snapshot.notes.find(note=>note.id===id)).filter((note):note is NoteRecord=>Boolean(note));
  const timeline=["transfer","performance","interviewjob","product",...(timelineFull?["align","growth"]:[])];
  const saved=snapshot.savedSummaries.includes("ideas");
  const toggle=(index:number)=>setOpened(current=>{const next=new Set(current);next.has(index)?next.delete(index):next.add(index);return next;});
  const openSource=(id:string)=>setSheet({type:"source",id});
  const addAction=(index?:number)=>{
    if(index===undefined&&snapshot.addedActions.length===3){host.navigate("tasks");return;}
    onSnapshot(host.addIdeaActions(index));
  };
  return <div className="konsta-scene" data-konsta-scene="ideas">
    <div className="page ideas-page" data-konsta-background>
      <span className="idea-header-bulb"><LegacyIcon host={host} name="bulb"/></span>
      <SceneTopbar host={host} onSources={()=>setSheet({type:"sources"})}/>
      <PageTitle title="职业方向思考" meta={`共 ${6+extraNotes.length} 条笔记  |  更新时间：今天10:31`}/>
      <section className="one-line-summary"><p className="eyebrow">一句话小结</p><p>半年来你一直在纠结“要不要换工作”，但记着记着会发现，你真正想在意的不是去留，而是“想做有意思的事”和“想成长”。</p></section>
      <h2 className="page-section-title">反复在想的事</h2>
      {snapshot.ideaInsights.map((insight,index)=><InsightCard key={insight.title} host={host} snapshot={snapshot} insight={insight} index={index} opened={opened.has(index)} onToggle={()=>toggle(index)} onSource={openSource}/>) }
      <h2 className="page-section-title">AI帮你看见的</h2>
      <section className="result-card">
        <div className="result-heading"><span className="tiny-bulb"><LegacyIcon host={host} name="bulb"/></span><h3>关于职业方向的思考</h3><Button clear className="subtle-pill" data-konsta-role="save-summary" onClick={()=>saved?setSheet({type:"saved"}):onSnapshot(host.saveSummary("ideas"))}>{saved?"查看笔记":"另存为笔记"}</Button></div>
        <div className="result-content"><p>{snapshot.ideaSummary}</p><h4>方向上，转产品的意愿在逐渐清晰。</h4><p>{full?snapshot.ideaDirection:`${snapshot.ideaDirection.slice(0,145)}…`}</p>{full&&<><h4>去留上，可以先做一次低成本验证。</h4><p>先了解内部转岗的实际条件，参与一次需求定义，再判断新的工作内容是否符合期待。把“换不换公司”和“做什么工作”分开决策，能让下一步更明确。</p><h4>协作上，把对齐的时间提前。</h4><p>不等到视觉稿收尾才确认技术边界。下个需求开始前，先和相关同事一起确认目标、约束与验收方式。</p></>}</div>
        <Button clear className="read-more" data-konsta-role="summary-expand" onClick={()=>setFull(value=>!value)}>{full?"收起全文":"查看全文"}</Button>
      </section>
      <h2 className="page-section-title">行动建议</h2>
      <section className="result-card action-suggestions">
        <div className="result-heading"><span className="tiny-bulb"><LegacyIcon host={host} name="bulb"/></span><h3>给自己的下一步</h3><Button clear className="subtle-pill" data-konsta-role="add-all-actions" onClick={()=>addAction()}>{snapshot.addedActions.length===3?"查看待办":"添加到待办"}</Button></div>
        {snapshot.ideaActions.map((action,index)=>{const checked=snapshot.addedActions.includes(index);return <div className="task-line" key={action}><Button clear className={`task-check ${checked?"checked":""}`} data-konsta-role="add-action" aria-pressed={checked} aria-label={`添加到待办：${action}`} onClick={()=>addAction(index)}>{checked&&<LegacyIcon host={host} name="check"/>}</Button><div className="task-text"><strong>{action}</strong></div></div>;})}
      </section>
      <h2 className="page-section-title">思考记录</h2>
      <div className="thought-timeline">
        {extraNotes.map(note=><button className="timeline-row" key={note.id} onClick={()=>setSheet({type:"note",note})}><div><small>刚刚</small><p>{note.title}</p></div><LegacyIcon host={host} name="right"/></button>)}
        {timeline.map(id=>{const source=snapshot.sources[id];return source?<button className="timeline-row" key={id} onClick={()=>openSource(id)}><div><small>{source.date}</small><p>{source.title}</p></div><LegacyIcon host={host} name="right"/></button>:null;})}
        <Button clear className="read-more" data-konsta-role="timeline-expand" onClick={()=>setTimelineFull(value=>!value)}>{timelineFull?"收起":"查看更多"}</Button>
      </div>
    </div>
    <FooterPortal host={host} onAdd={()=>setSheet({type:"compose"})} onAsk={()=>setSheet({type:"chat"})}/>
    {sheet?.type==="sources"&&<SourceList host={host} scene="ideas" snapshot={snapshot} onClose={()=>setSheet(null)} onSource={openSource} onNote={note=>setSheet({type:"note",note})}/>} 
    {sheet?.type==="source"&&snapshot.sources[sheet.id]&&<SourceDetail source={snapshot.sources[sheet.id]} onClose={()=>setSheet(null)}/>} 
    {sheet?.type==="note"&&<NoteDetail note={sheet.note} onClose={()=>setSheet(null)}/>} 
    {sheet?.type==="compose"&&<ComposerSheet scene="ideas" host={host} onClose={()=>setSheet(null)} onSaved={onSnapshot}/>} 
    {sheet?.type==="chat"&&<ChatSheet scene="ideas" host={host} onClose={()=>setSheet(null)} onSaved={onSnapshot}/>} 
    {sheet?.type==="saved"&&<SavedNoteSheet scene="ideas" snapshot={snapshot} onClose={()=>setSheet(null)}/>} 
  </div>;
}
