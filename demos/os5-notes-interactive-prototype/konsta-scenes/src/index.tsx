import { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { App } from "konsta/react";
import { CardsScene } from "./CardsScene";
import { CourseScene } from "./CourseScene";
import { IdeasScene } from "./IdeasScene";
import { InterviewScene } from "./InterviewScene";
import { TasksScene } from "./TasksScene";
import type { HostBridge, SceneBundleApi, SceneName, SceneSnapshot } from "./types";
import "./scene.css";

function SceneContent({scene,host,snapshot,onSnapshot}:{scene:SceneName;host:HostBridge;snapshot:SceneSnapshot;onSnapshot:(next:SceneSnapshot)=>void}) {
  switch (scene) {
    case "course":
      return <CourseScene host={host} snapshot={snapshot} onSnapshot={onSnapshot}/>;
    case "tasks":
      return <TasksScene host={host} snapshot={snapshot} onSnapshot={onSnapshot}/>;
    case "ideas":
      return <IdeasScene host={host} snapshot={snapshot} onSnapshot={onSnapshot}/>;
    case "interview":
      return <InterviewScene host={host} snapshot={snapshot} onSnapshot={onSnapshot}/>;
    case "cards":
      return <CardsScene host={host} snapshot={snapshot}/>;
  }
}

function SceneRoot({scene,host}:{scene:SceneName;host:HostBridge}) {
  const [snapshot,setSnapshot]=useState<SceneSnapshot>(()=>host.getSnapshot());
  useEffect(()=>setSnapshot(host.getSnapshot()),[host]);
  return <App theme="material" dark={false} safeAreas={false} className="konsta-scene-app">
    <SceneContent key={scene} scene={scene} host={host} snapshot={snapshot} onSnapshot={setSnapshot}/>
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
