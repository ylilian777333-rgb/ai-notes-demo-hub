import { Button } from "konsta/react";
import type { HostBridge, Insight, SceneSnapshot } from "./types";
import { LegacyIcon, SourceQuote } from "./shared";

export function InsightCard({host,snapshot,insight,index,opened,onToggle,onSource}:{host:HostBridge;snapshot:SceneSnapshot;insight:Insight;index:number;opened:boolean;onToggle:()=>void;onSource:(id:string)=>void}) {
  return <article className={`insight-card ${opened?"":"closed"}`}>
    <Button clear className="insight-heading" data-konsta-role="insight-toggle" aria-expanded={opened} onClick={onToggle}>
      <span className="insight-number">{index+1}</span><span>{insight.title}</span><LegacyIcon host={host} name={opened?"down":"up"}/>
    </Button>
    {opened&&<div className="insight-body"><p>{insight.text}</p>{insight.sources.map(id=>{const source=snapshot.sources[id];return source?<SourceQuote key={id} host={host} source={source} onOpen={()=>onSource(id)}/>:null;})}</div>}
  </article>;
}
