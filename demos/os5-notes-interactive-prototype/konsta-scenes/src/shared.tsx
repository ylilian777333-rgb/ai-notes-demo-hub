import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button, Sheet } from "konsta/react";
import { createPortal } from "react-dom";
import type { HostBridge, NoteRecord, SceneName, SceneSnapshot, SourceRecord } from "./types";

export function LegacyIcon({host,name,className=""}:{host:HostBridge;name:string;className?:string}) {
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{__html:host.icon(name)}}/>;
}

export function AiMark({host}:{host:HostBridge}) {
  return <span aria-hidden="true" dangerouslySetInnerHTML={{__html:host.aiIcon()}}/>;
}

export function SceneTopbar({host,onSources}:{host:HostBridge;onSources:()=>void}) {
  return <div className="topbar">
    <Button clear className="icon-button back-button" data-konsta-role="back" aria-label="返回合集" onClick={host.back}><LegacyIcon host={host} name="back"/></Button>
    <Button clear className="icon-button" data-konsta-role="sources" aria-label="查看原始记录" onClick={onSources}><LegacyIcon host={host} name="note"/></Button>
  </div>;
}

export function PageTitle({title,meta}:{title:string;meta:string}) {
  return <><h1 className="page-title">{title}</h1><p className="page-meta">{meta}</p></>;
}

export function DetailSheet({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}) {
  const titleId=useId();
  const ref=useRef<HTMLDivElement>(null);
  const closeRef=useRef(onClose);
  useEffect(()=>{closeRef.current=onClose;},[onClose]);
  useEffect(()=>{
    const origin=document.activeElement as HTMLElement|null;
    const app=document.getElementById("app");
    const footer=document.getElementById("floating-bar");
    if(app)app.inert=true;
    if(footer)footer.inert=true;
    const timeout=window.setTimeout(()=>ref.current?.querySelector<HTMLElement>("button,input,textarea,select,[tabindex='0']")?.focus(),30);
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){event.preventDefault();closeRef.current();return;}
      if(event.key!=="Tab")return;
      const focusable=Array.from(ref.current?.querySelectorAll<HTMLElement>("button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex='0']")??[]);
      const first=focusable[0],last=focusable[focusable.length-1];
      if(!first||!last)return;
      if(event.shiftKey&&(document.activeElement===first||!ref.current?.contains(document.activeElement))){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    document.addEventListener("keydown",onKey);
    return()=>{window.clearTimeout(timeout);document.removeEventListener("keydown",onKey);if(app)app.inert=false;if(footer)footer.inert=false;origin?.focus({preventScroll:true});};
  },[]);
  const target=document.getElementById("phone");
  if(!target)return null;
  return createPortal(<>
    <button className="konsta-sheet-backdrop" aria-label="关闭弹层" onClick={onClose}/>
    <Sheet opened backdrop={false} className="konsta-notes-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div ref={ref} className="konsta-sheet-inner">
        <div className="sheet-handle" aria-hidden="true"/>
        <header className="sheet-header"><h2 id={titleId}>{title}</h2><Button clear data-konsta-role="sheet-close" aria-label="关闭" onClick={onClose}>×</Button></header>
        {children}
      </div>
    </Sheet>
  </>,target);
}

export function FooterPortal({host,onAdd,onAsk}:{host:HostBridge;onAdd:()=>void;onAsk:()=>void}) {
  const target=document.getElementById("floating-bar");
  if(!target)return null;
  return createPortal(<div className="konsta-footer-actions">
    <Button clear className="detail-pill" data-konsta-role="footer-add" onClick={onAdd}><LegacyIcon host={host} name="plus"/>补充记录</Button>
    <Button clear className="detail-pill" data-konsta-role="footer-ask" onClick={onAsk}><AiMark host={host}/>问问AI</Button>
  </div>,target);
}

export function SourceLink({host,source,onOpen,label}:{host:HostBridge;source:SourceRecord;onOpen:()=>void;label?:string}) {
  return <Button clear className="source-link" data-konsta-role="source" onClick={onOpen}>
    <LegacyIcon host={host} name="note"/>
    <span>{label??source.title}{source.time?` · ${source.time}`:""}</span>
    <LegacyIcon host={host} name="right"/>
  </Button>;
}

export function SourceQuote({host,source,onOpen}:{host:HostBridge;source:SourceRecord;onOpen:()=>void}) {
  return <div className="source-quote"><p>{source.quote}</p><SourceLink host={host} source={source} onOpen={onOpen}/></div>;
}

export function SourceDetail({source,onClose}:{source:SourceRecord;onClose:()=>void}) {
  return <DetailSheet title="原始记录" onClose={onClose}>
    <h3>{source.title}</h3>
    <p className="sheet-meta">{source.date}{source.time?" · 录音转写":""}</p>
    <div className="source-excerpt">{source.quote}</div>
    {source.time&&<p className="sheet-hint">示例转写 · {source.time}｜当前演示未附原始音频</p>}
    <div className="sheet-body-copy">{source.body}</div>
  </DetailSheet>;
}

export function NoteDetail({note,onClose}:{note:NoteRecord;onClose:()=>void}) {
  return <DetailSheet title="笔记" onClose={onClose}>
    <h3>{note.title}</h3><p className="sheet-meta">{note.date} · {note.category??"随记"}</p><div className="sheet-body-copy">{note.text}</div>
  </DetailSheet>;
}

export function SourceList({host,scene,snapshot,onClose,onSource,onNote}:{host:HostBridge;scene:SceneName;snapshot:SceneSnapshot;onClose:()=>void;onSource:(id:string)=>void;onNote:(note:NoteRecord)=>void}) {
  const sourceEntries=Object.entries(snapshot.sources).filter(([,source])=>source.scope===scene);
  const supplementIds=snapshot.supplements[scene]??[];
  const supplements=supplementIds.map(id=>snapshot.notes.find(note=>note.id===id)).filter((note):note is NoteRecord=>Boolean(note));
  return <DetailSheet title="原始记录" onClose={onClose}><p className="sheet-hint">{sourceEntries.length+supplements.length} 条记录 · {scene==="ideas"?"职业方向思考":"扫地机用户访谈"}</p><div className="source-list">
    {supplements.map(note=><Button clear key={note.id} className="sheet-option" onClick={()=>onNote(note)}><LegacyIcon host={host} name="note"/><span><strong>{note.title}</strong><small>刚刚 · 补充记录</small></span><span>›</span></Button>)}
    {sourceEntries.map(([id,source])=><Button clear key={id} className="sheet-option" onClick={()=>onSource(id)}><span>▤</span><span><strong>{source.title}</strong><small>{source.date}{source.time?" · 录音转写":""}</small></span><span>›</span></Button>)}
  </div></DetailSheet>;
}

export function ComposerSheet({scene,host,onClose,onSaved}:{scene:SceneName;host:HostBridge;onClose:()=>void;onSaved:(snapshot:SceneSnapshot)=>void}) {
  const [value,setValue]=useState("");
  const submit=(event:FormEvent)=>{event.preventDefault();if(!value.trim())return;onSaved(host.addSupplement(scene,value.trim()));onClose();};
  return <DetailSheet title={scene==="ideas"?"补充想法":"补充访谈记录"} onClose={onClose}><form className="detail-form" onSubmit={submit}><p className="sheet-hint">{scene==="ideas"?"留下一句话，之后再接着想。":"补充一条新的访谈观察或原话。"}</p><textarea autoFocus aria-label="补充记录" maxLength={10000} placeholder="写下内容…" value={value} onChange={event=>setValue(event.target.value)}/><Button data-konsta-role="composer-save" className="primary-button" type="submit" disabled={!value.trim()}>保存到合集</Button></form></DetailSheet>;
}

type ChatMessage={role:"user"|"assistant";text:string;saved?:boolean};
export function ChatSheet({scene,host,onClose,onSaved}:{scene:SceneName;host:HostBridge;onClose:()=>void;onSaved:(snapshot:SceneSnapshot)=>void}) {
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const [value,setValue]=useState("");
  const suggestions=scene==="ideas"?["我下一步可以做什么？","转产品的想法来自哪些记录？"]:["比较三类用户的差异","这些结论的依据是什么？"];
  const intro=scene==="ideas"?"我带上了这 6 条职业思考。可以一起梳理转产品的方向，或把下一步变得更具体。":"我带上了这 3 位受访者的记录。可以继续比较人群差异，或追溯一个洞察的依据。";
  const answer=(question:string)=>scene==="ideas"
    ?(/来源|记录|依据/.test(question)?"这条方向主要来自两条记录：\n\n「关于产品方向」里，你说想了解需求背后是怎么定的。\n「内部转岗」里，你说如果能转产品，在哪家公司反而没那么重要。\n\n可以回到原始记录，确认这些想法今天是否仍然成立。":"可以先做三件小事：\n1. 找一位产品同事，了解内部转岗条件。\n2. 在下个需求中参与目标和范围定义。\n3. 用一个月练习提前对齐技术边界。")
    :(/依据|原话|来源/.test(question)?"可以直接对照三条原话：\n陈曦：「我要的是彻底解放双手。」\n刘婷：「我怕它扫不干净还得我返工。」\n老周：「我就想按一个键它就开始扫。」":"三类人群的优先级不同：\n陈曦看重自动化，刘婷看重清洁效果，老周看重一键操作。下一轮可以让三类用户试用同一流程，再观察各自卡在哪一步。");
  const send=(question:string)=>{const q=question.trim();if(!q)return;setMessages(current=>[...current,{role:"user",text:q},{role:"assistant",text:answer(q)}]);setValue("");};
  const submit=(event:FormEvent)=>{event.preventDefault();send(value);};
  const save=(index:number,message:ChatMessage)=>{onSaved(host.saveChat(scene,`${scene==="ideas"?"职业方向思考":"扫地机用户访谈"} · AI 对话`,message.text));setMessages(current=>current.map((item,i)=>i===index?{...item,saved:true}:item));};
  return <DetailSheet title="问问AI" onClose={onClose}><div className="chat-context"><AiMark host={host}/>{scene==="ideas"?"职业方向思考":"扫地机用户访谈"} · 已带上合集内容</div><p className="sheet-hint">演示对话 · 使用预设回答</p><div className="chat-messages"><div className="chat-message">{intro}</div>{messages.map((message,index)=><div key={`${index}-${message.role}`}><div className={`chat-message ${message.role==="user"?"user":""}`}>{message.text}</div>{message.role==="assistant"&&<Button clear className="chat-save" disabled={message.saved} onClick={()=>save(index,message)}>{message.saved?"已保存为笔记":"另存为笔记"}<span>›</span></Button>}</div>)}</div>{messages.length===0&&<div className="chat-suggestions">{suggestions.map(question=><Button clear key={question} onClick={()=>send(question)}>{question}<span>›</span></Button>)}</div>}<form className="chat-form" onSubmit={submit}><input aria-label="提问" placeholder="继续问问…" value={value} onChange={event=>setValue(event.target.value)}/><Button clear type="submit" aria-label="发送" disabled={!value.trim()}><LegacyIcon host={host} name="send"/></Button></form></DetailSheet>;
}

export function SavedNoteSheet({scene,snapshot,onClose}:{scene:SceneName;snapshot:SceneSnapshot;onClose:()=>void}) {
  const note=snapshot.notes.find(item=>item.id===`summary-${scene}`);
  if(!note)return null;
  return <NoteDetail note={note} onClose={onClose}/>;
}
