/* OS5 落地页通用交互套件 —— 让所有二级操作都"点得了、有反馈、能进二级页"
   被每个场景落地页以 <script src="../os5-kit/interaction.js"></script> 引入。
   不接管 .ck 勾选（各页自己处理），其余按钮/行/卡片/AI 小球统一接管。 */
(function(){
  if(window.__os5kit) return; window.__os5kit = true;

  /* ---------- 注入样式 ---------- */
  var css = ''
  + '.k-toast{position:absolute;left:50%;bottom:112px;transform:translateX(-50%);z-index:130;background:rgba(28,28,30,.94);color:#fff;font-size:13.5px;font-weight:500;padding:11px 18px;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.32);max-width:82%;text-align:center;display:flex;align-items:center;gap:8px;animation:ktin .22s ease}'
  + '@keyframes ktin{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}'
  + '.k-sheet{position:absolute;inset:0;z-index:120;pointer-events:none}'
  + '.k-sheet .k-bg{position:absolute;inset:0;background:rgba(0,0,0,.35);opacity:0;transition:opacity .28s}'
  + '.k-sheet .k-panel{position:absolute;left:0;right:0;bottom:0;max-height:88%;background:#f4f5f8;border-radius:26px 26px 0 0;transform:translateY(101%);transition:transform .34s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;box-shadow:0 -12px 44px rgba(0,0,0,.22)}'
  + '.k-sheet.open{pointer-events:auto}.k-sheet.open .k-bg{opacity:1}.k-sheet.open .k-panel{transform:translateY(0)}'
  + '.k-grab{width:38px;height:5px;border-radius:3px;background:#d6d6da;margin:9px auto 2px}'
  + '.k-hd{display:flex;align-items:center;gap:10px;padding:8px 20px 12px}'
  + '.k-hd b{font-size:18px;font-weight:650;color:#17171b;flex:1;line-height:1.3}'
  + '.k-x{width:30px;height:30px;border-radius:50%;border:none;background:rgba(0,0,0,.06);color:#666;font-size:15px;cursor:pointer;flex-shrink:0;line-height:1}'
  + '.k-body{overflow-y:auto;padding:0 20px 24px;scrollbar-width:none}.k-body::-webkit-scrollbar{display:none}'
  + '.k-card{background:#fff;border-radius:16px;padding:14px 16px;margin-bottom:12px}'
  + '.k-card>.t{font-size:15px;font-weight:650;color:#1b1b1b;margin-bottom:8px;display:block}'
  + '.k-card p{font-size:14px;line-height:1.72;color:#595959}'
  + '.k-bul{display:flex;gap:9px;font-size:14px;color:#3a3a3a;line-height:1.6;padding:6px 0}'
  + '.k-bul i{width:6px;height:6px;border-radius:50%;background:#3a7afe;flex-shrink:0;margin-top:8px}'
  + '.k-kv{display:flex;justify-content:space-between;gap:12px;font-size:14px;padding:10px 0}'
  + '.k-kv+.k-kv{border-top:1px solid #eee}.k-kv .k{color:#8a8a8a}.k-kv .v{font-weight:600;color:#1b1b1b;text-align:right}'
  + '.k-code{text-align:center;font-size:30px;font-weight:700;letter-spacing:4px;color:#2068c0;padding:10px 0 4px}'
  + '.k-bars{display:flex;gap:4px;justify-content:center;padding:8px 0 2px}.k-bars i{width:3px;height:34px;background:#1b1b1b}.k-bars i:nth-child(2n){height:22px}.k-bars i:nth-child(3n){width:6px}'
  + '.k-map{height:120px;border-radius:14px;margin-bottom:12px;background:linear-gradient(120deg,#cfe0d2,#bcd2e6);position:relative;overflow:hidden}'
  + '.k-map:after{content:"";position:absolute;left:14%;top:70%;width:72%;height:3px;background:#2f9e6a;border-radius:3px;transform:rotate(-18deg);box-shadow:0 0 0 4px rgba(47,158,106,.18)}'
  + '.k-act{display:flex;gap:10px;margin-top:2px}'
  + '.k-act button{flex:1;height:44px;border:none;border-radius:13px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;background:#eceef2;color:#444}'
  + '.k-act button.p{background:linear-gradient(135deg,#3a7afe,#6a5bff);color:#fff}'
  + '.k-chat{display:flex;flex-direction:column;gap:11px;padding-top:4px}'
  + '.k-msg{max-width:85%;padding:11px 14px;border-radius:16px;font-size:14px;line-height:1.6}'
  + '.k-msg.ai{align-self:flex-start;background:#fff;color:#222;border-bottom-left-radius:5px}'
  + '.k-msg.me{align-self:flex-end;background:linear-gradient(135deg,#3a7afe,#6a5bff);color:#fff;border-bottom-right-radius:5px}'
  + '.k-chips{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 2px}'
  + '.k-chips button{border:1px solid #e2e2e6;background:#fff;color:#444;border-radius:18px;padding:8px 13px;font-size:13px;font-family:inherit;cursor:pointer}'
  + '.k-inbar{display:flex;gap:8px;padding:10px 18px calc(14px + env(safe-area-inset-bottom));border-top:1px solid #ececec;background:#f4f5f8}'
  + '.k-inbar input{flex:1;height:42px;border:1px solid #e2e2e6;border-radius:21px;padding:0 16px;font-size:14px;font-family:inherit;background:#fff;outline:none}'
  + '.k-inbar .send{width:42px;height:42px;border-radius:50%;border:none;background:linear-gradient(135deg,#3a7afe,#6a5bff);color:#fff;font-size:17px;cursor:pointer;flex-shrink:0}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  var host=document.querySelector('.screen')||document.body;

  /* ---------- Toast ---------- */
  var tTimer=null;
  function toast(msg){
    var old=host.querySelector('.k-toast'); if(old) old.remove();
    var d=document.createElement('div'); d.className='k-toast'; d.textContent=msg;
    host.appendChild(d); clearTimeout(tTimer); tTimer=setTimeout(function(){d.remove();},2100);
  }

  /* ---------- Sheet ---------- */
  var sheet=document.createElement('div'); sheet.className='k-sheet';
  sheet.innerHTML='<div class="k-bg"></div><div class="k-panel"><div class="k-grab"></div>'
    +'<div class="k-hd"><b></b><button class="k-x" aria-label="关闭">&times;</button></div>'
    +'<div class="k-body"></div><div class="k-inbar" style="display:none"><input placeholder="问问小爱…"><button class="send">&#8593;</button></div></div>';
  host.appendChild(sheet);
  var sB=sheet.querySelector('.k-body'), sHd=sheet.querySelector('.k-hd b'), sIn=sheet.querySelector('.k-inbar');
  function openSheet(title,html,chat){ sHd.textContent=title; sB.innerHTML=html; sIn.style.display=chat?'flex':'none'; sheet.classList.add('open'); }
  function closeSheet(){ sheet.classList.remove('open'); }

  function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function actRow(a,b){ return '<div class="k-act">'+(a?'<button>'+a+'</button>':'')+(b?'<button class="p">'+b+'</button>':'')+'</div>'; }
  function firstBold(el){ var n=el.querySelector('b,h3,h4,.t'); return n?n.innerText.trim():(el.innerText||'').trim().split('\n')[0]; }

  /* ---------- 关键词 → Toast ---------- */
  function pickToast(t){
    var m=[
      [/叫车|打车|跑腿|代取/,'已为你叫车，预计 3 分钟到达 🚕'],
      [/盯票|看票|抢票/,'已帮你盯着放票，有合适车次马上提醒你 🎫'],
      [/到站提醒|到点提醒|出发提醒|出发前提醒|候诊提醒|提醒妈妈|设置提醒|提醒/,'已设置提醒，到时间会通知你 🔔'],
      [/标记已服|已服|已读|标记完成|标记/,'已记录 ✓'],
      [/忽略/,'已忽略，不再提醒'],
      [/补药|购药/,'已加入购药清单，可一键下单送到家 💊'],
      [/^记录$|记录血压|记录/,'已记入健康档案 ✓'],
      [/发起|AA|买单/,'已发起 AA 收款，账单已发到群里 💰'],
      [/去生成|生成/,'正在为你生成，完成后通知你 ✨'],
      [/去买|去预订|预订|下单|去购/,'已为你打开下单页 🛒'],
      [/值机/,'已办理在线值机，登机牌已存入卡包 ✈️'],
      [/请假/,'已提交请假申请，等待老师确认'],
      [/发消息|群里/,'已发送 💬'],
      [/复制/,'已复制到剪贴板 ✓'],
      [/换一条|换个/,'已为你换一个方案'],
      [/选择此方案|选择/,'已选择该方案，可开始导航'],
      [/加入复习|加入日程|添加到日程|添加到卡包|收藏/,'已添加 ✓'],
      [/完成/,'已标记完成 ✓']
    ];
    for(var i=0;i<m.length;i++) if(m[i][0].test(t)) return m[i][1];
    return null;
  }

  /* ---------- 关键词 → 二级 Sheet（信息类） ---------- */
  function actionSheet(t){
    if(/查看车票|车票/.test(t)){ openSheet('电子车票',
      '<div class="k-card"><span class="t">G1234 · 北京南 → 济南西</span>'
      +'<div class="k-kv"><span class="k">乘车日期</span><span class="v">周六 08:00 开车</span></div>'
      +'<div class="k-kv"><span class="k">席位</span><span class="v">二等座 05 车 12A</span></div>'
      +'<div class="k-kv"><span class="k">检票口</span><span class="v">12 检票口</span></div>'
      +'<div class="k-kv"><span class="k">乘车人</span><span class="v">本人（已实名）</span></div></div>'
      +actRow('改签','添加到卡包')); return; }
    if(/行程详情|航班/.test(t)){ openSheet('航班行程',
      '<div class="k-card"><span class="t">CA4186 · 成都双流 T2 → 稻城亚丁</span>'
      +'<div class="k-kv"><span class="k">起飞 / 到达</span><span class="v">08:20 → 10:35</span></div>'
      +'<div class="k-kv"><span class="k">登机口</span><span class="v">D12</span></div>'
      +'<div class="k-kv"><span class="k">座位</span><span class="v">32A 靠窗</span></div>'
      +'<div class="k-kv"><span class="k">准点率</span><span class="v">近 7 天 92%</span></div></div>'
      +actRow('航班动态','在线值机')); return; }
    if(/查看路线|路线/.test(t)){ openSheet('推荐路线',
      '<div class="k-map"></div><div class="k-card"><span class="t">用时最短 · 约 20 分钟</span>'
      +'<p>避开早高峰拥堵路段，全程 12.5 公里，比常规路线快约 8 分钟。</p></div>'
      +actRow('换一条','开始导航')); return; }
    if(/取件码|出示/.test(t)){ openSheet('取件码',
      '<div class="k-card"><div class="k-code">8-2-3056</div><div class="k-bars">'+Array(26).join('<i></i>')+'</div>'
      +'<p style="text-align:center;margin-top:8px">向菜鸟驿站工作人员出示此码即可取件</p></div>'
      +'<div class="k-card"><div class="k-kv"><span class="k">驿站</span><span class="v">地铁 B 口 80 米</span></div>'
      +'<div class="k-kv"><span class="k">营业至</span><span class="v">今日 22:00</span></div></div>'
      +actRow('复制取件码','叫跑腿代取')); return; }
    if(/查看资料|资料/.test(t)){ openSheet('相关资料',
      '<div class="k-card"><div class="k-kv"><span class="k">📄 评审材料 v3.pptx</span><span class="v">已备好</span></div>'
      +'<div class="k-kv"><span class="k">📄 会议纪要模板.docx</span><span class="v">待填</span></div>'
      +'<div class="k-kv"><span class="k">📊 上季度数据.xlsx</span><span class="v">已附</span></div></div>'
      +actRow('发给参会人','全部打开')); return; }
    // 通用信息 sheet
    openSheet(t||'详情','<div class="k-card"><p>AI 已为你整理好这一项的详细信息（示意）。在真实场景里这里会展示完整的二级页面内容。</p></div>'+actRow('','知道了'));
  }

  /* ---------- 行/卡片 → 二级 Sheet（内容类） ---------- */
  function rowSheet(el){
    var title=firstBold(el);
    if(el.matches('.kp')){ openSheet(title,
      '<div class="k-card"><span class="t">考点要点（AI 整理）</span>'
      +'<div class="k-bul"><i></i><span>给出严格定义与直观含义，先理解再记忆。</span></div>'
      +'<div class="k-bul"><i></i><span>结合 2 道典型例题，掌握标准解题步骤。</span></div>'
      +'<div class="k-bul"><i></i><span>标出易错点与考试高频出法。</span></div></div>'
      +actRow('加入复习计划','生成练习题')); return; }
    if(el.matches('.flight')){ actionSheet('行程详情'); return; }
    if(el.matches('.xrow')){ var p=el.querySelector('p'); openSheet(title,
      '<div class="k-card"><p>'+esc(p?p.innerText:'来自小红书的图文内容。')+'</p>'
      +'<div class="k-kv" style="margin-top:6px"><span class="k">来源</span><span class="v">小红书 · 图文</span></div></div>'
      +actRow('打开原文','收藏到合集')); return; }
    if(el.matches('.coll')){ openSheet(title,
      '<div class="k-card"><p>这个合集里的笔记已按主题自动归类，可随时翻阅、续写或分享。</p></div>'
      +actRow('分享合集','打开合集')); return; }
    if(el.matches('.med')){ openSheet(title,
      '<div class="k-card"><div class="k-kv"><span class="k">用法</span><span class="v">'+esc(txtOf(el,'.mc p'))+'</span></div>'
      +'<div class="k-kv"><span class="k">库存</span><span class="v">'+esc(txtOf(el,'.mr b'))+'</span></div>'
      +'<div class="k-kv"><span class="k">下次服用</span><span class="v">按今日用药时间</span></div></div>'
      +actRow('设为提醒','一键补药')); return; }
    if(el.matches('.route')){ openSheet(title,
      '<div class="k-map"></div><div class="k-card"><p>'+esc(txtOf(el,'.rc p'))+'</p></div>'
      +actRow('换一条','选择此方案并导航')); return; }
    if(el.matches('.crow')){ openSheet('高等数学 A',
      '<div class="k-card"><div class="k-kv"><span class="k">时间</span><span class="v">'+esc(txtOf(el,'.tm'))+'</span></div>'
      +'<div class="k-kv"><span class="k">地点</span><span class="v">教学楼 A203</span></div>'
      +'<div class="k-kv"><span class="k">任课老师</span><span class="v">张老师</span></div></div>'
      +actRow('请假','添加到日程')); return; }
    if(el.matches('.ppl')){ openSheet(title,
      '<div class="k-card"><p>'+esc(txtOf(el,'.pc s'))+'</p></div>'+actRow('发消息','')); return; }
    if(el.matches('.tli')){ var tc=el.querySelector('.tc'); openSheet(firstBold(tc||el),
      '<div class="k-card"><p>'+esc(txtOf(tc||el,'p'))+'</p></div>'+actRow('设为提醒','标记完成')); return; }
    // 通用
    var p2=el.querySelector('p,s,.lc p,.sc p'); openSheet(title,
      '<div class="k-card"><p>'+esc(p2?p2.innerText:el.innerText)+'</p></div>'+actRow('','知道了'));
  }
  function txtOf(el,sel){ var n=el.querySelector(sel); return n?n.innerText.trim():''; }

  /* ---------- 查看更多：展开更多行 ---------- */
  function expandMore(btn){
    var card=btn.closest('.card')||btn.parentElement;
    var rows=card.querySelectorAll('.kp,.xrow,.li,.irow,.sug');
    if(rows.length){ var last=rows[rows.length-1];
      for(var i=0;i<2;i++){ var c=last.cloneNode(true); card.insertBefore(c,btn); }
    }
    btn.style.display='none'; toast('已展开更多');
  }

  /* ---------- 问小爱 Chat ---------- */
  function sceneName(){ var h=document.querySelector('.htitle'); return h?h.innerText.trim():'这个场景'; }
  function chatChips(){
    var n=sceneName(), map={
      '高数课程':['帮我梳理这章重点','生成一套模拟卷','考前还要准备什么'],
      '稻城亚丁旅行':['帮我排一下每天行程','有什么高原注意事项','整理这些收藏成攻略'],
      '今天':['今天还有哪些事没做','帮我把评审纪要写好','晚上聚餐要带什么'],
      '下班回家':['现在哪条路最快','帮我顺路买点菜','到家前把空调打开'],
      '带娃看病':['就诊前要准备什么','帮我整理孩子的症状','开完药提醒我吃药'],
      '约饭':['帮我看看这家招牌菜','谁还没确认','买单怎么 AA'],
      '回老家':['给爸妈带点什么好','帮我盯返程票','老家这两天天气'],
      '生日纪念':['送妈妈什么礼物好','帮我订个蛋糕','生成一段祝福语'],
      '健康用药':['这几种药能一起吃吗','妈妈今天按时吃药了吗','血压偏高要注意什么'],
      '收寄快递':['帮我约个上门取件','哪些快递快到了','猫砂太重能代取吗']
    };
    return map[n]||['帮我总结一下','接下来该做什么','还有什么要注意'];
  }
  function aiReply(q){
    return '好的，我来帮你处理「'+q+'」。我已经根据这个场景里的信息为你整理好，稍后同步到你的待办里，有需要随时叫我。';
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
    // 关闭 sheet
    if(e.target.closest('.k-x')||e.target.classList.contains('k-bg')){ closeSheet(); return; }
    // sheet 内部：聊天 chips / 发送 / 操作按钮
    if(e.target.closest('.k-panel')){
      var chip=e.target.closest('.k-chips button'); if(chip){ sendChat(chip.textContent); return; }
      if(e.target.closest('.k-inbar .send')){ var inp=sIn.querySelector('input'); sendChat((inp.value||'').trim()); inp.value=''; return; }
      var ab=e.target.closest('.k-act button'); if(ab){ var tt=pickToast(ab.textContent)||'已完成 ✓'; closeSheet(); setTimeout(function(){toast(tt);},160); return; }
      return;
    }
    // AI 小球
    if(e.target.closest('.fab')){ e.preventDefault(); openChat(); return; }
    // 勾选 / 返回：交给各页自身
    if(e.target.closest('.ck')) return;
    if(e.target.closest('.back, .nav .ib:first-child')) return;

    var act=e.target.closest('button, a, .go, .act, .more, .rbtns a');
    var row=e.target.closest('.kp, .flight, .xrow, .coll, .med, .route, .crow, .ppl, .tli, .li, .sug');
    if(act){ e.preventDefault();
      var t=(act.innerText||act.textContent||'').trim();
      if(/查看更多|更多/.test(t)){ expandMore(act); return; }
      if(/查看资料|资料|行程详情|航班|查看车票|车票|查看路线|路线|取件码|出示|查看$|详情|看看/.test(t)){ actionSheet(t); return; }
      var tm=pickToast(t); if(tm){ toast(tm); return; }
      actionSheet(t); return;
    }
    if(row){ e.preventDefault(); rowSheet(row); return; }
  },true);

  // Enter 发送
  sIn.querySelector('input').addEventListener('keydown',function(e){ if(e.key==='Enter'){ var v=(this.value||'').trim(); sendChat(v); this.value=''; } });

  window.os5toast=toast;

  // 深链 / 自检：#k-chat 开问小爱，#k-sheet 开示例二级页，#k-toast 示例提示
  if(/^#k-(chat|sheet|toast)/.test(location.hash||'')){
    setTimeout(function(){ var h=location.hash;
      if(h.indexOf('chat')>0) openChat();
      else if(h.indexOf('sheet')>0) actionSheet('查看路线');
      else toast('已为你设置提醒 🔔');
    },320);
  }
})();
