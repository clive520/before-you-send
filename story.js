'use strict';

const STORAGE = 'xiaoyu-story-v1';
const app = document.querySelector('#app');
const guide = document.querySelector('#guide');
document.querySelector('#guide-open').addEventListener('click', () => guide.showModal());
document.querySelector('#guide-close').addEventListener('click', () => guide.close());
document.querySelector('#brand').addEventListener('click', event => { event.preventDefault(); home(); });
let answers = [];
let phase = 'home';
let readingLevel = 'elementary';
try { if (localStorage.getItem('xiaoyu-reading-level') === 'junior') readingLevel = 'junior'; } catch {}

const facts = a => ({
  hurt: [2, 3].includes(a[2]) || a[3] === 2 || a[4] === 2,
  shared: a[3] === 2,
  insulted: a[2] === 2,
  blamed: a[2] === 3,
  stayedLate: a[1] === 2,
  repair: a[4] === 1 || a[4] === 3 || a[5] === 1 || a[5] === 2,
  help: a[1] === 3 || a[3] === 1 || a[4] === 3 || a[5] === 2,
  plan: a[5] === 0 || a[5] === 2,
});

const chapters = [
  {
    title: '今晚的限時任務', label: '放學後・小宇的房間',
    body: () => `<p>放學回到家，小宇放下書包，準備開始寫作業。這時，手機亮了起來。</p><p>遊戲推出了限時任務，朋友們在群組裡熱烈討論。小宇也很想和大家一起玩，但明天還要早起上課。</p><div class="quote">「今晚一起解任務吧！錯過就要再等好久！」</div>`,
    choices: () => [
      ['先完成該做的事，再和朋友約定遊戲時間。','小宇先把眼前的事情完成，再和朋友約好一起玩的時間。朋友雖然要等一下，還是答應了。'],
      ['先玩一場，設定提醒，時間到了再決定。','小宇先加入朋友，並設定了一個提醒。遊戲很有趣，待會兒他還需要決定時間到了怎麼做。'],
      ['馬上上線，心想「應該不會玩太久」。','小宇迫不及待地加入了遊戲。任務一關接著一關，他沒有特別留意時間。'],
      ['先和家人討論，今晚要怎麼安排。','小宇告訴家人自己很想參加活動。兩人討論了遊戲、作業和睡覺的安排。']
    ],
    thought:'喜歡遊戲、想和朋友一起玩，都是可以理解的事。想一想，怎麼安排才不會忽略其他重要的事？'
  },
  {
    title:'時間到了，朋友還在線上', label:'夜晚・遊戲進行中',
    body: a => `<p>${a[0] === 0 ? '完成原本要做的事後，小宇開心地和朋友一起玩遊戲。' : a[0] === 1 ? '提醒響了，小宇抬頭看了一下時間。' : a[0] === 2 ? '小宇玩得正起勁，這才發現時間比想像中晚了。' : '小宇和家人討論的遊戲時間快到了。'}</p><p>大家剛好快完成任務，小宇有點捨不得離開。但明天還要上課，他也開始覺得有點累。</p><div class="quote">「再一場就好啦！現在離開很可惜耶！」</div>`,
    choices: () => [
      ['告訴朋友要休息，約好下次再玩。','小宇向朋友道晚安。雖然有點捨不得，但他把休息時間留給了自己。'],
      ['確認還需要多久，和家人討論是否調整安排。','小宇先問清楚任務需要的時間，再和家人商量。即使想多玩一點，他也需要考慮明天的精神。'],
      ['繼續玩，並關掉提醒，不再看時間。','小宇告訴自己「再一下下」。等他終於關掉遊戲，已經比原本打算睡覺的時間晚了不少。'],
      ['發現自己常常停不下來，找可信任的大人聊聊。','小宇說出自己的困擾。大人先聽他說，也和他一起想能不能找到比較容易做到的安排。']
    ],
    thought:'如果想停卻反覆停不下來，或經常影響睡眠、學習和心情，可以找可信任的大人聊聊。'
  },
  {
    title:'遊戲輸了，情緒上來了', label:'下一次遊戲・隊伍頻道',
    body: () => `<p>隔天下午，小宇又和朋友們一起玩了一場遊戲。最後一刻，隊伍沒能完成任務。</p><p>有人覺得是小安沒有照原本的計畫行動。小宇也很失望，但他其實不確定小安當時看到了什麼。</p><div class="quote">「剛剛到底是怎麼回事？」有人在群組問。</div>`,
    choices: () => [
      ['先離開一下，等心情平靜後再討論。','小宇暫時放下手機，喝了口水。等他冷靜一些，才回來看大家的訊息。'],
      ['說出自己的感受，並詢問小安發生了什麼事。','小宇說自己有點失望，接著問小安當時的情況。小安解釋，他的畫面剛剛突然卡住了。'],
      ['在群組裡用難聽的話羞辱小安。','小宇生氣地發出了羞辱小安的話。群組安靜了一下，小安沒有再回覆。小宇發現，這些話可能真的傷了人。'],
      ['把責任全推給小安，要求大家以後不要和他組隊。','小宇在還沒弄清楚事情之前，就要求大家排除小安。有同學開始附和，小安的處境變得很尷尬。']
    ],
    thought:'生氣是正常的感受；要怎麼表達，是我們可以練習的選擇。討論事情和羞辱別人，帶來的影響不同。'
  },
  {
    title:'群組裡的一則傳聞', label:'當晚・班級群組',
    body: a => `<p>${[2,3].includes(a[2]) ? '剛才的爭執還沒有平息，班級群組又出現了一則訊息。' : '遊戲結束後，班級群組出現了一則關於小安的訊息。'}</p><div class="quote">「聽說小安以前也故意害隊友輸，大家不要跟他玩。」</div><p>發訊息的人沒有說明從哪裡聽來的，卻已經有人開始附和。小宇不知道這件事是不是真的。</p>`,
    choices: () => [
      ['提醒大家還沒有確認，先不要擴散。','小宇提醒大家，現在只是聽說，還不能當成事實。有人停下來思考，也有人表示想知道真相。'],
      ['私下關心小安，必要時找可信任的老師協助。','小宇傳訊息問小安：「你還好嗎？需要我陪你找老師嗎？」小安知道自己並不孤單。'],
      ['沒有查證，就把傳聞轉到另一個群組。','訊息很快傳到更多人那裡。有些人不知道事情是否真實，就開始對小安產生負面印象。'],
      ['詢問消息來源，不轉傳，也不急著下結論。','小宇問這個消息從哪裡來，卻沒有人能說清楚。他決定先不把傳聞當成事實。']
    ],
    thought:'一則「聽說」可能傳得很快。按下分享之前，先想想資訊從哪裡來、是否真實，以及可能傷害誰。'
  },
  {
    title:'隔天，大家還在討論', label:'隔天・教室裡',
    body: a => {
      const f=facts(a);
      return `<p>隔天到學校後，小宇發現同學們還在談論昨晚群組裡的事。小安坐在位子上，神情看起來不太自在。</p>${f.stayedLate ? '<p>小宇也想起前一天玩到很晚，早上起床時覺得很疲倦。他開始想，最近的作息是不是需要調整。</p>' : '<p>小宇想起最近幾天的遊戲和群組對話，發現一個晚上發生的事，也會帶到隔天的教室裡。</p>'}${f.hurt ? '<p>小宇也想起自己之前說過或傳過的內容，不知道小安現在怎麼看待這件事。</p>' : '<p>小宇想知道，小安現在的感受，以及他希望得到什麼幫助。</p>'}`;
    },
    choices: a => [
      ['先聽小安的想法，不急著替他決定。','小宇走近小安，問他願不願意聊聊。小安說，他不喜歡大家在還沒弄清楚之前就一直討論他。'],
      facts(a).hurt ? ['停止擴散，並移除或更正自己發過的不當內容。','小宇停止繼續散布，並處理自己發過的內容。他知道，即使移除訊息，也不能保證已經看過的人都會忘記。'] : ['提醒分享的人停止擴散，並請他們處理已分享的內容。','小宇提醒同學不要再傳，並請分享的人處理已發出的內容。但他也知道，訊息不一定能完全收回。'],
      ['繼續和同學談論傳聞，覺得這只是聊天。','傳聞在同學之間繼續流傳。小安聽到了，覺得很不舒服，也更擔心大家怎麼看他。'],
      ['找導師、輔導老師或其他可信任的大人協助。','小宇向老師說明自己知道的事情。老師先聆聽各方想法，再一起討論如何保護同學並釐清事件。']
    ],
    thought:'事情已經發生時，停止擴散、聆聽當事人，以及尋求適當協助，都可能是重要的一步。'
  },
  {
    title:'接下來，小宇想怎麼做？', label:'放學後・新的選擇',
    body: a => `<p>這幾天，小宇發現遊戲和朋友都很重要，但睡眠、心情和同學之間的信任也需要照顧。</p><p>${facts(a).hurt ? '他想到自己在這件事中的行動，也知道有些影響不能當作沒發生。' : '他希望小安能得到需要的支持，也想讓自己以後遇到類似情況時知道怎麼做。'}</p><div class="quote">「如果從現在開始，我可以做些什麼呢？」</div>`,
    choices: a => [
      ['和可信任的大人討論，訂出可行的上網與休息計畫。','小宇和大人一起討論：什麼時間可以玩、什麼時候需要休息，遇到做不到的時候再調整。'],
      facts(a).hurt ? ['承認自己的行為、道歉，並詢問小安希望如何處理。','小宇承認自己做過的事，也向小安道歉。他知道，道歉不能要求對方立刻原諒。'] : ['關心小安，詢問他希望得到什麼協助。','小宇關心小安，並先聽他的想法，沒有替他決定應該怎麼做。'],
      ['同時調整生活安排、處理群組事件，必要時請大人協助。','小宇找可信任的大人討論，一起想怎麼照顧作息，也協助處理群組裡尚未解決的問題。'],
      ['覺得事情過了就好，先不理會。','小宇暫時不想面對這些事。但有些人的感受和尚未處理的問題，不一定會因此消失。']
    ],
    thought:'改變和修復都需要時間。如果不知道從哪一步開始，可以先找一位願意聽你說話的大人。'
  }
];

function save(){try{localStorage.setItem(STORAGE, JSON.stringify(answers));}catch{}}
function load(){try{const a=JSON.parse(localStorage.getItem(STORAGE));return Array.isArray(a)&&a.length<=chapters.length&&a.every(n=>Number.isInteger(n)&&n>=0&&n<4)?a:[];}catch{return [];}}
function reset(){answers=[];try{localStorage.removeItem(STORAGE);}catch{}}
function focusMain(){app.setAttribute('tabindex','-1');app.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function art(){return `<svg viewBox="0 0 540 470" role="img" aria-label="小宇坐在桌前看著螢幕，窗外是夜空和月亮" preserveAspectRatio="xMidYMid meet"><circle cx="306" cy="225" r="175" fill="#c4e2d1"/><circle cx="405" cy="83" r="26" fill="#fff2bc"/><circle cx="416" cy="74" r="23" fill="#c4e2d1"/><path d="M135 344h320" stroke="#638c77" stroke-width="7" stroke-linecap="round"/><rect x="185" y="123" width="220" height="150" rx="13" fill="#f6fbf5"/><rect x="199" y="137" width="192" height="121" rx="7" fill="#8bbca7"/><path d="M218 236c25-39 47-20 69-51 23 24 45 1 88 38v35H218z" fill="#b9dfc5"/><circle cx="350" cy="163" r="13" fill="#f7e8ac"/><path d="M295 273v25m-38 0h75" stroke="#f6fbf5" stroke-width="9" stroke-linecap="round"/><path d="M240 344c6-64 28-93 64-93s58 29 64 93" fill="#4b7868"/><path d="M267 344c0-45 11-70 37-70s37 25 37 70" fill="#eeaa82"/><circle cx="304" cy="235" r="35" fill="#edba98"/><path d="M269 230c-2-30 15-42 37-42s39 14 35 43c-7-5-16-14-18-23-11 14-31 20-54 22z" fill="#314b42"/><path d="M145 344v39m300-39v39" stroke="#638c77" stroke-width="7" stroke-linecap="round"/><rect x="137" y="324" width="48" height="20" rx="5" fill="#f4b891"/><path d="M157 324c-3-15-11-20-18-25m18 25c6-17 15-23 24-25" fill="none" stroke="#68947b" stroke-width="5" stroke-linecap="round"/><path d="M90 157l4 9 9 4-9 4-4 9-4-9-9-4 9-4zM449 235l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff8df"/><path d="M117 228h27M130 215v27" stroke="#eff9ef" stroke-width="3" stroke-linecap="round"/></svg>`;}
function home(){phase='home';const existing=load();app.innerHTML=`<section class="home"><div class="hero"><div class="hero-copy"><div class="tag">一個會隨你的選擇改變的故事</div><h1>按下送出之前<span>。</span></h1><p>一場遊戲、一則訊息，還有一連串意想不到的選擇。和小宇一起走進他的網路生活，看看每個選擇會帶來什麼。</p><div class="level"><label for="level">閱讀版本</label><select id="level"><option value="elementary">國小高年級</option><option value="junior">國中（含進階法律說明）</option></select></div><div class="actions"><button class="button" id="start">開始閱讀</button><span class="hint">約 15–20 分鐘・不需要註冊</span></div>${existing.length ? '<div class="resume"><button class="link-button" id="resume">繼續上次的故事</button>　<button class="link-button" id="clear">清除儲存進度</button></div>' : ''}</div><div class="art">${art()}</div></div><div class="intro"><div><span class="eyebrow">A STORY ABOUT CHOICES</span><h2>每個選擇，<br>都讓故事有了不同。</h2><p>這裡沒有需要急著猜對的答案。讀一讀、想一想，看看你的選擇會如何影響自己和身邊的人。</p></div><div class="steps"><article class="step"><div class="step-icon" aria-hidden="true">☼</div><h3>走進故事</h3><p>跟著小宇，遇見熟悉的網路日常。</p></article><article class="step"><div class="step-icon" aria-hidden="true">✳</div><h3>做出選擇</h3><p>每一個時刻，都有四種行動可以選。</p></article><article class="step"><div class="step-icon" aria-hidden="true">♡</div><h3>看看結果</h3><p>理解影響，也練習重新開始。</p></article></div></div></section>`;
 const level=document.querySelector('#level');level.value=readingLevel;level.onchange=()=>{readingLevel=level.value;try{localStorage.setItem('xiaoyu-reading-level',readingLevel);}catch{}};document.querySelector('#start').onclick=()=>{reset();renderNode(0);};const resume=document.querySelector('#resume');if(resume)resume.onclick=()=>{answers=load();answers.length===chapters.length?renderEnding():renderNode(answers.length);};const clear=document.querySelector('#clear');if(clear)clear.onclick=()=>{reset();home();};focusMain();}
function shell(inner, i){return `<div class="story-shell"><div class="story-head"><div><span class="eyebrow">按下送出之前 · 小宇的網路生活</span><h1>一個選擇，一段故事</h1></div><div class="progress-label">${Math.min(i+1,6)} / 6</div></div><div class="progress" role="progressbar" aria-label="故事進度" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${i+1}"><span style="width:${(i+1)/6*100}%"></span></div><div class="story-layout"><section class="story-card">${inner}</section><aside class="side-card"><div class="side-illustration" aria-hidden="true">☕</div><div class="side-title">讀故事的小提醒</div><h3>先想一想，<br>再做選擇。</h3><p>沒有必要急著選答案。留意每個人的感受，也想想你的選擇可能帶來什麼。</p><div class="mini-line"></div><p>選過之後，還可以回到前面，看看不同的選擇會讓故事怎麼改變。</p></aside></div></div>`;}
function renderNode(i){phase='node';const c=chapters[i];const choices=c.choices(answers);app.innerHTML=shell(`<div class="chapter"><i></i>${c.label}</div><h2>${c.title}</h2><div class="narrative">${c.body(answers)}</div><h3 class="choice-title">如果你是小宇，會怎麼做？</h3><div class="choices">${choices.map((x,n)=>`<button class="choice" data-choice="${n}"><span class="choice-letter">${'ABCD'[n]}</span><span>${x[0]}</span></button>`).join('')}</div><div class="story-controls">${i?'<button class="link-button" id="back">回上一個選擇</button>':''}<button class="link-button" id="home">回首頁</button></div>`,i);app.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.choice);answers=answers.slice(0,i);answers[i]=n;save();renderFeedback(i,n);});const back=document.querySelector('#back');if(back)back.onclick=()=>{answers=answers.slice(0,i-1);save();renderNode(i-1);};document.querySelector('#home').onclick=home;focusMain();}
function renderFeedback(i,n){phase='feedback';const c=chapters[i];const choice=c.choices(answers)[n];app.innerHTML=shell(`<div class="chapter"><i></i>${c.label}</div><div class="feedback"><span class="feedback-badge">你的選擇 · ${'ABCD'[n]}</span><h2>接下來發生了……</h2><p>${choice[1]}</p><div class="soft-box"><strong>想一想</strong><br>${c.thought}</div><div class="story-controls"><button class="button" id="next">${i===5?'看看故事結局':'繼續故事'}</button><button class="link-button" id="rechoose">重新選擇</button></div></div>`,i);document.querySelector('#next').onclick=()=>i===5?renderEnding():renderNode(i+1);document.querySelector('#rechoose').onclick=()=>{answers=answers.slice(0,i);save();renderNode(i);};focusMain();}
function renderEnding(){phase='ending';const f=facts(answers);let title,lead,symbol;
 if(f.hurt && !f.repair){title='被忽略的影響';symbol='☁';lead='群組裡的言論或傳聞讓小安感到困擾，有些問題還沒有被好好處理。小宇開始明白，訊息送出後，影響不一定會自己消失。';}
 else if(f.hurt && f.repair){title='雖然做錯，還能修復';symbol='✳';lead='小宇曾經做出可能傷害別人的選擇，後來他開始採取行動處理。修復需要時間，也要尊重小安自己的感受。';}
 else if(f.stayedLate && !f.plan){title='問題還在，可以求助';symbol='☼';lead='小宇發現自己曾玩到很晚，生活安排仍值得留意。即使不知道怎麼調整，也可以找可信任的大人一起想辦法。';}
 else {title='慢慢找到自己的平衡';symbol='☀';lead='小宇在故事中留意自己的選擇，也有機會照顧到同學的感受。找到適合自己的網路生活，需要持續練習。';}
 const recap=[];
 if(f.stayedLate)recap.push('你曾選擇繼續玩到很晚；故事呈現了隔天的疲倦，以及調整作息的需要。');else recap.push('面對朋友的邀請時，你選擇了留意休息、協商，或說出自己的困擾。');
 if(f.insulted)recap.push('你曾在群組羞辱小安。這可能讓他受傷，也可能因具體情況涉及法律問題。');
 if(f.blamed)recap.push('你曾在尚未釐清時責怪小安，並要求大家不要和他組隊。');
 if(f.shared)recap.push('你曾轉傳未經查證的說法，讓更多人可能誤會小安。');
 if(answers[4]===2)recap.push('你繼續談論傳聞，小安因此感到不舒服。');
 if(!f.hurt)recap.push('你沒有選擇羞辱小安或轉傳傳聞，並有機會透過聆聽、查證或關心來支持他。');
 if(f.repair)recap.push(f.hurt?'你後來選擇處理、求助或嘗試修復。關係能否恢復，仍需要時間與對方的意願。':'你選擇了關心、提醒或尋求協助，讓小安有機會得到支持。');
 if(f.plan)recap.push('你最後選擇與大人討論生活安排；計畫需要慢慢實踐，必要時也可以調整。');
 app.innerHTML=`<div class="story-shell"><div class="result-wrap"><section class="result-card"><div class="result-symbol" aria-hidden="true">${symbol}</div><div class="eyebrow">故事結局 · 你的選擇，留下了痕跡</div><h1>${title}</h1><p>${lead}</p><div class="reflection"><h2>回頭看看你的選擇</h2><ul>${recap.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="knowledge"><h3>把這些事帶回生活裡</h3><p>喜歡上網不是問題；如果經常停不下來，或影響睡眠、學習與心情，可以向可信任的大人求助。可以表達不同意見，但羞辱別人或散布未經查證、損害名譽的說法，可能造成傷害，也可能涉及法律責任；是否違法需要依具體情況判斷。</p>${readingLevel==='junior'?'<p><strong>再多了解一點：</strong>臺灣刑法規定，未滿 14 歲的行為不罰；14 歲以上未滿 18 歲者得減輕其刑。但不受刑罰不等於不需面對行為造成的影響，仍可能涉及民事責任或其他處理程序。法律適用須依具體事實判斷。</p>':''}</div><div class="reflection"><h2>想看看其他可能嗎？</h2><p class="narrative">回到任何一個選擇點，試試不同做法。從那裡之後的選擇會重新開始。</p><div class="revisit">${chapters.map((c,i)=>`<button data-revisit="${i}">${i+1}. ${c.title}</button>`).join('')}</div></div><div class="result-actions"><button class="button" id="restart">從頭再讀一次</button><button class="button secondary" id="end-home">回首頁</button></div></section></div></div>`;
 app.querySelectorAll('[data-revisit]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.revisit);answers=answers.slice(0,i);save();renderNode(i);});document.querySelector('#restart').onclick=()=>{reset();renderNode(0);};document.querySelector('#end-home').onclick=home;focusMain();}
home();
