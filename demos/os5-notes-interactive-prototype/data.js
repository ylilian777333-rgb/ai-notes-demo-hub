const PAGE_NAMES={notes:'笔记',home:'合集',course:'高等数学',tasks:'待办',ideas:'职业方向思考',interview:'扫地机用户访谈',cards:'卡证票据'};
const STORAGE_KEY='os5-notes-prototype-20260915';
const seedNotes=[
 {id:'welcome',title:'欢迎使用小米笔记',text:'小米笔记，开口能记，智能会理 语音速记 开会上课都能记。\n\n随口记录，相关的内容会慢慢聚成合集。\n在「合集」里继续学习、回顾想法、查看访谈洞察，或完成一件待办。',date:'周二 13:38',category:'生活'},
 {id:'weekend',title:'周六行程与采购清单',text:'周六下午2点去奥体打羽毛球，结束后顺路去小区快递站取快递。\n\n采购清单\n• 洗护套装、防晒霜、遮阳伞\n• 充电宝、转接头、自拍杆\n• 扳手、改锥、手电筒',date:'7月14日 18:20',category:'生活',collection:'tasks'},
 {id:'q3',title:'Q3团队分享会策划讨论',text:'会议概括 主题：Q3团队分享会整体策划，主打内部知识交流。\n\n会议纪要\n1. 分享会采用主题演讲与圆桌讨论相结合的形式。\n2. 每位讲者围绕一个具体问题展开。\n3. 汇总问题，沉淀为会后材料。\n\n待办\n完成需求文档初稿；下班前整理会议纪要并发给团队。',date:'7月14日 10:02',category:'工作',collection:'tasks'},
 {id:'solar',title:'太阳系八大行星课堂笔记',text:'太阳系八大行星概述 太阳系目前有 8颗大行星。2006年冥王星被归类为矮行星。\n\n由近及远：水星、金星、地球、火星、木星、土星、天王星、海王星。\n\n类地行星：水星、金星、地球、火星。\n巨行星：木星、土星；冰巨星：天王星、海王星。',date:'7月13日 19:35',category:'生活'},
 {id:'nanjing',title:'周末南京 2 日短途旅行计划',text:'📅 3 月 22 日 - 3 月 23 日 | 春日踏青\n\n第一天：南京博物院 → 明城墙 → 夫子庙。\n第二天：玄武湖散步 → 老门东 → 返程。\n\n出门前带好身份证、雨伞与充电宝。',date:'5月12日',category:'生活',thumbnail:true},
 {id:'recipe',title:'番茄炖牛腩家常食谱',text:'牛腩焯水，番茄炒出汁。加入热水小火慢炖，最后加盐调味。',date:'5月10日 12:04',category:'生活'},
 {id:'call',title:'装修沟通 · 客厅软装',text:'通话笔记：客厅先选落地灯和装饰画，确定整体色调后再搭配地毯。',date:'5月8日 16:22',category:'通话笔记',collection:'tasks'}
];
const seedTasks=[
 {id:'draft',title:'完成需求文档初稿',time:'今天 10:30',category:'新品发布会',week:true,done:false},
 {id:'plants',title:'给植物浇水',time:'今天 14:30',category:'生活',week:true,done:false},
 {id:'tickets',title:'买演唱会门票',time:'明天 17:00',category:'生活',week:true,done:false},
 {id:'travel',title:'周末出行准备',time:'周五 15:00',category:'生活',done:false,children:[{id:'wash',title:'洗护套装、防晒霜、遮阳伞',done:false},{id:'power',title:'充电宝、转接头、自拍杆',done:false},{id:'tools',title:'扳手、改锥、手电筒',done:false}]},
 {id:'furnish',title:'软装采购',time:'',category:'装修',done:false,children:[{id:'lamp',title:'买客厅落地灯',done:false},{id:'art',title:'买装饰画',done:false},{id:'rug',title:'选一张客厅地毯',done:false}]},
 {id:'station',title:'去火车站接米粒',time:'12/28 13:30',category:'生活',done:false},
 {id:'museum',title:'参观中国美术馆',time:'',category:'生活',done:false},
 {id:'market',title:'逛艺术市集',time:'12/28 13:30',category:'生活',done:false},
 {id:'expo',title:'去漫展',time:'12/28 13:30',category:'生活',done:false},
 {id:'reading',title:'陪孩子读完一本书',time:'周日 16:00',category:'孩子',done:false},
 {id:'comedy',title:'二刷喜人奇妙夜',time:'',category:'生活',done:true},
 {id:'anime',title:'补新番剧',time:'下午5:00',category:'生活',done:true}
];
const chapters=[
 {title:'极限与连续',summary:'本章是整个微积分的地基。用 ε 语言把“无限趋近”讲严格，掌握极限的计算方法，再理解函数的连续性与间断点。重点是极限计算。',total:10,mastered:4,points:['ε-N / ε-δ 定义——写法和使用','夹逼定理——证明题必考','单调有界准则——判定收敛','连续三条件与间断点分类'],short:['极限的定义','夹逼定理','单调有界准则','连续与间断点']},
 {title:'导数与微分',summary:'从变化率出发理解导数的定义与几何意义，熟悉复合函数和隐函数求导。把链式法则用熟，再用洛必达法则处理未定式极限。',total:8,mastered:2,points:['导数定义与几何意义','链式法则——后续所有计算的基础','隐函数求导','洛必达法则'],short:['导数定义','链式法则','隐函数求导','洛必达法则']},
 {title:'微分中值定理与导数的应用',summary:'用罗尔定理和拉格朗日中值定理连接局部变化与整体变化，再用导数分析函数的单调性、极值与最值。',total:8,mastered:0,points:['罗尔定理与拉格朗日中值定理','柯西中值定理','函数的单调性与极值','函数图形与最值问题'],short:['中值定理','柯西中值定理','单调性与极值','最值问题']}
];
const sources={
 product:{title:'关于产品方向',date:'8月28日 19:00',quote:'又画了一天图，其实我更想知道这些需求背后是怎么定的。',body:'今天对着需求改了很多版视觉稿。做完之后，最想弄清楚的却是：我们为什么要做这个功能，用户到底在哪个环节遇到了问题？\n又画了一天图，其实我更想知道这些需求背后是怎么定的。',scope:'ideas'},
 transfer:{title:'内部转岗',date:'今天 12:00',quote:'如果能转产品，在哪家公司反而没那么重要了。',body:'和产品同事吃午饭，聊到他们怎么做用户调研和排需求优先级。\n如果能转产品，在哪家公司反而没那么重要了。\n下一步先了解内部转岗的条件，也试着参与一次需求定义。',scope:'ideas'},
 performance:{title:'绩效沟通后的一些想法',date:'9月8日 12:00',quote:'想留下来，是因为熟悉团队；想走，是因为怕一直停在原地。',body:'今天绩效沟通时，发现我对环境没有那么不满意，真正担心的是成长停下来。\n想留下来，是因为熟悉团队；想走，是因为怕一直停在原地。\n也许应该先把想做的岗位想清楚。',scope:'ideas'},
 interviewjob:{title:'星河科技一面',date:'9月1日 18:00',quote:'换一家公司继续只做视觉，好像还是同一个问题。',body:'面试之后在想：新公司的机会很好，但工作内容似乎没有太大变化。\n换一家公司继续只做视觉，好像还是同一个问题。',scope:'ideas'},
 align:{title:'需求评审后的复盘',date:'8月20日 21:00',quote:'如果能提前和开发确认边界，最后一轮返工也许就能省掉。',body:'视觉方案到最后才发现技术方案做不到。\n如果能提前和开发确认边界，最后一轮返工也许就能省掉。\n下次在评审之前就把关键限制问清楚。',scope:'ideas'},
 growth:{title:'我想要怎样的成长',date:'8月15日 22:10',quote:'我想参与决定做什么，而不只是把已确定的东西画出来。',body:'今天记一下自己真正喜欢的部分：和人聊问题，理清需求，试着解释取舍。\n我想参与决定做什么，而不只是把已确定的东西画出来。',scope:'ideas'},
 chen:{title:'用户1-陈曦-租房白领',date:'9月10日 15:30',time:'08:12',quote:'我要的是彻底解放双手。',body:'问：你最希望扫地机替你做什么？\n答：我要的是彻底解放双手。每天回来不用再想着扫地、倒灰、洗拖布。\n\n问：你会为什么功能多花钱？\n答：自动集尘和洗拖布。如果最后还要我一直伺候它，就没什么意义了。',scope:'interview'},
 liu:{title:'用户2-刘婷-有娃家庭',date:'9月11日 10:00',time:'12:46',quote:'我怕它扫不干净还得我返工。',body:'问：购买前最担心什么？\n答：我怕它扫不干净还得我返工。家里有孩子，地板上经常有食物碎屑。\n\n问：价格是主要顾虑吗？\n答：贵一点能接受，我更想知道它到底能不能扫干净。参数太多，真的选不明白。',scope:'interview'},
 zhou:{title:'用户3-老周-退休',date:'9月12日 09:30',time:'05:20',quote:'我就想按一个键它就开始扫。',body:'问：平时会打开手机上的扫地机应用吗？\n答：我就想按一个键它就开始扫。每次还要打开手机，设置房间，太复杂了。\n\n问：你会用自动分区或复杂设置吗？\n答：不会。我不想为了打扫屋子先学一遍说明书。',scope:'interview'},
 course0:{title:'高等数学 · 极限与连续',date:'今天 10:31',time:'08:15',quote:'极限关注靠近时的趋势。函数在这一点有没有定义，是另一个问题。',body:'课堂要点\n1. 对任意 ε > 0，存在 δ > 0，当 0 < |x-a| < δ 时，|f(x)-L| < ε。\n2. 左右极限存在且相等，函数在该点的极限才存在。\n3. 连续需要：有定义、极限存在、极限等于函数值。',scope:'course'},
 course1:{title:'高等数学 · 导数与微分',date:'9月12日 10:31',time:'14:08',quote:'复合函数求导，需要把每一层的导数乘起来。',body:'课堂要点\n导数表示局部变化率，也是切线的斜率。\n链式法则：(f(g(x)))′ = f′(g(x)) · g′(x)。\n例：sin(x²) 的导数是 cos(x²) · 2x。',scope:'course'},
 course2:{title:'高等数学 · 微分中值定理',date:'9月13日 10:31',time:'18:32',quote:'在满足条件时，总有一点的瞬时变化率等于整个区间的平均变化率。',body:'拉格朗日中值定理\n函数在闭区间连续、开区间可导，则至少存在一点 ξ，使 f′(ξ) = (f(b)-f(a))/(b-a)。\n先核对适用条件，再使用结论。',scope:'course'}
};
const ideaInsights=[
 {title:'想不想从设计转产品',text:'你对业务逻辑、“为什么做”越来越感兴趣，觉得只做视觉不够。转产品可能是你真正想要的方向，换不换公司反而是其次。',sources:['product','transfer']},
 {title:'想留和想走的理由，其实不冲突',text:'熟悉的团队带来安全感，新的方向带来成长。你想留住的是人与合作方式，想改变的是工作内容。先确认能否在现有环境里向产品方向迈一步。',sources:['performance','interviewjob']},
 {title:'总是到最后才和相关方对齐',text:'几次记录都提到了“最后才发现不一致”。把对齐提前到需求定义与评审之前，可能是一个现在就能开始的改变。',sources:['align','growth']}
];
const interviewInsights=[
 {title:'不同人群，诉求高度分化',text:'三位用户看重的点几乎没交集：解放双手、扫得干净、操作简单。一款产品很难通吃，需要按人群做差异化定位。',sources:['chen','liu','zhou']},
 {title:'自动化是把双刃剑',text:'同样的高端自动化功能，对年轻人是买单理由，对老人是弃用原因。高端功能并非越多越好，对银发人群反而是负担。',sources:['chen','zhou']},
 {title:'挡住成交的不是钱，是选不明白',text:'用户很难把参数转换成自己家的清洁效果。比起继续增加参数，具体场景的效果展示、更简单的选择依据，可能更能减少购买顾虑。',sources:['liu']}
];
const ideaSummary='过去半年的记录几乎都围绕同一个问题：要不要换工作。但把这些零散的想法放在一起看，真正的纠结点并不在“去还是留”，而在于“到底想做什么”还没有想清楚。';
const ideaDirection='记录中多次提到对业务逻辑、对“为什么这么做”的兴趣越来越浓，只做视觉执行已经无法满足。这个念头并非一时兴起，而是半年里反复出现，甚至有一条明确写道——只要能转产品，在哪家公司反而没那么重要。这说明真正的诉求是岗位方向的转变，公司归属是次要的。';
const ideaActions=['找一位产品同事，聊清楚内部转岗怎么走','下个需求，评审之前先对齐技术边界','把“提前对齐”当成一个月的刻意练习。'];
const interviewOverview='三类用户要的几乎是三种产品：年轻人要自动化解放双手，家庭用户要扫得干净、不怕贵就怕失望，老人要一键傻瓜式。最反常识的是——自动化对年轻人是卖点，对老人反而是劝退点。而且挡住成交的往往不是价格，是“选不明白”和“用不明白”。';
const interviewGoal='弄清用户选购扫地机器人时最看重什么、最后买或不买的真实原因。深度访谈 3 位近半年考虑或购买过扫地机器人的消费者。';
const interviewConclusion='这个品类不存在“通用的好产品”，不同人群要的几乎是三种不同的东西。追求自动化的年轻人、追求品质的家庭用户、追求简单的银发用户，诉求几乎没有交集。产品需要按人群做差异化，而非用一款通吃。';
const credentials=[
 {id:'id1',title:'秦小球的身份证',name:'秦小球',label:'姓名',secretLabel:'号码',mask:'*****************',value:'DEMO-ID-001',category:'身份证',style:'',icon:'person'},
 {id:'wifi',title:'我家的wifi',name:'A08-1211',label:'名称',secretLabel:'密码',mask:'************',value:'DemoWifi-2026',category:'卡密',style:'wifi',icon:'globe'},
 {id:'invoice',title:'公司发票抬头',name:'A08-1211',label:'名称',secretLabel:'密码',mask:'************',value:'DEMO-INVOICE',category:'发票抬头',style:'invoice',icon:'receipt'},
 {id:'id2',title:'爸爸身份证',name:'秦伟强',label:'姓名',secretLabel:'号码',mask:'*****************',value:'DEMO-ID-002',category:'身份证',style:'',icon:'person'},
 {id:'license',title:'驾驶证',name:'秦小球',label:'姓名',secretLabel:'号码',mask:'*****************',value:'DEMO-LICENSE',category:'驾驶证',style:'license',icon:'steering'}
];
function initialState(){return {notes:structuredClone(seedNotes),tasks:structuredClone(seedTasks),mastered:[],savedSummaries:[],addedActions:[],supplements:{},nextId:1};}
let state=initialState();
try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved&&Array.isArray(saved.notes)&&Array.isArray(saved.tasks)&&Array.isArray(saved.mastered)&&Array.isArray(saved.savedSummaries)&&Array.isArray(saved.addedActions)&&saved.supplements&&Number.isInteger(saved.nextId))state=saved;}catch{}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{return false;}}
let page='notes',noteFilter='全部',noteQuery='',taskFilter='全部',cardFilter='全部',cardQuery='',chapterIndex=0,interviewTab='insights';
const openChapters=new Set([0,1]),openIdeas=new Set([0]),openInterviews=new Set([0]),collapsedTasks=new Set(),revealedCards=new Set();
let completedOpen=true,ideaFull=false,interviewFull=false,timelineFull=false,compareMode=false,fullPageMode=false;
let navigation=[],captureScope='notes',captureMode='text',captureDraft='',chatScope='ideas',chatLog=[],quizIndex=0,quizAnswer=null,slideIndex=0,sheetReturnFocus=null;
