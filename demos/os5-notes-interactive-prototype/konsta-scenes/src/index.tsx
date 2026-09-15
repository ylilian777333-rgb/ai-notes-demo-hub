import { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { App } from "konsta/react";
import { IdeasScene } from "./IdeasScene";
import { InterviewScene } from "./InterviewScene";
import type { HostBridge, SceneBundleApi, SceneName, SceneSnapshot } from "./types";
import "./scene.css";

function SceneRoot({scene,host}:{scene:SceneName;host:HostBridge}) {
  const [snapshot,setSnapshot]=useState<SceneSnapshot>(()=>host.getSnapshot());
  useEffect(()=>setSnapshot(host.getSnapshot()),[host]);
  return <App theme="material" dark={false} safeAreas={false} className="konsta-scene-app">
    {scene==="ideas"?<IdeasScene host={host} snapshot={snapshot} onSnapshot={setSnapshot}/>:<InterviewScene host={host} snapshot={snapshot} onSnapshot={setSnapshot}/>} 
  </App>;
}

let root:Root|null=null;
let mountedContainer:HTMLElement|null=null;

const api:SceneBundleApi={
  mount(container,scene,host){
    if(mountedContainer&&mountedContainer!==container){root?.unmount();root=null;mountedContainer=null;}
    if(!root){container.replaceChildren();root=createRoot(container);mountedContainer=container;}
    root.render(<SceneRoot scene={scene} host={host}/>);
  },
  unmount(){root?.unmount();root=null;mountedContainer=null;},
  isMounted(){return root!==null;}
};

window.OS5KonstaScenes=api;
