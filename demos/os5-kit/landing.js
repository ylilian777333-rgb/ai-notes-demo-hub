/* OS5 场景落地页渲染器：一个页面 = 头图 + 标题 + 日期胶囊 + 按阶段排序的内容块。
   页面只需在引入本文件前定义 window.OS5_PAGE：
     {scene:'travel', title:'稻城亚丁旅行', t32:true, chip:'6月10日 - 6月14日',
      hero:{photo:'hero-daocheng.jpg'} | {grad:'linear-gradient(...)', illus:'illus-course.webp'}, more:true, secC:false,
      top:{2:{...卡片 spec}},                 // 某阶段落地页置顶卡片与负一屏不同（Figma 中有差异时）
      blocks:{key:{t:'机票行程', em:'✈️', rt:'', h:function(i,stage){return html}}},
      order:[['top','flights',...], ...]}     // 每个阶段的内容块顺序（Figma「动态置顶」）
   阶段来源：?s=N；父页面 postMessage({os5stage:N})；单独打开时设备下方出现阶段条。 */
/* ---------- 内容块组件（页面的 blocks.h 里调用）---------- */
window.OS5L=(function(){
  var C=window.OS5Cards, I=C.icons, E=C.esc, A=C.base;
  function btns(list,cls){ return list&&list.length?'<div class="fbtns">'+list.map(function(b){ return C.btn(b,cls||'fb'); }).join('')+'</div>':''; }
  return {
    /* 行程计划：[{d:'6月10日 · 周三', rows:[['08:20','✈️','成都 → 稻城亚丁','tag'],...]}]；st: {'0-1':'done','1-0':'now'} */
    plan:function(days,st){ st=st||{};
      return '<div class="card plan">'+days.map(function(d,di){ return '<div class="dh">'+E(d.d)+'</div>'+d.rows.map(function(r,ri){ var k=st[di+'-'+ri]||'';
        return '<div class="pr '+k+'"><span class="t">'+E(r[0])+'</span><span class="c">'+(r[1]?r[1]+' ':'')+'<span class="x">'+E(r[2])+'</span>'+(r[3]?'<span class="tag">'+E(r[3])+'</span>':'')+'</span></div>'; }).join(''); }).join('')+'</div>'; },
    /* 待办：[{t,rm,done}] */
    todo:function(items,opt){ opt=opt||{}; return '<div class="card'+(opt.glass?' gcard':'')+'" style="padding:6px 15px">'+items.map(function(it){ return C.ckRow(it,true); }).join('')+(opt.btns?'<div class="gbtns" style="margin:6px 0 10px">'+opt.btns.map(function(b){return C.btn(b,'gb');}).join('')+'</div>':'')+'</div>'; },
    /* 列表：[{em,bg,t,p,r,rc,src,btn,done}] */
    list:function(rows){ return '<div class="card" style="padding:4px 15px">'+rows.map(function(r){
      return '<div class="li'+(r.done?' done':'')+'"><span class="lm" style="'+(r.bg?'background:'+r.bg:'')+'">'+(r.em||'')+'</span><div class="lc"><b>'+E(r.t)+'</b>'+(r.p?'<p>'+E(r.p)+'</p>':'')+(r.src?'<span class="src">'+E(r.src)+'</span>':'')+'</div>'
        +(r.btn?C.btn(r.btn,'fb'+(r.btn.k?' '+r.btn.k:'')):(r.r?'<span class="lr '+(r.rc||'')+'">'+E(r.r)+'</span>':''))+'</div>'; }).join('')+'</div>'; },
    kv:function(rows,note){ return '<div class="card" style="padding:6px 15px">'+rows.map(function(r){ return '<div class="kv"><span class="k">'+E(r[0])+'</span><span class="v">'+E(r[1])+'</span></div>'; }).join('')+'</div>'+(note?'<div class="src" style="margin:8px 4px 0">'+E(note)+'</div>':''); },
    coll:function(t,n,img){ return '<div class="coll"><div><b>'+E(t)+'</b><s>'+I.note16+E(n)+'</s></div>'+(img?'<img class="ph" src="'+A+img+'" alt="">':'<div class="cv"><span>'+E(t.replace(/（.*/,''))+'</span><i>∑</i></div>')+'</div>'; },
    /* 白底航班/车次卡（落地页「机票行程」）*/
    flightCard:function(f){
      var vis=f.img==='train'?'<span class="tr">🚄</span>':'<img src="'+A+'plane.png" alt="">';
      var dep=f.depart?'<div class="depart"><div class="dl"><i>✦</i><span>'+E(f.depart.t||'设置出发提醒')+'</span></div><div class="dm"><img src="'+A+(f.depart.img||'route-map.jpg')+'" alt=""><div><b>'+E(f.depart.b)+'</b><s>'+E(f.depart.s)+'</s><em>'+E(f.depart.e)+'</em></div></div>'
        +btns([{t:'查看路线'},{t:'设置提醒',k:'pri',toast:f.depart.toast||'已设置出发提醒，到点通知你 🔔'}])+'</div>':'';
      return '<div class="card flt"><div class="fd">'+E(f.date)+'<em>丨</em><i>'+E(f.status||'待出行')+'</i></div>'
        +'<div class="fl"><b>'+E(f.dep[0])+'</b>'+vis+'<b>'+E(f.arr[0])+'</b></div><div class="fp"><span>'+E(f.dep[1])+'</span><span>'+E(f.no)+'</span><span>'+E(f.arr[1])+'</span></div><div class="fline"></div>'
        +'<div class="stats">'+f.stats.map(function(x){ return '<div class="st"><b>'+E(x[0])+'</b><s>'+E(x[1])+'</s></div>'; }).join('')+'</div>'+btns(f.btns||[{t:'准点分析'},{t:'行程详情'}])+dep+'</div>'; },
    hotelCard:function(h){ var c=C.render({type:'hotel',img:h.img,name:h.name,dates:h.dates,loc:h.loc,btns:h.btns,tip:h.tip},{where:'lp'});
      return c.replace('class="gcard hotel"','class="card hotel"'); },
    weather:function(w){ return '<div class="weather"><div class="w1"><div><s>'+E(w.city)+'</s><b>'+E(w.temp)+'</b></div><div class="r"><i>'+w.icon+'</i>'+E(w.desc)+'<br>'+E(w.range)+'</div></div>'
      +'<div class="hrs">'+w.hours.map(function(h){ return '<div>'+E(h[0])+'<i>'+h[1]+'</i>'+E(h[2])+'</div>'; }).join('')+'</div></div>'; },
    xhs:function(rows){ return '<div class="xbox">'+rows.map(function(r){ return '<div class="xrow"><div class="xc"><b>'+E(r.t)+'</b><p>'+E(r.p)+'</p><div class="xm"><span class="lg">小红书</span>小红书<span class="hs">'+E(r.tags)+'</span></div></div><img src="'+A+r.img+'" alt=""></div>'; }).join('')
      +'<button class="sbtn" style="margin:10px 0 0;background:rgba(255,255,255,.7)">查看更多</button></div>'; },
    kps:function(t,rows){ return '<div class="card kpc"><h5>'+E(t)+I.chev.replace('<svg','<svg style="transform:rotate(-90deg)"')+'</h5><div class="div"></div>'+rows.map(function(r){ return '<div class="kp"><i></i><span>'+E(r)+'</span>'+I.chev+'</div>'; }).join('')+'<button class="sbtn">查看更多</button></div>'; },
    notes:function(rows){ return '<div class="card" style="padding:4px 15px">'+rows.map(function(r){ return '<div class="note"><b>'+E(r[0])+'</b><p>'+E(r[1])+'</p></div>'; }).join('')+'</div>'; },
    raw:function(h){ return h; }
  };
})();

(function(){
  var P=window.OS5_PAGE, D=window.OS5_SCENES, C=window.OS5Cards, I=C.icons;
  var SC=D.scenes[P.scene], ST=SC.stages, A=C.base;
  var inFrame=(window.parent!==window);
  if(/OS5SceneDemo/.test(navigator.userAgent)||/[?&]apk=1/.test(location.search)) document.documentElement.classList.add('apk');
  var m=/[?&]s=(\d+)/.exec(location.search), cur=m&&ST[+m[1]]?+m[1]:(P.base||0);

  /* ---------- 骨架 ---------- */
  var hero=P.hero||{};
  var heroHtml=hero.photo?'<div class="lp-hero photo" style="background-image:url('+A+hero.photo+')"></div>'
    :'<div class="lp-hero" style="background:'+(hero.grad||'linear-gradient(180deg,#a38fff 0%,rgba(233,242,239,0) 93.79%)')+'"></div>';
  var illus=hero.illus?'<img class="lp-illus" src="'+A+hero.illus+'" alt="">':'';
  document.title=P.title+' · 场景 AI App 落地页（OS5）';
  document.body.insertAdjacentHTML('afterbegin',(P.cap?'<div class="cap">'+P.cap+'</div>':'')
    +'<div class="device"><div class="screen"><div class="app lp" id="app">'+heroHtml+illus
    +'<div class="lp-head'+(P.t32?'':' tall')+'"><h1 class="htitle'+(P.t32?' t32':'')+'">'+C.esc(P.title)+'</h1><div class="chip'+(P.t32?' t32':'')+'">'+I.cal+'<span id="chipT">'+C.esc(P.chip||'')+'</span></div></div>'
    +'<div class="body" id="body"></div></div>'
    /* 状态栏与导航栏固定在屏幕顶部；上滑后出现底板与居中小标题（HyperOS 二级页行为） */
    +'<div class="lp-bar"></div>'
    +'<div class="sb"><div class="row"><span class="tm" id="sbt"></span><span class="ics">'+I.signal+I.wifi+I.batt+'</span></div></div>'
    +'<div class="nav"><button class="ib back" aria-label="返回">'+I.back+'</button><div class="ntitle">'+C.esc(P.title)+'</div>'+(P.more?'<button class="ib more" aria-label="更多" data-toast="可以分享、重命名或删除这个 AI App">'+I.more+'</button>':'<span></span>')+'</div>'
    +'<button class="fab" aria-label="问小爱"><img src="'+A+'ai-fab.svg" alt=""></button><div class="homebar"></div><div class="cutout"></div></div></div>');
  var bodyEl=document.getElementById('body'), appEl=document.getElementById('app'), scrEl=appEl.parentNode;
  appEl.addEventListener('scroll',function(){ scrEl.classList.toggle('scr',appEl.scrollTop>(P.t32?128:140)); },{passive:true});

  /* ---------- 内容块 ---------- */
  function sec(b){
    if(!b.t) return '';
    return '<div class="sec'+(P.secC?' c':'')+'"><span class="em">'+(b.em||'')+'</span>'+C.esc(b.t)+(b.rt?'<span class="rt">'+C.esc(b.rt)+'</span>':'')+'</div>';
  }
  function topCard(i){
    var spec=(P.top&&P.top[i])||ST[i].card;
    return C.render(spec,{where:'lp'});
  }
  function render(anim){
    var s=ST[cur], order=(P.order&&P.order[cur])||['top'], h='';
    order.forEach(function(k,idx){
      if(k==='top'){ h+='<div class="blk top" data-blk="top">'+topCard(cur)+'</div>'; return; }
      var b=P.blocks[k]; if(!b) return;
      var inner=typeof b.h==='function'?b.h(cur,s):b.h;
      if(inner==null||inner==='') return;
      h+='<div class="blk" data-blk="'+k+'">'+sec(b)+inner+'</div>';
    });
    bodyEl.innerHTML=h;
    if(P.chipAt&&P.chipAt[cur]) document.getElementById('chipT').textContent=P.chipAt[cur];
    document.getElementById('sbt').textContent=s.tm.replace(/^0/,'');
    /* 卡片上的 data-a 转成套件可识别的行为 */
    bodyEl.querySelectorAll('[data-a]').forEach(function(el){
      var a=el.getAttribute('data-a');
      if(a.indexOf('toast:')===0) el.setAttribute('data-toast',a.slice(6));
    });
    if(anim){
      var t=bodyEl.querySelector('.blk.top>*,.blk:first-child'); if(t){ t.classList.add('pop'); }
      if(appEl.scrollTop>40){ try{ appEl.scrollTo({top:0,behavior:'smooth'}); }catch(e){ appEl.scrollTop=0; } }
    }
    if(typeof P.after==='function') P.after(cur,s);
    renderChips();
  }
  function setStage(n,anim,fromChild){
    if(!ST[n]) return; cur=n; render(anim);
    try{ if(!inFrame) history.replaceState(null,'','?s='+n); }catch(e){}
    if(fromChild&&inFrame){ try{ parent.postMessage({os5setstage:n},'*'); }catch(e){} }
  }
  window.os5stage=function(n){ setStage(n,true); };

  /* ---------- 阶段条（单独打开时）---------- */
  function renderChips(){
    if(inFrame) return;
    var w=document.querySelector('.k-stages');
    if(!w){ var dev=document.querySelector('.device'); w=document.createElement('div'); w.className='k-stages'; dev.parentNode.insertBefore(w,dev.nextSibling);
      w.addEventListener('click',function(e){ var b=e.target.closest('button[data-i]'); if(b) setStage(+b.getAttribute('data-i'),true); }); }
    w.innerHTML='<span class="k-sl">切换时间阶段 · 同一个 AI App 在不同时刻的状态（与负一屏卡片一一对应）</span>'
      +ST.map(function(s,j){ return '<button data-i="'+j+'" class="'+(j===cur?'on':'')+'">'+(j+1)+'. '+s.k+'<i>'+s.tm+'</i></button>'; }).join('');
  }

  /* ---------- 交互：先于通用套件处理 ---------- */
  window.addEventListener('click',function(e){
    var t=e.target; if(!t.closest) return;
    var bk=t.closest('.back');
    if(bk){ e.stopPropagation(); if(inFrame) parent.postMessage('close-landing','*'); else history.length>1?history.back():null; return; }
    var a=t.closest('[data-a^="stage:"]');
    if(a){ e.stopPropagation(); e.preventDefault(); setStage(+a.getAttribute('data-a').slice(6),true,true); if(window.os5toast&&P.stageToast) window.os5toast(P.stageToast); return; }
    var f=t.closest('[data-focus]');
    if(f){ e.stopPropagation(); e.preventDefault(); var el=bodyEl.querySelector('[data-blk="'+f.getAttribute('data-focus')+'"]'); if(el&&window.os5focus) window.os5focus(el,f.getAttribute('data-msg')||''); return; }
    var bx=t.closest('.ck .box');
    if(bx){ var r=bx.parentElement; r.classList.toggle('done'); bx.innerHTML=r.classList.contains('done')?I.check:''; e.stopPropagation(); return; }
  },true);
  window.addEventListener('message',function(e){ var d=e.data; if(d&&typeof d==='object'&&d.os5stage!=null){ var n=+d.os5stage;
    /* 从负一屏重新打开：像原生页面一样回到顶部 */
    if(d.init){ appEl.scrollTop=0; scrEl.classList.remove('scr'); }
    if(ST[n]&&n!==cur) setStage(n,!d.init); } });

  /* 系统返回键：先关弹层 */
  window.os5back=function(){ var sh=document.querySelector('.k-sheet.open'); if(sh){ var x=sh.querySelector('.k-x'); if(x) x.click(); return 'handled'; } return 'finish'; };

  render(false);
  var ym=/#y=(\d+)/.exec(location.hash); if(ym) setTimeout(function(){ appEl.scrollTop=+ym[1]; },60);
})();
