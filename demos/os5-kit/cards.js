/* OS5 卡片组件（Figma 负一屏卡片 → 落地页"动态置顶"卡片，同一份实现）
   OS5Cards.render(spec, {where:'neg'|'lp'}) 返回 HTML 字符串。
   spec.type: check | todo | sug | notif | upnext | rec | flight | hotel | taxi | moments | widgets */
(function(){
  var BASE=(window.OS5_KIT_BASE||'../os5-kit/')+'assets/';
  var I={
    signal:'<svg width="20" height="20" viewBox="0 0 20 20"><path opacity=".75" fill="currentColor" fill-rule="evenodd" d="M14.92 5.03c0-.37 0-.55.07-.7a.67.67 0 0 1 .29-.29c.14-.07.32-.07.69-.07h.37c.37 0 .55 0 .7.07.12.07.22.17.28.29.07.15.07.33.07.7v9.94c0 .37 0 .55-.07.7a.67.67 0 0 1-.28.29c-.15.07-.33.07-.7.07h-.37c-.37 0-.55 0-.69-.07a.67.67 0 0 1-.29-.29c-.07-.15-.07-.33-.07-.7V5.03Zm-4.25 2.69c0-.37 0-.55.07-.7a.67.67 0 0 1 .29-.28c.14-.08.32-.08.69-.08h.37c.37 0 .56 0 .7.08.12.06.22.16.29.28.07.15.07.33.07.7v7.25c0 .37 0 .55-.07.7a.67.67 0 0 1-.29.29c-.14.07-.33.07-.7.07h-.37c-.37 0-.55 0-.69-.07a.67.67 0 0 1-.29-.29c-.07-.15-.07-.33-.07-.7V7.72Zm-4.26 3.1c0-.37 0-.55.08-.7a.67.67 0 0 1 .28-.28c.15-.08.33-.08.7-.08h.37c.37 0 .55 0 .69.08.13.06.23.16.29.28.07.15.07.33.07.7v4.15c0 .37 0 .55-.07.7a.67.67 0 0 1-.29.29c-.14.07-.32.07-.69.07h-.37c-.37 0-.55 0-.7-.07a.67.67 0 0 1-.28-.29c-.08-.15-.08-.33-.08-.7v-4.15Zm-4.25 2.27c0-.37 0-.56.07-.7a.67.67 0 0 1 .29-.29c.14-.07.33-.07.7-.07h.37c.37 0 .55 0 .69.07.12.07.22.17.29.29.07.14.07.33.07.7v1.88c0 .37 0 .55-.07.7a.67.67 0 0 1-.29.29c-.14.07-.32.07-.69.07h-.37c-.37 0-.56 0-.7-.07a.67.67 0 0 1-.29-.29c-.07-.15-.07-.33-.07-.7v-1.88Z"/></svg>',
    wifi:'<svg width="20" height="20" viewBox="-1.97 -4.21 20 20"><g opacity=".75" fill="currentColor"><path d="M7.8 11.54c-.14-.05-.27-.18-.52-.45L5.93 9.71c-.17-.18-.26-.27-.29-.4a.6.6 0 0 1 .03-.32c.06-.12.15-.17.32-.29a4.1 4.1 0 0 1 4.07-.04c.17.11.26.17.32.29a.6.6 0 0 1 .04.33c-.03.12-.12.21-.3.4l-1.38 1.42c-.25.26-.38.39-.53.44a.6.6 0 0 1-.4 0Z"/><path d="M3.7 7.41c.2.2.29.29.39.33.1.04.17.04.27.02.1-.02.23-.11.47-.3a6.43 6.43 0 0 1 7.6-.03c.25.18.37.27.47.29.1.02.18.01.27-.02.1-.04.19-.13.38-.33l.57-.6c.18-.19.28-.28.31-.4a.6.6 0 0 0-.02-.31c-.05-.11-.14-.19-.33-.34a7.87 7.87 0 0 0-9.71.05c-.19.15-.28.22-.32.34a.6.6 0 0 0-.02.31c.03.12.12.21.3.4l.58.59Z"/><path d="M14.05 4.51c.22.19.34.28.44.3.1.03.19.02.28-.01.1-.04.2-.13.38-.33l.58-.59c.18-.19.28-.29.31-.4a.6.6 0 0 0-.01-.3c-.05-.12-.14-.2-.33-.36A12.4 12.4 0 0 0 .35 2.87c-.18.16-.28.24-.32.35a.6.6 0 0 0-.01.31c.03.11.12.21.3.4l.58.59c.19.2.28.29.38.33.1.03.19.04.28.01.1-.02.22-.12.44-.3a9.39 9.39 0 0 1 12.05-.05Z"/></g></svg>',
    batt:'<svg width="28" height="20" viewBox="-2.5 -3.88 28 20"><path opacity=".75" fill="currentColor" d="M15.73 0c2.07 0 3.11 0 3.9.4.7.36 1.27.93 1.62 1.62.2.39.3.83.35 1.43.02.23.03.34.08.42l.06.06c.07.06.2.08.47.13.09.02.16.04.23.07.19.1.35.25.44.44.11.22.11.5.11 1.07v.95c0 .57 0 .85-.11 1.07a1.1 1.1 0 0 1-.44.44 1 1 0 0 1-.23.07c-.27.05-.4.08-.47.13l-.06.07c-.05.07-.06.19-.08.42-.05.6-.15 1.04-.35 1.43a3.7 3.7 0 0 1-1.62 1.62c-.79.4-1.83.4-3.9.4h-9.8c-2.08 0-3.12 0-3.91-.4A3.7 3.7 0 0 1 .4 10.22C0 9.42 0 8.39 0 6.31v-.38c0-2.08 0-3.12.4-3.91A3.7 3.7 0 0 1 2.02.4C2.81 0 3.85 0 5.93 0h9.8ZM9.96 2.25c-.89 0-1.57.33-2.04.99-.48.66-.71 1.61-.71 2.86 0 1.26.23 2.21.71 2.87.47.65 1.15.98 2.04.98.88 0 1.56-.33 2.04-.98.47-.66.7-1.61.7-2.87 0-1.25-.23-2.2-.7-2.86-.48-.66-1.16-.99-2.04-.99Zm6.42 0c-.89 0-1.57.33-2.04.99-.48.66-.71 1.61-.71 2.86 0 1.26.23 2.21.71 2.87.47.65 1.15.98 2.04.98.88 0 1.56-.33 2.04-.98.47-.66.71-1.61.71-2.87 0-1.25-.24-2.2-.71-2.86-.48-.66-1.16-.99-2.04-.99ZM4.39 2.39l-1.88.97v1.53l1.63-.85v5.78h1.47V2.39H4.39Zm5.57 1.24c.4 0 .7.21.91.63.21.42.32 1.03.32 1.84 0 .81-.11 1.43-.32 1.84-.21.42-.51.63-.91.63s-.71-.21-.92-.63c-.21-.41-.32-1.03-.32-1.84 0-.81.11-1.42.32-1.84.21-.42.52-.63.92-.63Zm6.42 0c.4 0 .7.21.91.63.21.42.32 1.03.32 1.84 0 .81-.11 1.43-.32 1.84-.21.42-.51.63-.91.63s-.71-.21-.92-.63c-.21-.41-.32-1.03-.32-1.84 0-.81.11-1.42.32-1.84.21-.42.52-.63.92-.63Z"/></svg>',
    months:'<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4.6" y="5.6" width="18.8" height="15.6" rx="4.2" stroke="#ffbb0f" stroke-width="2.2"/><path d="M5 9.4h18" stroke="#ffbb0f" stroke-width="2.1"/><rect x="8.2" y="12.2" width="11.6" height="2.1" rx="1.05" fill="#ffbb0f"/><rect x="8.2" y="16" width="7" height="2.1" rx="1.05" fill="#ffbb0f"/></svg>',
    spark:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c.5 4.9 4.6 9 9.5 9.5-4.9.5-9 4.6-9.5 9.5-.5-4.9-4.6-9-9.5-9.5 4.9-.5 9-4.6 9.5-9.5Z"/></svg>',
    check:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    bell:'<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" fill-opacity="1" d="M8.27 2.94a5.23 5.23 0 0 1 3.32 9.01l.86 1.32c.12.18.17.27.17.34a.25.25 0 0 1-.09.16c-.06.04-.16.04-.37.04h-.22c-.14 0-.2 0-.27-.02a.43.43 0 0 1-.15-.08c-.05-.04-.09-.1-.17-.22l-.59-.9A5.2 5.2 0 0 1 8 13.39l-.27-.01a5.2 5.2 0 0 1-2.5-.79l-.59.91c-.08.11-.11.17-.16.21a.43.43 0 0 1-.15.08c-.06.02-.13.02-.27.02h-.22c-.21 0-.31 0-.37-.04a.25.25 0 0 1-.09-.16c0-.07.05-.16.17-.34l.86-1.32A5.23 5.23 0 0 1 8 2.94l.27 0ZM8 4.08a4.08 4.08 0 1 0 0 8.16 4.08 4.08 0 0 0 0-8.16Zm0 1.11c.18 0 .27 0 .34.04.06.03.12.08.15.15.03.07.03.16.03.34v2.24h1.63c.18 0 .27 0 .34.04.06.03.12.08.15.15.03.07.03.16.03.34 0 .17 0 .26-.03.33a.33.33 0 0 1-.15.16c-.07.03-.16.03-.34.03H8c-.18 0-.27 0-.34-.03a.33.33 0 0 1-.15-.16c-.03-.07-.03-.16-.03-.34V5.72c0-.18 0-.27.03-.34a.33.33 0 0 1 .15-.15c.07-.04.16-.04.34-.04ZM2.8 3.14a1.74 1.74 0 0 1 2.86-1.04c.06.06.1.08.1.13.02.03.02.08 0 .11-.01.05-.05.07-.13.13L3.27 4.18c-.07.05-.11.08-.16.08-.04 0-.08-.01-.11-.03-.04-.03-.05-.06-.08-.14-.13-.29-.17-.62-.12-.95Zm8.4-1.44a1.74 1.74 0 0 1 1.88 2.39c-.03.08-.05.11-.08.14-.03.02-.08.03-.11.03-.05 0-.09-.03-.16-.09l-2.36-1.7c-.08-.06-.12-.09-.13-.13a.18.18 0 0 1 0-.12c.01-.04.04-.07.1-.12.24-.21.54-.35.86-.4Z"/></svg>',
    note16:'<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M11.03 14.05c-.33.04-.88.05-1.64.05H4.75c-.38 0-.66 0-.83-.02a1 1 0 0 1-.41-.11 1 1 0 0 1-.48-.48 1.15 1.15 0 0 1-.11-.42c-.01-.16-.01-.43-.01-.82V5.6c0-.77.01-1.32.04-1.65.03-.33.11-.6.23-.84.2-.4.51-.72.94-.95.24-.12.52-.19.85-.21.33-.03.87-.05 1.63-.05h4.65c.38 0 .65.01.81.03.17 0 .31.04.42.1.22.11.38.27.48.48.06.11.09.25.1.42.01.16.02.43.02.82v6.66c0 .77-.02 1.32-.05 1.64-.02.33-.1.61-.22.84-.2.41-.51.72-.95.95-.23.12-.51.19-.84.21ZM4.02 12.96c.06.07.15.11.29.11h5.62c.44 0 .76-.01.94-.02.2-.02.36-.06.48-.12.26-.14.44-.32.56-.55.07-.13.11-.29.13-.48.02-.19.02-.5.02-.94V3.43c0-.2-.03-.34-.1-.4-.05-.07-.18-.1-.38-.1H6.07c-.45 0-.77 0-.96.02-.18.02-.34.06-.48.12-.24.13-.42.31-.55.55-.06.13-.1.29-.12.48-.02.2-.02.51-.02.95v7.52c0 .19.03.31.08.39ZM8.71 11.02c-.06.05-.17.08-.31.08H5.77c-.14 0-.25-.03-.31-.08-.06-.06-.1-.15-.1-.29v-.28c0-.14.04-.24.1-.29.06-.05.17-.08.31-.08H8.4c.14 0 .24.03.3.08.07.05.11.14.11.27v.3c0 .14-.03.23-.1.29Zm1.83-5.19c-.07.06-.17.09-.3.09H5.75c-.12 0-.22-.03-.29-.09-.06-.05-.1-.15-.1-.29v-.3c0-.12.04-.2.1-.26.06-.06.16-.08.29-.08h4.49c.13 0 .23.02.3.08.06.05.09.14.09.26v.3c0 .14-.03.24-.09.29Zm0 2.61c-.07.05-.17.08-.3.08H5.75c-.12 0-.22-.03-.29-.08-.06-.06-.1-.16-.1-.29v-.3c0-.12.04-.21.1-.27.06-.05.16-.08.29-.08h4.49c.13 0 .23.03.3.08.06.05.09.14.09.27v.3c0 .13-.03.23-.09.29Z"/></svg>',
    chev:'<svg width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" fill-opacity=".4" d="M5.6 6.94a.85.85 0 0 0-.06 1.14l.06.07 4.14 4.14.07.06c.1.08.22.14.35.17a.85.85 0 0 0 .38 0c.13-.03.25-.09.35-.17l.07-.06 4.14-4.14.06-.07a.85.85 0 0 0-1.26-1.14l-3.55 3.55-3.55-3.55a.85.85 0 0 0-1.2 0Z"/></svg>',
    back:'<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M16.6 7.4 10 14l6.6 6.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    more:'<svg width="22" height="22" viewBox="0 0 22 22" fill="#1a1a1a"><circle cx="4.58" cy="11" r="1.6"/><circle cx="11" cy="11" r="1.6"/><circle cx="17.42" cy="11" r="1.6"/></svg>',
    cal:'<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4.67 1.17v2.33M9.33 1.17v2.33M2.92 2.33h8.16c.65 0 1.17.52 1.17 1.17v8.17c0 .64-.52 1.17-1.17 1.17H2.92c-.65 0-1.17-.53-1.17-1.17V3.5c0-.65.52-1.17 1.17-1.17ZM1.75 5.83h10.5" stroke="#48BD79" stroke-width="2" stroke-linecap="round"/></svg>',
    pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11 6.5 11Z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    car:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 13.5 6 9.2A2 2 0 0 1 7.9 8h8.2a2 2 0 0 1 1.9 1.2l1.5 4.3"/><rect x="3" y="13" width="18" height="5" rx="2"/><path d="M6.5 18v1.5M17.5 18v1.5"/><circle cx="7" cy="15.5" r=".8" fill="currentColor"/><circle cx="17" cy="15.5" r=".8" fill="currentColor"/></svg>',
    taxi:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 5.5h5l.8 2.5"/><path d="M4.5 13.5 6 9.2A2 2 0 0 1 7.9 8h8.2a2 2 0 0 1 1.9 1.2l1.5 4.3"/><rect x="3" y="13" width="18" height="5" rx="2"/><path d="M6.5 18v1.5M17.5 18v1.5"/></svg>',
    metro:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3.5" width="12" height="14" rx="3.5"/><path d="M6 11h12M9.5 3.5v3.2h5V3.5"/><circle cx="9.3" cy="14.2" r=".7" fill="currentColor"/><circle cx="14.7" cy="14.2" r=".7" fill="currentColor"/><path d="m8.5 21 1.5-3.5M15.5 21 14 17.5"/></svg>',
    pause:'<svg width="22" height="22" viewBox="0 0 24 24" fill="#1b1b1b"><rect x="6.5" y="5" width="3.6" height="14" rx="1.4"/><rect x="13.9" y="5" width="3.6" height="14" rx="1.4"/></svg>',
    cursor:'<svg viewBox="0 0 24 24" fill="#1b1b1b"><path d="M6 3.5 19 12l-6.2 1.3L9.6 19.5 6 3.5Z"/></svg>',
    pen:'<svg viewBox="0 0 24 24" fill="none" stroke="#1b1b1b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 18.5 9.5 9 19H5v-4l9.5-9.5Z"/><path d="M15 19h4M17 17v4" stroke-width="1.6"/></svg>',
    camera:'<svg viewBox="0 0 24 24" fill="none" stroke="#1b1b1b" stroke-width="2" stroke-linejoin="round"><path d="M4 8.5h3.2L9 6h6l1.8 2.5H20v10.5H4z"/><circle cx="12" cy="13.5" r="3.2"/></svg>',
    gift:'🎁', pkg:'📦'
  };
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function attrs(b){ var a=''; if(b.a) a+=' data-a="'+esc(b.a)+'"'; if(b.toast) a+=' data-toast="'+esc(b.toast)+'"'; if(b.sheet) a+=' data-sheet="'+esc(b.sheet)+'"'; if(b.focus) a+=' data-focus="'+esc(b.focus)+'"'; return a; }
  function btn(b,cls){ if(typeof b==='string') b={t:b}; return '<button class="'+(cls||'gb')+(b.k?' '+b.k:'')+'"'+attrs(b)+'>'+esc(b.t)+'</button>'; }
  function btns(list,cls,wrap){ if(!list||!list.length) return ''; return '<div class="'+(wrap||'gbtns')+'">'+list.map(function(b){return btn(b,cls);}).join('')+'</div>'; }
  function box(done){ return '<span class="box">'+(done?I.check:'')+'</span>'; }
  function ckRow(it,sm){
    if(typeof it==='string') it={t:it};
    return '<div class="ck'+(it.done?' done':'')+(sm?' sm':'')+'"'+(it.id?' data-ck="'+esc(it.id)+'"':'')+'>'+box(it.done)+'<div class="ct"><b>'+esc(it.t)+'</b>'
      +(it.rm?'<s class="rm">'+esc(it.rm)+I.bell+'</s>':'')+'</div></div>';
  }
  function wrap(spec,inner,extra){
    var st='';
    if(spec.where==='neg'){ st=' style="left:'+(spec.x!=null?spec.x:12)+'px;top:'+(spec.y!=null?spec.y:239)+'px;width:'+(spec.w||368)+'px"'; }
    return '<div class="gcard '+(extra||'')+(spec.tone?' '+spec.tone:'')+'" data-type="'+spec.type+'"'+st+'>'+inner+'</div>';
  }
  var R={
    check:function(s){
      var hd=s.title?'<div class="gc-hd'+(s.icon==='spark'?' spark':'')+'"><span class="gi">'+(s.icon==='spark'?I.spark:I.months)+'</span><b>'+esc(s.title)+'</b>'+(s.rt?'<span class="rt">'+esc(s.rt)+'</span>':'')+'</div>':'';
      return wrap(s,hd+'<div class="gc-list">'+(s.items||[]).map(function(it){return ckRow(it,s.sm);}).join('')+'</div>'+btns(s.btns),'ckc');
    },
    sug:function(s){
      var lb='<div class="sg-lb"><img src="'+BASE+'bulb.png" alt=""><span>'+esc(s.label||'关键建议')+'</span></div>';
      var rows=s.rows?'<div class="sg-rows">'+s.rows.map(function(r){return '<div class="sg-row"><span class="tg'+(r.pl?' pl':'')+'">'+esc(r.tag)+'</span><span>'+r.t+'</span></div>';}).join('')+'</div>':'';
      return wrap(s,lb+(s.title?'<h4'+(s.lg?' class="lg"':'')+'>'+esc(s.title)+'</h4>':'')+(s.desc?'<p class="ds">'+esc(s.desc)+'</p>':'')+rows+btns(s.btns),'sgc');
    },
    notif:function(s){
      var it='';
      if(s.item){ var m=s.item;
        it='<div class="nf-item">'+(m.img?'<img class="th" src="'+BASE+m.img+'" alt="">':'<span class="th em">'+esc(m.em||'📦')+'</span>')
          +'<div class="tx"><b>'+esc(m.t)+'</b><s>'+esc(m.s||'')+'</s></div>'+(m.btn?btn(m.btn,'gb sm'):'')+'</div>'; }
      return wrap(s,'<h4>'+esc(s.title)+'</h4>'+(s.desc?'<p class="ds">'+esc(s.desc)+'</p>':'')+it+btns(s.btns),'notif');
    },
    upnext:function(s){
      var t='<div class="tiles">'+(s.tiles||[]).map(function(x){return '<div><s>'+esc(x[0])+'</s><b>'+esc(x[1])+'</b></div>';}).join('')+'</div>';
      return wrap(s,'<h4 class="lg">'+esc(s.title)+'</h4>'+t+(s.btn?btn(s.btn,'gb wide'):''),'upnext');
    },
    rec:function(s){
      return wrap(s,'<div class="rec"><div class="rt"><b>'+esc(s.title||'笔记录音中')+'</b><s class="rtime">'+esc(s.time||'06:23')+'</s></div>'
        +'<button class="pz" data-toast="已暂停录音，再点一次继续">'+I.pause+'</button><button class="st" data-toast="录音已结束，正在整理成课堂笔记 ✨"><i></i></button></div>'
        +'<div class="tools"><button class="gb" data-toast="已在当前位置打上标记 📍">'+I.cursor+'</button><button class="gb" data-toast="已切到手写批注">'+I.pen+'</button><button class="gb" data-toast="已打开相机，拍下的内容会插到这段录音旁">'+I.camera+'</button></div>','recc');
    },
    flight:function(s){
      var vis=s.img==='train'?'<span class="tr">🚄</span>':'<img src="'+BASE+'plane.png" alt="">';
      return wrap(s,'<div class="fd">'+esc(s.date)+'<em>丨</em><i>'+esc(s.status||'待出行')+'</i></div>'
        +'<div class="fl"><b>'+esc(s.dep[0])+'</b>'+vis+'<b>'+esc(s.arr[0])+'</b></div>'
        +'<div class="fp"><span>'+esc(s.dep[1])+'</span><span>'+esc(s.no||'')+'</span><span>'+esc(s.arr[1])+'</span></div><div class="fline"></div>'
        +'<div class="stats">'+(s.stats||[]).map(function(x){return '<div class="st"><b>'+esc(x[0])+'</b><s>'+esc(x[1])+'</s></div>';}).join('')+'</div>'
        +btns(s.btns,'fb','fbtns'),'flt');
    },
    hotel:function(s){
      var tip=s.tip?'<div class="tip"><div class="tl">🏡 '+esc(s.tip.label||'温馨提示')+'</div><p>'+esc(s.tip.text)+'</p>'+(s.tip.mini?'<div class="mini">'+s.tip.mini.map(function(b,i){return btn(b,'fb'+(i===0?' g':''));}).join('')+'</div>':'')+'</div>':'';
      return wrap(s,'<div class="hh"><img src="'+BASE+(s.img||'hotel.jpg')+'" alt=""><div><b>'+esc(s.name)+'</b><s>'+esc(s.dates)+'</s></div></div>'
        +(s.loc?'<div class="loc">'+I.pin+esc(s.loc)+'</div>':'')+btns(s.btns,'fb','fbtns')+tip,'hotel');
    },
    taxi:function(s){
      var st='<div class="tst">'+(s.stats||[]).map(function(x){return '<div class="'+(x[2]||'')+'"><b>'+esc(x[0])+'</b><s>'+esc(x[1])+'</s></div>';}).join('')+'</div>';
      var op='<div class="opts">'+(s.opts||[]).map(function(o){return '<div class="'+(o[3]?'on':'')+'">'+(I[o[0]]||I.car)+esc(o[1])+' <i>'+esc(o[2])+'</i></div>';}).join('')+'</div>';
      return wrap(s,'<h4>'+esc(s.title)+'</h4><div class="tw"><img src="'+BASE+(s.img||'route-map.jpg')+'" alt="">'+st+'</div>'+op+btns(s.btns,'gb'),'taxi');
    },
    moments:function(s){
      return wrap(s,'<h4>'+esc(s.title)+'</h4><div class="when">'+I.clock+esc(s.when)+'</div><div class="ph">'+(s.photos||[]).map(function(p){return '<img src="'+BASE+p+'" alt="">';}).join('')+'</div>'
        +(s.btn?btn(s.btn,'gb wide'):''),'moments');
    },
    widgets:function(s){
      var L=s.left||{}, Rr=s.right||{};
      var st=s.where==='neg'?' style="position:absolute;left:'+(s.x!=null?s.x:24)+'px;top:'+(s.y!=null?s.y:271)+'px"':'';
      return '<div class="wpair" data-type="widgets"'+st+'><div class="w-blue"><s>'+esc(L.label)+'</s><span class="big">'+esc(L.big)+'</span><b>'+esc(L.title)+'</b><em>'+esc(L.sub)+'</em></div>'
        +'<div class="w-sug"><s>'+esc(Rr.label)+'</s><span class="big">'+esc(Rr.big)+'</span><p>'+esc(Rr.desc)+'</p>'+(Rr.btn?btn(Rr.btn,'gb pri'):'')+'</div></div>';
    }
  };
  R.todo=function(s){ var c={}; for(var k in s) c[k]=s[k]; c.type='check'; return R.check(c).replace('data-type="check"','data-type="todo"'); };
  function render(spec,opt){
    if(!spec) return '';
    var s={}; for(var k in spec) s[k]=spec[k]; s.where=(opt&&opt.where)||'lp';
    var f=R[s.type]; return f?f(s):'';
  }
  window.OS5Cards={render:render,icons:I,esc:esc,btn:btn,ckRow:ckRow,base:BASE};
})();
