/* OS5 落地页通用交互套件 v2
   1) 二级操作：toast / 二级页 sheet / 拍照识别 / 问小爱，所有按钮和行都有对应反馈
   2) 阶段引擎：同一个落地页在不同时间阶段展示不同状态
      - URL ?s=N 指定阶段；父页面（负一屏合集）postMessage({os5stage:N}) 实时切换
      - 单独打开页面时，设备下方出现阶段切换条
   页面可在引入本文件之前定义：
     window.OS5_STAGES = [{k:'早晨', t:'07:50', set:{选择器:html}, cls:{选择器:'追加 class'}, tl:['done','now:下一件',''], ck:[1,0]}]
     window.OS5_STAGE_BASE = 0   // 没有 ?s= 时的默认阶段
     window.OS5_ACC = '#3a7afe'  // 进行中项目的强调色
     window.OS5_DONE / OS5_NOW   // 时间轴默认状态文字
     window.OS5_SHEETS = {key:{t:'标题', h:'html', a:['次按钮','主按钮'], at:['次提示','主提示'], cam:true}}  // 元素上写 data-sheet="key"
     window.OS5_ACTIONS = [[/正则/, 'toast 文本' 或 'sheet:key']]   // 按按钮文字匹配，优先于默认规则 */
(function(){
  if(window.__os5kit) return; window.__os5kit = true;

  var CHECK='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  /* ---------- 样式 ---------- */
  var css = ''
  + 's{text-decoration:none}'
  + '.k-toast{position:absolute;left:50%;bottom:112px;transform:translateX(-50%);z-index:130;background:rgba(28,28,30,.94);color:#fff;font-size:13.5px;font-weight:500;padding:11px 18px;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.32);max-width:84%;text-align:center;display:flex;align-items:center;gap:8px;animation:ktin .22s ease;line-height:1.45}'
  + '@keyframes ktin{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}'
  + '.k-sheet{position:absolute;inset:0;z-index:120;pointer-events:none}'
  + '.k-sheet .k-bg{position:absolute;inset:0;background:rgba(0,0,0,.35);opacity:0;transition:opacity .28s}'
  + '.k-sheet .k-panel{position:absolute;left:0;right:0;bottom:0;max-height:88%;background:#f4f5f8;border-radius:26px 26px 0 0;transform:translateY(101%);transition:transform .34s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;box-shadow:0 -12px 44px rgba(0,0,0,.22)}'
  + '.k-sheet.open{pointer-events:auto}.k-sheet.open .k-bg{opacity:1}.k-sheet.open .k-panel{transform:translateY(0)}'
  + '.k-grab{width:38px;height:5px;border-radius:3px;background:#d6d6da;margin:9px auto 2px}'
  + '.k-hd{display:flex;align-items:center;gap:10px;padding:8px 20px 12px}'
  + '.k-hd b{font-size:18px;font-weight:650;color:#17171b;flex:1;line-height:1.3}'
  + '.k-x{width:30px;height:30px;border-radius:50%;border:none;background:rgba(0,0,0,.06);color:#666;font-size:15px;cursor:pointer;flex-shrink:0;line-height:1}'
  + '.k-body{overflow-y:auto;padding:0 20px 26px;scrollbar-width:none}.k-body::-webkit-scrollbar{display:none}'
  + '.k-card{background:#fff;border-radius:16px;padding:14px 16px;margin-bottom:12px}'
  + '.k-card>.t{font-size:15px;font-weight:650;color:#1b1b1b;margin-bottom:8px;display:block}'
  + '.k-card p{font-size:14px;line-height:1.72;color:#595959}'
  + '.k-note{font-size:12px;color:#9a9ea6;margin:-4px 2px 12px;display:flex;align-items:center;gap:6px}'
  + '.k-note:before{content:"";width:5px;height:5px;border-radius:50%;background:#c8ccd2;flex-shrink:0}'
  + '.k-bul{display:flex;gap:9px;font-size:14px;color:#3a3a3a;line-height:1.6;padding:6px 0}'
  + '.k-bul i{width:6px;height:6px;border-radius:50%;background:var(--k-acc,#3a7afe);flex-shrink:0;margin-top:8px}'
  + '.k-kv{display:flex;justify-content:space-between;gap:12px;font-size:14px;padding:10px 0}'
  + '.k-kv+.k-kv{border-top:1px solid #eee}.k-kv .k{color:#8a8a8a;flex-shrink:0}.k-kv .v{font-weight:600;color:#1b1b1b;text-align:right}'
  + '.k-code{text-align:center;font-size:30px;font-weight:700;letter-spacing:4px;color:#2068c0;padding:10px 0 4px}'
  + '.k-bars{display:flex;gap:4px;justify-content:center;padding:8px 0 2px}.k-bars i{width:3px;height:34px;background:#1b1b1b}.k-bars i:nth-child(2n){height:22px}.k-bars i:nth-child(3n){width:6px}'
  + '.k-map{height:120px;border-radius:14px;margin-bottom:12px;background:linear-gradient(120deg,#cfe0d2,#bcd2e6);position:relative;overflow:hidden}'
  + '.k-map:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.35) 0 2px,transparent 2px 38px),repeating-linear-gradient(0deg,rgba(255,255,255,.35) 0 2px,transparent 2px 34px)}'
  + '.k-map:after{content:"";position:absolute;left:14%;top:66%;width:72%;height:4px;background:#2f9e6a;border-radius:3px;transform:rotate(-16deg);box-shadow:0 0 0 4px rgba(47,158,106,.18)}'
  + '.k-act{display:flex;gap:10px;margin-top:2px}'
  + '.k-act button{flex:1;height:44px;border:none;border-radius:13px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;background:#eceef2;color:#444}'
  + '.k-act button.p{background:linear-gradient(135deg,#3a7afe,#6a5bff);color:#fff}'
  + '.k-cam{height:230px;border-radius:18px;background:linear-gradient(160deg,#2b2f36,#16181c);position:relative;overflow:hidden;margin-bottom:12px}'
  + '.k-cam .doc{position:absolute;left:18%;right:18%;top:14%;bottom:14%;background:#f4f1ea;border-radius:6px;transform:rotate(-3deg);box-shadow:0 8px 24px rgba(0,0,0,.4)}'
  + '.k-cam .doc i{display:block;height:6px;border-radius:3px;background:#d2cdc2;margin:14px 14px 0}.k-cam .doc i:nth-child(2n){width:58%}'
  + '.k-cam .cn{position:absolute;width:26px;height:26px;border:3px solid #fff;opacity:.9}'
  + '.k-cam .c1{left:12%;top:9%;border-right:none;border-bottom:none;border-radius:8px 0 0 0}.k-cam .c2{right:12%;top:9%;border-left:none;border-bottom:none;border-radius:0 8px 0 0}'
  + '.k-cam .c3{left:12%;bottom:9%;border-right:none;border-top:none;border-radius:0 0 0 8px}.k-cam .c4{right:12%;bottom:9%;border-left:none;border-top:none;border-radius:0 0 8px 0}'
  + '.k-cam .scan{position:absolute;left:12%;right:12%;height:2px;background:linear-gradient(90deg,transparent,#6ee7c8,transparent);box-shadow:0 0 12px #6ee7c8;animation:kscan 1.1s ease-in-out infinite alternate;top:12%}'
  + '@keyframes kscan{to{top:86%}}'
  + '.k-cam .lb{position:absolute;left:0;right:0;bottom:12px;text-align:center;color:#fff;font-size:13px;font-weight:600;letter-spacing:.5px}'
  + '.k-ok{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#1f9e6a;margin:0 2px 10px}'
  + '.k-chat{display:flex;flex-direction:column;gap:11px;padding-top:4px}'
  + '.k-msg{max-width:85%;padding:11px 14px;border-radius:16px;font-size:14px;line-height:1.6}'
  + '.k-msg.ai{align-self:flex-start;background:#fff;color:#222;border-bottom-left-radius:5px}'
  + '.k-msg.me{align-self:flex-end;background:linear-gradient(135deg,#3a7afe,#6a5bff);color:#fff;border-bottom-right-radius:5px}'
  + '.k-chips{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 2px}'
  + '.k-chips button{border:1px solid #e2e2e6;background:#fff;color:#444;border-radius:18px;padding:8px 13px;font-size:13px;font-family:inherit;cursor:pointer}'
  + '.k-inbar{display:flex;gap:8px;padding:10px 18px calc(14px + env(safe-area-inset-bottom));border-top:1px solid #ececec;background:#f4f5f8}'
  + '.k-inbar input{flex:1;height:42px;border:1px solid #e2e2e6;border-radius:21px;padding:0 16px;font-size:14px;font-family:inherit;background:#fff;outline:none}'
  + '.k-inbar .send{width:42px;height:42px;border-radius:50%;border:none;background:linear-gradient(135deg,#3a7afe,#6a5bff);color:#fff;font-size:17px;cursor:pointer;flex-shrink:0}'
  /* 数据来源标注 */
  + '.k-src{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:#a0a4ab;font-weight:500;font-style:normal}'
  + '.k-src:before{content:"";width:5px;height:5px;border-radius:50%;background:#c8ccd2;flex-shrink:0}'
  /* 阶段切换动效 + 时间轴状态 */
  + '.k-fv{border-top:none!important}'
  + '.k-pop{animation:kpop .55s cubic-bezier(.2,.8,.2,1)}'
  + '@keyframes kpop{0%{opacity:.1;transform:translateY(8px)}100%{opacity:1;transform:none}}'
  + '.tli .tm .k-st{display:block;font-size:10.5px;font-style:normal;color:#b0b0b0;margin-top:2px;font-weight:500;white-space:nowrap}'
  + '.tli.k-done .rail{color:#c4c9d0!important}.tli.k-done .rail i{background:currentColor}'
  + '.tli.k-done .tc{opacity:.6}.tli.k-done .tm b{color:#a3a8ae}'
  + '.tli.k-now .tc{box-shadow:0 0 0 1.6px var(--k-acc,#3a7afe),0 8px 22px rgba(0,0,0,.07)}'
  + '.tli.k-now .tm .k-st{color:var(--k-acc,#3a7afe);font-weight:700}'
  + '.tli.k-now .rail i{background:currentColor;animation:kring 1.8s ease-out infinite}'
  + '@keyframes kring{0%{box-shadow:0 0 0 2.5px currentColor,0 0 0 2.5px var(--k-ring,rgba(58,122,254,.5))}100%{box-shadow:0 0 0 2.5px currentColor,0 0 0 11px rgba(255,255,255,0)}}'
  /* 单独打开时的阶段切换条 */
  + '.k-stages{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;max-width:410px}'
  + '.k-stages .k-sl{width:100%;text-align:center;font-size:11.5px;color:#98a1b2;margin-bottom:2px}'
  + '.k-stages button{font-family:inherit;font-size:12px;font-weight:600;border:1px solid #dfe3ea;background:#fff;color:#5a6270;border-radius:18px;padding:7px 12px;cursor:pointer}'
  + '.k-stages button i{font-style:normal;font-weight:500;opacity:.65;margin-left:5px}'
  + '.k-stages button.on{background:#ffbb0f;border-color:#ffbb0f;color:#4a3600}'
  + '@media(max-width:430px){.k-stages{display:none}}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  var host=document.querySelector('.screen')||document.body;
  var inFrame=(window.parent!==window);
  function qa(sel){ try{ return Array.prototype.slice.call(document.querySelectorAll(sel)); }catch(e){ return []; } }
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function hexA(h,a){ var m=/^#?([0-9a-f]{6})$/i.exec(h||''); if(!m) return 'rgba(58,122,254,'+a+')'; var n=parseInt(m[1],16); return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'; }
  if(window.OS5_ACC){ host.style.setProperty('--k-acc',window.OS5_ACC); host.style.setProperty('--k-ring',hexA(window.OS5_ACC,.5)); }

  /* ---------- Toast ---------- */
  var tTimer=null, lastToast='';
  function toast(msg){
    lastToast=msg;
    var old=host.querySelector('.k-toast'); if(old) old.remove();
    var d=document.createElement('div'); d.className='k-toast'; d.textContent=msg;
    host.appendChild(d); clearTimeout(tTimer); tTimer=setTimeout(function(){d.remove();},2200);
  }

  /* ---------- Sheet ---------- */
  var sheet=document.createElement('div'); sheet.className='k-sheet';
  sheet.innerHTML='<div class="k-bg"></div><div class="k-panel"><div class="k-grab"></div>'
    +'<div class="k-hd"><b></b><button class="k-x" aria-label="关闭">&times;</button></div>'
    +'<div class="k-body"></div><div class="k-inbar" style="display:none"><input placeholder="问问小爱…"><button class="send">&#8593;</button></div></div>';
  host.appendChild(sheet);
  var sB=sheet.querySelector('.k-body'), sHd=sheet.querySelector('.k-hd b'), sIn=sheet.querySelector('.k-inbar');
  var camTimer=null;
  function openSheet(title,html,chat,generic){
    clearTimeout(camTimer);
    sHd.textContent=title; sB.innerHTML=html; sB.scrollTop=0; sIn.style.display=chat?'flex':'none';
    if(generic) sheet.setAttribute('data-generic','1'); else sheet.removeAttribute('data-generic');
    sheet.classList.add('open');
  }
  function closeSheet(){ clearTimeout(camTimer); sheet.classList.remove('open'); }

  function actRow(a,b,ta,tb){
    return '<div class="k-act">'+(a?'<button'+(ta?' data-toast="'+esc(ta)+'"':'')+'>'+a+'</button>':'')
      +(b?'<button class="p"'+(tb?' data-toast="'+esc(tb)+'"':'')+'>'+b+'</button>':'')+'</div>';
  }
  function txtOf(el,sel){ var n=el&&el.querySelector(sel); return n?n.innerText.trim():''; }
  function cleanText(n){ var c=n.cloneNode(true); Array.prototype.forEach.call(c.querySelectorAll('.tag,.bg,.st'),function(x){x.remove();}); return (c.textContent||'').replace(/\s+/g,' ').trim(); }
  function firstBold(el){ var n=el.querySelector('h3,h4,b,.nm,.kt'); return n?cleanText(n):(el.innerText||'').trim().split('\n')[0]; }
  /* 找到按钮所在的内容块，取标题与描述，让二级页内容跟着上下文走 */
  function ctxOf(el){
    var c=el.closest('.gcard,.nextup,.keysug,.remind,.flight,.tli,.li,.sug,.med,.route,.ppl,.crow,.crs,.kp,.xrow,.coll,.rxc,.card')||el.parentElement||el;
    var tEl=c.querySelector('h3,h4,.gc-hd b,.hh b,.tc b,.lc b,.sc b,.rc b,.mc b,b,.nm,.kt');
    var dEl=c.querySelector('p.ds,.np,.tc p,.lc p,.sc p,.rc p,.rc s,.mc p,p,.loc,.code');
    return {el:c,title:tEl?cleanText(tEl):'',desc:dEl?dEl.innerText.replace(/\s+/g,' ').trim():''};
  }
  function sheetSpec(key){ var S=window.OS5_SHEETS||{}; return S[key]||null; }
  function openSpec(spec){
    if(typeof spec==='string') spec=sheetSpec(spec);
    if(!spec) return false;
    var html=(spec.h||'')+((spec.a&&spec.a.length)?actRow(spec.a[0],spec.a[1],spec.at&&spec.at[0],spec.at&&spec.at[1]):'');
    if(spec.cam){
      openSheet(spec.t,'<div class="k-cam"><div class="doc"><i></i><i></i><i></i><i></i><i></i><i></i></div><span class="cn c1"></span><span class="cn c2"></span><span class="cn c3"></span><span class="cn c4"></span><div class="scan"></div><div class="lb">'+esc(spec.camLabel||'对准拍摄，正在识别…')+'</div></div>');
      camTimer=setTimeout(function(){ if(sheet.classList.contains('open')) { sB.innerHTML='<div class="k-ok">✓ 识别完成 · 请核对</div>'+html; } },1150);
      return true;
    }
    openSheet(spec.t,html); return true;
  }

  /* ---------- 默认二级页 ---------- */
  function navSheet(el){
    var c=ctxOf(el), dest=window.OS5_DEST||c.title||'目的地';
    openSheet('导航 · '+dest,'<div class="k-map"></div><div class="k-card"><span class="t">'+esc(c.title||dest)+'</span><p>'+esc(c.desc||'已按实时路况规划路线。')+'</p></div>'+actRow('换一条','开始导航'));
  }
  function routeSheet(el){
    var c=ctxOf(el);
    openSheet('推荐路线','<div class="k-map"></div><div class="k-card"><span class="t">'+esc(c.title||'推荐路线')+'</span><p>'+esc(c.desc||'按实时路况推荐。')+'</p></div>'+actRow('换一条','开始导航'));
  }
  function codeSheet(el){
    var li=el.closest('.li'), code=(li&&txtOf(li,'.code2'))||(txtOf(document,'.nextup .code').replace(/[^0-9-]/g,''))||'8-2-3056';
    var name=li?txtOf(li,'.lc b'):'待取包裹';
    openSheet('取件码','<div class="k-card"><div class="k-code">'+esc(code)+'</div><div class="k-bars">'+Array(26).join('<i></i>')+'</div>'
      +'<p style="text-align:center;margin-top:8px">'+esc(name)+' · 向驿站工作人员出示即可取件</p></div>'
      +'<div class="k-card"><div class="k-kv"><span class="k">驿站</span><span class="v">菜鸟驿站 · 地铁 B 口 80 米</span></div>'
      +'<div class="k-kv"><span class="k">营业至</span><span class="v">今天 22:00</span></div></div>'
      +'<div class="k-note">取件码来自快递短信</div>'+actRow('复制取件码','导航去驿站'));
  }
  function ticketSheet(){
    openSheet('电子车票','<div class="k-card"><span class="t">G1234 · 北京南 → 济南西</span>'
      +'<div class="k-kv"><span class="k">乘车日期</span><span class="v">5月23日 周六 08:00 开</span></div>'
      +'<div class="k-kv"><span class="k">到达</span><span class="v">09:52 济南西</span></div>'
      +'<div class="k-kv"><span class="k">席位</span><span class="v">二等座 05 车 12A</span></div>'
      +'<div class="k-kv"><span class="k">检票口</span><span class="v">12 检票口</span></div>'
      +'<div class="k-kv"><span class="k">乘车人</span><span class="v">本人（已实名）</span></div></div>'
      +'<div class="k-note">来自 12306 购票短信</div>'+actRow('改签','添加到卡包'));
  }
  function flightOf(el){ return (el&&el.closest('.flight'))||document.querySelector('.flight'); }
  function flightSheet(el){
    var f=flightOf(el); if(!f){ openSheet('航班行程','<div class="k-card"><p>暂无航班信息。</p></div>'+actRow('','知道了')); return; }
    var tm=f.querySelectorAll('.times b'), pt=f.querySelectorAll('.ports span'), sts=f.querySelectorAll('.stats .st');
    var kv='<div class="k-kv"><span class="k">日期</span><span class="v">'+esc(txtOf(f,'.fd'))+' · '+esc(txtOf(f,'.fs'))+'</span></div>'
      +'<div class="k-kv"><span class="k">起飞 / 到达</span><span class="v">'+esc(tm[0]?tm[0].innerText:'')+' → '+esc(tm[1]?tm[1].innerText:'')+'</span></div>';
    Array.prototype.forEach.call(sts,function(s){ kv+='<div class="k-kv"><span class="k">'+esc(txtOf(s,'s'))+'</span><span class="v">'+esc(txtOf(s,'b'))+'</span></div>'; });
    openSheet('航班行程','<div class="k-card"><span class="t">'+esc(pt[0]?pt[0].innerText:'')+' → '+esc(pt[1]?pt[1].innerText:'')+'</span>'+kv+'</div>'
      +'<div class="k-note">来自机票订单短信 · 航班动态为公开数据</div>'+actRow('设置提醒','在线值机'));
  }
  function checkinSheet(el){
    var f=flightOf(el), no='', seat='';
    if(f) Array.prototype.forEach.call(f.querySelectorAll('.stats .st'),function(s){ var k=txtOf(s,'s'), v=txtOf(s,'b'); if(/航班/.test(k)) no=v; if(/座位/.test(k)) seat=v; });
    openSheet('在线值机 · '+(no||'航班'),'<div class="k-card"><div class="k-kv"><span class="k">航班</span><span class="v">'+esc(no)+'</span></div>'
      +'<div class="k-kv"><span class="k">座位</span><span class="v">'+esc(seat&&!/待/.test(seat)?seat+' 靠窗':'可在线选座')+'</span></div>'
      +'<div class="k-kv"><span class="k">值机开放</span><span class="v">起飞前 24 小时</span></div>'
      +'<div class="k-kv"><span class="k">行李额</span><span class="v">托运 20kg</span></div></div>'+actRow('选座','在线值机'));
  }
  function docsSheet(){
    openSheet('评审资料','<div class="k-card"><div class="k-kv"><span class="k">📄 评审材料 v3.pptx</span><span class="v">已备好</span></div>'
      +'<div class="k-kv"><span class="k">📄 会议纪要模板.docx</span><span class="v">待填</span></div>'
      +'<div class="k-kv"><span class="k">📊 上季度数据.xlsx</span><span class="v">已附</span></div></div>'
      +'<div class="k-note">来自你的笔记和本机文件</div>'+actRow('发给参会人','全部打开'));
  }
  function camSheet(el,txt){
    var c=ctxOf(el), what=(txt||'').replace(/^拍(一下|一张)?/,'')||'照片';
    openSpec({t:txt||'拍照',cam:true,h:'<div class="k-card"><span class="t">'+esc(what)+' 已存入笔记</span><p>'+esc(c.desc||'已识别内容并插入到当前笔记。')+'</p></div>',a:['重拍','完成'],at:['已重新打开相机','已保存 ✓']});
  }
  function genericSheet(el,txt){
    var c=ctxOf(el), title=c.title||txt||'详情';
    openSheet(title,'<div class="k-card"><span class="t">'+esc(c.title||txt)+'</span><p>'+esc(c.desc||txt)+'</p></div>'+actRow('稍后','好的'),false,true);
  }

  /* ---------- 按钮文字 → 行为（默认规则） ---------- */
  var RULES=[
    [/跑腿|代取/,'已下单跑腿代取，骑手约 15 分钟到驿站 🛵'],
    [/叫车|打车/,'已为你叫车，预计 3 分钟到达 🚕'],
    [/导航|去医院|去餐厅|去驿站/,navSheet],
    [/路线/,routeSheet],
    [/取件码|^去取/,codeSheet],
    [/车票/,ticketSheet],
    [/行程详情|航班动态/,flightSheet],
    [/查看办理|值机/,checkinSheet],
    [/资料/,docsSheet],
    [/12306|购票|看票|盯票/,'已打开 12306 购票页 🎫'],
    [/静音/,'已开启课堂静音，下课自动恢复 🔕'],
    [/闹钟/,'已设好明早 06:20 的闹钟 ⏰'],
    [/提醒/,'已设置提醒，到时间会通知你 🔔'],
    [/已服|标记/,'已记录 ✓'],
    [/忽略|稍后|暂不/,'好的，稍后再提醒你'],
    [/补药|购药/,'已加入购药清单，可一键下单送到家 💊'],
    [/^记录$/,'已记入健康档案 ✓'],
    [/生成/,'正在为你生成，完成后通知你 ✨'],
    [/预订|下单|去买/,'已为你打开下单页 🛒'],
    [/请假/,'已提交请假申请，等待老师确认'],
    [/发消息|发送|群里/,'已发送 💬'],
    [/打电话|电话/,'正在呼叫… 📞'],
    [/复制/,'已复制到剪贴板 ✓'],
    [/改约/,'已打开改约页面，可选其他时间段'],
    [/^拍/,camSheet],
    [/加入|添加|收藏/,'已添加 ✓'],
    [/完成|知道了|好的|确定/,'已完成 ✓']
  ];
  function sheetToast(t){
    t=(t||'').trim();
    var m=[[/导航/,'已开始导航 🧭'],[/叫车|打车/,'已为你叫车，预计 3 分钟到达 🚕'],[/跑腿/,'已下单跑腿代取 🛵'],[/提醒/,'已设置提醒 🔔'],
      [/卡包/,'已添加到卡包 ✓'],[/改签/,'已打开改签页面'],[/复制/,'已复制到剪贴板 ✓'],[/发|分享/,'已发送 💬'],[/值机/,'值机成功，登机牌已存入卡包 ✈️'],
      [/选座/,'已为你选好靠窗座位 ✓'],[/补药|下单|购/,'已为你打开下单页 🛒'],[/生成/,'正在生成… ✨'],[/换/,'已为你换一条路线'],
      [/打开|查看/,'已打开 ✓'],[/确认/,'已确认 ✓'],[/稍后|取消|关闭/,'好的，稍后再提醒你']];
    for(var i=0;i<m.length;i++) if(m[i][0].test(t)) return m[i][1];
    return '已完成 ✓';
  }
  function runSpec(spec,el,txt){
    if(typeof spec==='function'){ spec(el,txt); return; }
    if(typeof spec==='string'){ if(spec.indexOf('sheet:')===0){ openSpec(spec.slice(6)); return; } toast(spec); return; }
    if(spec&&spec.t) openSpec(spec);
  }
  function handleAct(el){
    var txt=(el.innerText||el.textContent||'').replace(/[›>]/g,'').replace(/\s+/g,' ').trim();
    var pr=window.OS5_ACTIONS||[];
    for(var i=0;i<pr.length;i++){ if(pr[i][0].test(txt)){ runSpec(pr[i][1],el,txt); return; } }
    if(/查看更多/.test(txt)){ expandMore(el); return; }
    for(var j=0;j<RULES.length;j++){ if(RULES[j][0].test(txt)){ runSpec(RULES[j][1],el,txt); return; } }
    genericSheet(el,txt);
  }

  /* ---------- 行/卡片 → 二级页 ---------- */
  function rowSheet(el){
    var title=firstBold(el);
    if(el.matches('.kp')){ openSheet(title,
      '<div class="k-card"><span class="t">考点要点（来自你的课堂笔记）</span>'
      +'<div class="k-bul"><i></i><span>先弄清定义和直观含义，再记写法。</span></div>'
      +'<div class="k-bul"><i></i><span>配 2 道老师课上讲过的例题，掌握标准步骤。</span></div>'
      +'<div class="k-bul"><i></i><span>标出易错点和常见出题方式。</span></div></div>'
      +actRow('加入复习计划','生成练习题','已加入复习计划 ✓','正在生成练习题… ✨')); return; }
    if(el.matches('.flight')){ flightSheet(el); return; }
    if(el.matches('.xrow')){ var p=el.querySelector('p'); openSheet(title,
      '<div class="k-card"><p>'+esc(p?p.innerText:'来自小红书的图文内容。')+'</p>'
      +'<div class="k-kv" style="margin-top:6px"><span class="k">来源</span><span class="v">你在小红书收藏的图文</span></div></div>'
      +actRow('打开原文','加入行程','已打开原文','已加入行程 ✓')); return; }
    if(el.matches('.coll')){ openSheet(title,
      '<div class="k-card"><p>这个合集里的笔记已按主题自动归类，可以随时翻阅、续写或分享。</p></div>'
      +actRow('分享合集','打开合集')); return; }
    if(el.matches('.med')){ openSheet(title,
      '<div class="k-card"><div class="k-kv"><span class="k">用法</span><span class="v">'+esc(txtOf(el,'.mc p'))+'</span></div>'
      +'<div class="k-kv"><span class="k">库存</span><span class="v">'+esc(txtOf(el,'.mr b'))+'</span></div>'
      +'<div class="k-kv"><span class="k">下次服用</span><span class="v">按今日用药时间</span></div></div>'
      +'<div class="k-note">库存按每次打卡自动扣减</div>'+actRow('设为提醒','一键补药')); return; }
    if(el.matches('.route')){ openSheet(title,
      '<div class="k-map"></div><div class="k-card"><p>'+esc(txtOf(el,'.rc p'))+'</p></div>'
      +actRow('换一条','选择此方案并导航','已为你换一个方案','已开始导航 🧭')); return; }
    if(el.matches('.crs')){ openSheet(txtOf(el,'.r2')||'课程',
      '<div class="k-card"><div class="k-kv"><span class="k">时间</span><span class="v">'+esc(txtOf(el,'.r1'))+'</span></div>'
      +'<div class="k-kv"><span class="k">地点</span><span class="v">'+esc(txtOf(el,'.r3'))+'</span></div></div>'
      +'<div class="k-note">来自你导入的课程表</div>'+actRow('请假','课前提醒','已提交请假申请，等待老师确认','已设置课前 30 分钟提醒 🔔')); return; }
    if(el.matches('.note')){ openSheet(txtOf(el,'b')||'课堂笔记','<div class="k-card"><p>'+esc(txtOf(el,'p'))+'</p></div><div class="k-note">来自你的课堂笔记</div>'+actRow('分享','打开笔记','已复制分享链接 ✓','已打开笔记')); return; }
    if(el.matches('.crow')){ openSheet(txtOf(el,'.nm')||'课程',
      '<div class="k-card"><div class="k-kv"><span class="k">时间</span><span class="v">'+esc(txtOf(el,'.dt'))+' '+esc(txtOf(el,'.tm'))+'</span></div>'
      +'<div class="k-kv"><span class="k">地点</span><span class="v">'+esc(txtOf(el,'.loc'))+'</span></div></div>'
      +'<div class="k-note">来自你导入的课程表</div>'+actRow('请假','课前提醒','已提交请假申请，等待老师确认','已设置课前 30 分钟提醒 🔔')); return; }
    if(el.matches('.ppl')){ openSheet(title,
      '<div class="k-card"><p>'+esc(txtOf(el,'.pc s'))+'</p></div>'+actRow('打电话','发消息')); return; }
    if(el.matches('.tli')){ var tc=el.querySelector('.tc'); openSheet(firstBold(tc||el),
      '<div class="k-card"><p>'+esc(txtOf(tc||el,'p'))+'</p></div>'+actRow('设为提醒','标记完成')); return; }
    var p2=el.querySelector('.lc p,.sc p,p,s'); openSheet(title,
      '<div class="k-card"><p>'+esc(p2?p2.innerText:el.innerText)+'</p></div>'+actRow('稍后','好的'));
  }

  /* ---------- 查看更多：展开更多行 ---------- */
  function expandMore(btn){
    var card=btn.closest('.card')||btn.parentElement;
    var rows=card.querySelectorAll('.kp,.xrow,.li,.sug');
    if(rows.length){ var last=rows[rows.length-1];
      for(var i=0;i<2;i++){ var c=last.cloneNode(true); card.insertBefore(c,btn); }
    }
    btn.style.display='none'; toast('已展开更多');
  }

  /* ---------- 问小爱 ---------- */
  function sceneName(){ var h=document.querySelector('.htitle'); return h?h.innerText.trim():'这个场景'; }
  function chatChips(){
    var n=sceneName(), map={
      '高数课程':['帮我梳理这章重点','出几道练习题','考试前还要准备什么'],
      '稻城亚丁旅行':['帮我排一下每天行程','有什么高原注意事项','整理这些收藏成攻略'],
      '今日安排':['今天还有哪些事没做','帮我把评审纪要写好','晚上聚餐要带什么'],
      '上下班通勤':['现在哪条路最快','顺路还能办什么事','今天要带伞吗'],
      '带娃看病':['看医生前要准备什么','帮我整理宝宝这几天的情况','开完药提醒我喂药'],
      '约饭':['这家店招牌菜是什么','小敏有什么忌口','买单怎么算 AA'],
      '回老家':['给爸妈带点什么好','返程票什么时候买','老家这两天天气'],
      '生日纪念':['送妈妈什么礼物好','帮我写一段祝福','生日当天怎么安排'],
      '健康用药':['这几种药能一起吃吗','妈妈今天按时吃药了吗','血压偏高要注意什么']
    };
    return map[n]||['帮我总结一下','接下来该做什么','还有什么要注意'];
  }
  function aiReply(q){
    var R=window.OS5_CHAT||{}; if(R[q]) return R[q];
    return '好的，「'+q+'」我根据这个场景里你已有的信息（日程、短信、笔记）整理好了，已同步到你的待办，有变化我再提醒你。';
  }
  function openChat(){
    var chips=chatChips().map(function(c){return '<button>'+c+'</button>';}).join('');
    openSheet('问小爱 · '+sceneName(),
      '<div class="k-chat" id="kchat"><div class="k-msg ai">我是小爱，正在看着「'+sceneName()+'」这个场景。需要我帮你做点什么？</div></div>'
      +'<div class="k-chips">'+chips+'</div>', true);
  }
  function pushMsg(text,who){
    var c=sheet.querySelector('#kchat'); if(!c) return;
    var d=document.createElement('div'); d.className='k-msg '+who; d.textContent=text; c.appendChild(d);
    c.parentElement.scrollTop=c.parentElement.scrollHeight;
  }
  function sendChat(q){ if(!q) return; pushMsg(q,'me'); setTimeout(function(){ pushMsg(aiReply(q),'ai'); },420); }

  /* ---------- 事件委托 ---------- */
  document.addEventListener('click',function(e){
    var t=e.target;
    if(!t.closest||t.closest('.k-stages')) return;
    if(!t.closest('.screen')) return;
    if(t.closest('.k-x')||t.classList.contains('k-bg')){ closeSheet(); return; }
    if(t.closest('.k-panel')){
      var chip=t.closest('.k-chips button'); if(chip){ sendChat(chip.textContent); return; }
      if(t.closest('.k-inbar .send')){ var inp=sIn.querySelector('input'); sendChat((inp.value||'').trim()); inp.value=''; return; }
      var ab=t.closest('.k-act button,[data-toast],[data-sheet]');
      if(ab){
        if(ab.hasAttribute('data-sheet')){ openSpec(ab.getAttribute('data-sheet')); return; }
        var tt=ab.getAttribute('data-toast')||sheetToast(ab.textContent);
        closeSheet(); setTimeout(function(){toast(tt);},160); return;
      }
      return;
    }
    if(t.closest('.fab')){ e.preventDefault(); openChat(); return; }
    if(t.closest('.back, .nav .ib:first-child')) return;
    var ck=t.closest('.ck');
    if(ck){ if(!t.closest('.box')){ var bx=ck.querySelector('.box'); if(bx){ e.preventDefault(); bx.click(); } } return; }
    var x=t.closest('[data-toast],[data-sheet]');
    if(x){ e.preventDefault(); if(x.hasAttribute('data-sheet')) openSpec(x.getAttribute('data-sheet')); else toast(x.getAttribute('data-toast')); return; }
    var act=t.closest('button, a, .go, .act, .more');
    var row=t.closest('.kp, .xrow, .coll, .med, .route, .crow, .crs, .note, .ppl, .tli, .li');
    if(act){ e.preventDefault(); handleAct(act); return; }
    if(row){ e.preventDefault(); rowSheet(row); return; }
  },true);
  sIn.querySelector('input').addEventListener('keydown',function(e){ if(e.key==='Enter'){ var v=(this.value||'').trim(); sendChat(v); this.value=''; } });

  /* ---------- 阶段引擎 ---------- */
  var STG=window.OS5_STAGES||null, cur=-1;
  var baseSet={}, baseCls={}, tlis=[], tliBase=[], tmBase=[], cks=[];
  function initStages(){
    STG.forEach(function(s){
      if(s.set) Object.keys(s.set).forEach(function(k){ if(!(k in baseSet)) baseSet[k]=qa(k).map(function(e){return e.innerHTML;}); });
      if(s.cls) Object.keys(s.cls).forEach(function(k){ if(!(k in baseCls)) baseCls[k]=qa(k).map(function(e){return e.className;}); });
    });
    tlis=qa('.tl .tli'); tliBase=tlis.map(function(e){return e.className;});
    tmBase=tlis.map(function(e){ var m=e.querySelector('.tm'); return m?m.innerHTML:''; });
    cks=qa('.ck');
  }
  function applyStage(i,anim){
    if(!STG||!STG[i]) return; var s=STG[i]; cur=i; var changed=[];
    Object.keys(baseSet).forEach(function(k){
      qa(k).forEach(function(el,j){
        var v=(s.set&&(k in s.set))?s.set[k]:baseSet[k][j]; if(v==null) return;
        if(el.innerHTML!==v){ el.innerHTML=v; changed.push(el); }
      });
    });
    Object.keys(baseCls).forEach(function(k){
      qa(k).forEach(function(el,j){
        var c=(baseCls[k][j]||'')+((s.cls&&s.cls[k])?' '+s.cls[k]:'');
        if(el.className!==c){ el.className=c; changed.push(el); }
      });
    });
    var parents=[];
    qa('[data-st]').forEach(function(el){
      var on=(' '+el.getAttribute('data-st')+' ').indexOf(' '+i+' ')>=0, was=el.style.display!=='none';
      el.style.display=on?'':'none'; if(on&&!was) changed.push(el);
      if(el.parentElement&&parents.indexOf(el.parentElement)<0) parents.push(el.parentElement);
    });
    /* 隐藏项不参与分隔线：给容器里第一个可见子元素去掉上边框 */
    parents.forEach(function(p){ var first=true; Array.prototype.forEach.call(p.children,function(c){ var vis=c.style.display!=='none'; c.classList.toggle('k-fv',vis&&first); if(vis) first=false; }); });
    tlis.forEach(function(el,j){
      var tm=el.querySelector('.tm');
      if(!s.tl||s.tl[j]==null){ if(el.className!==tliBase[j]) el.className=tliBase[j]; if(tm&&tm.innerHTML!==tmBase[j]) tm.innerHTML=tmBase[j]; return; }
      var sp=String(s.tl[j]).split(':'), stt=sp[0], lab=sp.length>1?sp.slice(1).join(':'):(stt==='done'?(window.OS5_DONE||'已完成'):stt==='now'?(window.OS5_NOW||'进行中'):'');
      var cls=tliBase[j].replace(/\b(ok|k-done|k-now)\b/g,'').replace(/\s+/g,' ').trim()+(stt==='done'?' k-done':stt==='now'?' k-now':'');
      if(el.className!==cls){ el.className=cls; changed.push(el); }
      if(tm){ var b=tm.querySelector('b'); var h=(b?b.outerHTML:'')+(lab?'<s class="k-st">'+lab+'</s>':''); if(tm.innerHTML!==h) tm.innerHTML=h; }
    });
    if(s.ck) cks.forEach(function(el,j){
      var d=!!s.ck[j];
      if(el.classList.contains('done')!==d){ el.classList.toggle('done',d); var bx=el.querySelector('.box'); if(bx) bx.innerHTML=d?CHECK:''; changed.push(el); }
    });
    if(s.t){ var sb=document.querySelector('.sb>span'); if(sb) sb.textContent=s.t.replace(/^0/,''); }
    if(typeof window.OS5_ONSTAGE==='function') window.OS5_ONSTAGE(i,s);
    renderChips();
    if(anim){
      changed.forEach(function(el){ el.classList.remove('k-pop'); void el.offsetWidth; el.classList.add('k-pop'); });
      setTimeout(function(){ changed.forEach(function(el){ el.classList.remove('k-pop'); }); },700);
      var app=document.querySelector('.app'); if(app&&app.scrollTop>30){ try{ app.scrollTo({top:0,behavior:'smooth'}); }catch(_){ app.scrollTop=0; } }
      closeSheet();
    }
  }
  function renderChips(){
    if(inFrame||!STG) return;
    var w=document.querySelector('.k-stages');
    if(!w){
      var dev=document.querySelector('.device'); if(!dev) return;
      w=document.createElement('div'); w.className='k-stages'; dev.parentNode.insertBefore(w,dev.nextSibling);
      w.addEventListener('click',function(e){ var b=e.target.closest('button[data-i]'); if(!b) return; var n=+b.getAttribute('data-i'); applyStage(n,true); try{ history.replaceState(null,'','?s='+n); }catch(_){} });
    }
    w.innerHTML='<span class="k-sl">切换时间阶段 · 同一个 AI App 在不同时刻的状态</span>'
      +STG.map(function(s,j){ return '<button data-i="'+j+'" class="'+(j===cur?'on':'')+'">'+(j+1)+'. '+s.k+(s.t?'<i>'+s.t+'</i>':'')+'</button>'; }).join('');
  }
  if(STG&&STG.length){
    initStages();
    var m=/[?&]s=(\d+)/.exec(location.search), s0=m?+m[1]:(window.OS5_STAGE_BASE||0);
    if(!STG[s0]) s0=0;
    applyStage(s0,false);
    window.addEventListener('message',function(e){ var d=e.data; if(d&&typeof d==='object'&&d.os5stage!=null){ var n=+d.os5stage; if(STG[n]&&n!==cur) applyStage(n,!d.init); } });
  }
  window.os5stage=function(n){ applyStage(n,true); };
  /* 滚动到某块内容并高亮一下，同时给提示 */
  window.os5focus=function(el,msg){ if(!el) return; try{ el.scrollIntoView({behavior:'smooth',block:'center'}); }catch(_){ el.scrollIntoView(); } el.classList.remove('k-pop'); void el.offsetWidth; el.classList.add('k-pop'); setTimeout(function(){ el.classList.remove('k-pop'); },800); if(msg) toast(msg); };
  window.os5toast=toast;

  /* ---------- 深链 / 自检 ---------- */
  function audit(){
    var out=[], sel='.nav button, .app button, .app a, .app [data-sheet], .app [data-toast], .app .kp, .app .xrow, .app .coll, .app .med, .app .route, .app .crow, .app .crs, .app .note, .app .ppl, .app .tli, .app .li';
    qa(sel).forEach(function(el){
      if(el.offsetParent===null) return;
      if(el.closest('.back, .nav .ib:first-child, .ck, [data-a^="stage:"], [data-focus]')) return;
      var label=((el.innerText||'').trim().split('\n')[0]||el.className).slice(0,26);
      lastToast=''; closeSheet();
      el.click();
      var res=sheet.classList.contains('open')?('SHEET['+sHd.textContent+']'+(sheet.getAttribute('data-generic')?' GENERIC':'')+' '+sB.innerText.replace(/\s+/g,' ').slice(0,70)):(lastToast?('TOAST '+lastToast):'NONE');
      out.push(label+' => '+res); closeSheet();
    });
    var pre=document.createElement('pre'); pre.id='k-audit'; pre.textContent=out.join('\n'); document.body.appendChild(pre);
  }
  var hs=location.hash||'';
  if(/^#k-(chat|sheet|toast)/.test(hs)){
    setTimeout(function(){
      if(hs.indexOf('chat')>0) openChat();
      else if(hs.indexOf('sheet')>0){ var first=document.querySelector('.app [data-sheet]'); if(first) openSpec(first.getAttribute('data-sheet')); else routeSheet(document.querySelector('.app button')||host); }
      else toast('已设置提醒，到时间会通知你 🔔');
    },320);
  }
  if(hs==='#k-audit') audit();
  var ym=/^#y=(\d+)/.exec(hs); if(ym){ setTimeout(function(){ var ap=document.querySelector('.app'); if(ap) ap.scrollTop=+ym[1]; },60); }
})();
