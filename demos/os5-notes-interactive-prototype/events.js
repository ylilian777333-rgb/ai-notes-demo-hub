async function dispatch(action){
  const colon=action.indexOf(':'),key=colon<0?action:action.slice(0,colon),arg=colon<0?'':action.slice(colon+1);
  switch(key){
    case 'go':go(arg);break;
    case 'back':back();break;
    case 'close':closeSheet();break;
    case 'menu':menu();break;
    case 'scene-menu':sceneMenu();break;
    case 'about':about();break;
    case 'compare':compareMode=!compareMode;document.body.classList.toggle('compare-mode',compareMode);$('reference-panel').hidden=!compareMode;$('compare-button').setAttribute('aria-pressed',String(compareMode));if(compareMode&&!fullPageMode)dispatch('layout');break;
    case 'layout':fullPageMode=!fullPageMode;document.body.classList.toggle('full-page-mode',fullPageMode);$('layout-button').setAttribute('aria-pressed',String(fullPageMode));$('layout-button').innerHTML=(fullPageMode?'切回手机预览':'查看完整页面')+' <span>↕</span>';$('app').scrollTop=0;break;
    case 'reset':sheet('重置演示',`<p>清除这个浏览器中新建的示例笔记、待办和学习进度，恢复最初的原型内容。</p>${actionButton('恢复初始内容','reset-confirm')}${actionButton('保留当前内容','close','secondary-button')}`);break;
    case 'reset-confirm':state=initialState();persist();noteFilter=taskFilter=cardFilter='全部';noteQuery=cardQuery='';chapterIndex=0;interviewTab='insights';openChapters.clear();[0,1].forEach(i=>openChapters.add(i));openIdeas.clear();openIdeas.add(0);openInterviews.clear();openInterviews.add(0);collapsedTasks.clear();revealedCards.clear();ideaFull=interviewFull=timelineFull=false;completedOpen=true;navigation=[];go('notes',false);toast('已恢复初始内容');break;
    case 'note-filter':noteFilter=arg;render();break;
    case 'task-filter':taskFilter=arg;render();break;
    case 'card-filter':cardFilter=arg;render();break;
    case 'open-task-category':taskFilter=arg;go('tasks');break;
    case 'open-card-category':cardFilter=arg;go('cards');break;
    case 'folders':sheet('文件夹',`<div class="sheet-menu">${['全部','生活','工作','通话笔记'].map(c=>actionButton(icon('folder')+`<span>${c}<small>${state.notes.filter(n=>c==='全部'||n.category===c).length} 篇笔记</small></span>`+icon('right'),'open-folder:'+c)).join('')}</div>`);break;
    case 'open-folder':noteFilter=arg;go('notes');break;
    case 'note':showNote(arg);break;
    case 'edit-note':editNote(arg);break;
    case 'sources':sourceList(arg);break;
    case 'source':showSource(arg);break;
    case 'collection-list':collectionList(arg);break;
    case 'other':otherCollection(arg);break;
    case 'task-toggle':toggleTask(arg);break;
    case 'task-sheet-toggle':toggleTask(arg);closeSheet();break;
    case 'task-collapse':collapsedTasks.has(arg)?collapsedTasks.delete(arg):collapsedTasks.add(arg);render();break;
    case 'task-detail':taskDetail(arg);break;
    case 'completed-toggle':completedOpen=!completedOpen;render();break;
    case 'new-task':newTask();break;
    case 'idea-toggle':openIdeas.has(+arg)?openIdeas.delete(+arg):openIdeas.add(+arg);render();break;
    case 'interview-toggle':openInterviews.has(+arg)?openInterviews.delete(+arg):openInterviews.add(+arg);render();break;
    case 'chapter-toggle':openChapters.has(+arg)?openChapters.delete(+arg):openChapters.add(+arg);render();break;
    case 'interview-tab':interviewTab=arg;render();break;
    case 'idea-full':ideaFull=!ideaFull;render();break;
    case 'interview-full':interviewFull=!interviewFull;render();break;
    case 'timeline-full':timelineFull=!timelineFull;render();break;
    case 'add-actions':addActions();break;
    case 'add-action':addActions(+arg);break;
    case 'save-summary':saveSummary(arg);break;
    case 'capture':capture(arg);break;
    case 'capture-mode':captureDraft=$('capture-text')?.value||captureDraft;if(arg==='assistant'&&!captureDraft)captureDraft='帮我记一下：下个需求评审之前，先和技术同事对齐实现边界。';capture(captureScope,arg,true);break;
    case 'voice-example':$('capture-text').value=captureScope==='course'?'今天补充学习了夹逼定理：先找出上下界，再确认两边趋向同一个值。':captureScope==='interview'?'补充观察：受访者更愿意直接看清洁效果，而不是比较一长串参数。':'今天和产品同事聊了内部转岗，下一步先参与一次需求讨论。';captureDraft=$('capture-text').value;toast('已填入示例转写，可编辑后保存');break;
    case 'chapters':chooseChapters();break;
    case 'choose-chapter':chapterIndex=+arg;openChapters.add(chapterIndex);closeSheet();render();$('app').scrollTop=0;break;
    case 'study':study(arg);break;
    case 'master':markMastered(arg);break;
    case 'map':knowledgeMap(+arg);break;
    case 'quiz':quiz(+arg);break;
    case 'quiz-answer':quiz(quizIndex,+arg);break;
    case 'quiz-finish':closeSheet();toast('自测完成，可以继续复习知识点');break;
    case 'slides':slides(+arg);break;
    case 'podcast':podcast();break;
    case 'podcast-play':playPodcast();break;
    case 'podcast-stop':stopSpeech();break;
    case 'chat':chat(arg);break;
    case 'chat-suggestion':sendChat(arg);break;
    case 'chat-save':{const m=chatLog[+arg];if(m&&!m.saved){addNote(PAGE_NAMES[chatScope]+' · 对话记录',m.text,chatScope);m.saved=true;persist();render();renderChat();toast('已保存为笔记');}break;}
    case 'card-reveal':revealedCards.has(arg)?revealedCards.delete(arg):revealedCards.add(arg);$('credential-list').innerHTML=credentialList();break;
    case 'card-copy':await copyCredential(arg);break;
    case 'credential-source':{const c=credentials.find(c=>c.id===arg);if(c)sheet('卡证原始记录',`<h3>${c.title}</h3><div class="white-card"><p>${c.label}：${c.name}</p><p>${c.secretLabel}：${c.mask}</p></div><p class="source-notice">用于演示结构化卡证展示。可显示的号码与密码均为虚构示例，不对应真实证件。</p>${actionButton('返回卡证','close','secondary-button')}`);break;}
    default:toast('请重新选择操作');
  }
}
let dragged=false,drag=null;
document.addEventListener('click',e=>{if(dragged){e.preventDefault();dragged=false;return;}const goButton=e.target.closest('[data-go]'),actionButtonEl=e.target.closest('[data-action]');if(actionButtonEl){e.preventDefault();dispatch(actionButtonEl.dataset.action).catch(()=>toast('操作未完成，请重试'));}else if(goButton){e.preventDefault();go(goButton.dataset.go);}});
document.addEventListener('input',e=>{if(e.target.id==='note-search'){noteQuery=e.target.value;$('note-list').innerHTML=noteList();}if(e.target.id==='card-search'){cardQuery=e.target.value;$('credential-list').innerHTML=credentialList();}if(e.target.id==='capture-text')captureDraft=e.target.value;});
document.addEventListener('submit',e=>{
  e.preventDefault();
  if(e.target.id==='capture-form'){
    const content=$('capture-text').value.trim();if(!content){toast('先写下一点内容');return;}
    const title=content.split('\n')[0].slice(0,28),id=addNote(title,content,captureScope);
    if(['course','ideas','interview'].includes(captureScope)){(state.supplements[captureScope]||=[]).unshift(id);}
    const saved=persist();closeSheet();if(captureScope==='notes'){noteQuery='';noteFilter='全部';go('notes');}else render();toast(saved?'已保存到'+(PAGE_NAMES[captureScope]||'笔记'):'已保留在当前页面，浏览器暂不能持久保存');
  }else if(e.target.id==='edit-note-form'){
    const n=state.notes.find(n=>n.id===e.target.dataset.id),title=$('edit-title').value.trim(),text=$('edit-content').value.trim();if(!n||!title||!text)return;n.title=title;n.text=text;n.date='刚刚';persist();render();showNote(n.id);toast('修改已保存');
  }else if(e.target.id==='task-create-form'||e.target.id==='task-edit-form'){
    const title=$('task-title').value.trim();if(!title)return;const time=$('task-due').value.trim(),category=$('task-category').value;
    if(e.target.id==='task-edit-form'){const match=findTask(e.target.dataset.id);if(match)Object.assign(match.task,{title,time,category});}else{state.tasks.unshift({id:'task-new-'+state.nextId++,title,time,category,done:false});taskFilter='全部';}
    persist();closeSheet();render();toast('待办已保存');
  }else if(e.target.id==='chat-form')sendChat($('chat-input').value);
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('modal-layer').hidden){closeSheet();return;}
  if(e.key==='Tab'&&!$('modal-layer').hidden){const els=[...$('sheet').querySelectorAll('button:not(:disabled),input,textarea,select,[tabindex="0"]')].filter(el=>!el.hidden);if(!els.length)return;const first=els[0],last=els[els.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('sheet'))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===$('sheet'))){e.preventDefault();first.focus();}}
});
document.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;const el=e.target.closest('.horizontal-scroll');if(el){drag={el,x:e.clientX,left:el.scrollLeft};dragged=false;}});
document.addEventListener('pointermove',e=>{if(!drag)return;const delta=e.clientX-drag.x;if(Math.abs(delta)>6){dragged=true;drag.el.scrollLeft=drag.left-delta;e.preventDefault();}});
document.addEventListener('pointerup',()=>{drag=null;setTimeout(()=>dragged=false,0);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){revealedCards.clear();if(page==='cards')$('credential-list').innerHTML=credentialList();stopSpeech();}});
window.addEventListener('hashchange',()=>{const requested=location.hash.slice(1);if(PAGE_NAMES[requested]&&requested!==page)go(requested);});
$('status-icons').innerHTML=statusIcons();
if(PAGE_NAMES[location.hash.slice(1)])page=location.hash.slice(1);
render(false);
if(document.modelContext?.registerTool){const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});try{Promise.resolve(document.modelContext.registerTool({name:'navigate_collection_demo',description:'Navigate to one of seven fictional OS5 notes prototype pages. This changes only the demonstration UI.',inputSchema:{type:'object',properties:{scene:{type:'string',enum:Object.keys(PAGE_NAMES)}},required:['scene'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!PAGE_NAMES[input.scene])throw Error('Invalid scene');go(input.scene);return {scene:page,demo:true};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}}
