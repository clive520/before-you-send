'use strict';

const references = {
  wellbeing:{name:'世界衛生組織：遊戲疾患',url:'https://www.who.int/standards/classifications/frequently-asked-questions/gaming-disorder'},
  insult:{name:'臺北地檢署：怎樣才算公然侮辱？',url:'https://www.tpc.moj.gov.tw/292885/976681/661783/1197534/post'},
  defamation:{name:'臺灣高檢署：網路分享轉傳的法律問題',url:'https://www.tph.moj.gov.tw/4421/4475/632364/837289'},
  privacy:{name:'臺灣高檢署：蒐證與隱私',url:'https://www.tph.moj.gov.tw/4421/4475/632364/960875/'},
  school:{name:'教育部：校園霸凌防制準則',url:'https://edu.law.moe.gov.tw/LawContent.aspx?id=GL000683'}
};

function facts(a){
  const published = [1,2].includes(a[2]) || a[3]===1 || [1,3].includes(a[4]);
  const pressure = a[5]===2 || a[7]===2;
  const harms = [[2,[1,2]],[3,[1]],[4,[1,3]],[5,[2]],[7,[2]]].filter(([i,values])=>values.includes(a[i])).map(([i])=>i);
  const lastHarm = harms.length ? Math.max(...harms) : -1;
  const repair = ((a[5]===1||a[5]===3) && lastHarm<5) || ((a[7]===0||a[7]===1) && lastHarm<7);
  return {published,pressure,hurt:published||pressure,repair,
    strained:a[0]===2||a[1]===2, support:a[6]===0||a[6]===3};
}
function selectedAt(i){return chapters[i].choices(answers.slice(0,i))[answers[i]];}
function shell(inner,i){
  const count=chapters.length;
  return `<div class="story-shell"><div class="story-head"><div><span class="eyebrow">按下送出之前 · 小宇的網路生活</span><h1>一個選擇，一段故事</h1></div><div class="progress-label">${i+1} / ${count}</div></div><div class="progress" role="progressbar" aria-label="故事進度" aria-valuemin="0" aria-valuemax="${count}" aria-valuenow="${i+1}"><span style="width:${(i+1)/count*100}%"></span></div><div class="story-layout"><section class="story-card">${inner}</section><aside class="side-card"><div class="side-illustration" aria-hidden="true">☕</div><div class="side-title">讀故事的小提醒</div><h3>如果是你，<br>會怎麼選？</h3><p>先根據你知道的事情做決定。每個選擇都有可能帶來不同影響。</p><div class="mini-line"></div><p>走完整個故事後，再一起回頭看每個決定的教育觀點與可能的法律問題。</p></aside></div></div>`;
}
function renderNode(i){
  phase='node';const c=chapters[i];const choices=c.choices(answers.slice(0,i));
  const previous=i?`<div class="previous-event"><span>接續上一個選擇</span><p>${chapters[i-1].choices(answers.slice(0,i-1))[answers[i-1]].next}</p></div>`:'';
  app.innerHTML=shell(`<div class="chapter"><i></i>${c.label}</div><h2>${c.title}</h2>${previous}<div class="narrative">${c.body(answers.slice(0,i))}</div><h3 class="choice-title">如果你是小宇，會怎麼做？</h3><div class="choices">${choices.map((x,n)=>`<button class="choice" data-choice="${n}"><span class="choice-letter">${'ABCD'[n]}</span><span>${x.text}</span></button>`).join('')}</div><div class="story-controls">${i?'<button class="link-button" id="back">回上一個選擇</button>':''}<button class="link-button" id="home">回首頁</button></div>`,i);
  app.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{answers=answers.slice(0,i);answers[i]=Number(b.dataset.choice);save();i===chapters.length-1?renderEnding():renderNode(i+1);});
  const back=document.querySelector('#back');if(back)back.onclick=()=>{answers=answers.slice(0,i-1);save();renderNode(i-1);};document.querySelector('#home').onclick=home;focusMain();
}
function renderEnding(){
  phase='ending';const f=facts(answers);let title,lead;
  if(f.hurt&&!f.repair){title='事情還沒有結束';lead='小安仍擔心自己的處境，群組裡的內容和同學之間的誤解需要繼續處理。小宇開始看見，有些影響不會因為時間過去就自然消失。';}
  else if(f.hurt&&f.repair){title='從面對影響開始';lead='這段過程中有些行動可能讓小安承受壓力或傷害；後來小宇開始處理或尋求協助。小安是否願意重新建立信任，仍取決於他的感受與時間。';}
  else if(answers[7]===2){title='和好需要彼此準備';lead='小宇希望大家盡快和好，但小安還需要空間。即使沒有散布內容，公開要求對方回應也可能讓人感到有壓力。';}
  else {title='留一點空間，慢慢前進';lead='小宇沒有讓自己的發言或分享擴大這次事件。他和同學仍需要理解彼此，並尊重小安決定如何參與後續處理。';}
  const wellbeing=f.strained?(f.support?'小宇也注意到作息曾被壓縮，開始和家人或可信任的大人一起觀察、討論。':'小宇曾經壓縮休息，作息和溝通的問題還需要持續留意；他可以在任何時候尋求協助。'):(f.support?'小宇開始和大人討論網路使用與休息，希望找到適合自己的安排。':'小宇仍在尋找網路、朋友和休息之間的安排；遇到困擾時，他可以找人一起討論。');
  const last=selectedAt(chapters.length-1);
  const cards=chapters.map((c,i)=>{const choice=selectedAt(i),ref=references[choice.source||c.source];return `<article class="review-card"><div class="review-top"><span>第 ${i+1} 個選擇</span><span>${c.topic}</span></div><h3>${c.title}</h3><p class="chosen"><strong>你選擇：</strong>${choice.text}</p><p><strong>可以怎麼理解：</strong>${choice.review}</p><a href="${ref.url}" target="_blank" rel="noreferrer">參考資料：${ref.name}</a></article>`;}).join('');
  app.innerHTML=`<div class="story-shell"><div class="result-wrap"><section class="result-card"><div class="result-symbol" aria-hidden="true">✳</div><div class="eyebrow">故事結局 · 一起回頭看看</div><h1>${title}</h1><p>${last.next}</p><p>${lead}</p><div class="knowledge"><h3>小宇的網路生活</h3><p>${wellbeing}</p></div><div class="reflection"><h2>你的八個選擇</h2><p class="narrative">以下是你在每個時刻做的決定，以及可以進一步思考的教育觀點或法律問題。這些說明不是對你或故事角色的診斷、判決。</p><div class="review-list">${cards}</div></div><div class="knowledge"><h3>關於年齡與法律責任</h3><p>在臺灣，未滿 14 歲者的行為不罰；14 歲以上未滿 18 歲者，刑事責任得依法減輕。不受刑罰不代表沒有其他責任，仍可能涉及民事責任或其他處理。是否違法及如何處理，須依個案事實與適用法律判斷。</p><p><a href="https://mojlaw.moj.gov.tw/LawContent.aspx?LSID=FL001424&LawNo=14" target="_blank" rel="noreferrer">參考資料：法務部《中華民國刑法》</a></p>${readingLevel==='junior'?'<p>想一想：如果同一句話出現在私訊、班級群組或公開社群，傳播範圍與表意脈絡有什麼不同？查證努力、分享目的及具體內容，又會如何影響判斷？</p>':''}</div><div class="reflection"><h2>換一個選擇，會怎麼樣？</h2><p class="narrative">回到任一節點，從那裡重新選擇。後面的決定會重新開始。</p><div class="revisit">${chapters.map((c,i)=>`<button data-revisit="${i}">${i+1}. ${c.title}</button>`).join('')}</div></div><div class="result-actions"><button class="button" id="restart">從頭再讀一次</button><button class="button secondary" id="end-home">回首頁</button></div></section></div></div>`;
  app.querySelectorAll('[data-revisit]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.revisit);answers=answers.slice(0,i);save();renderNode(i);});document.querySelector('#restart').onclick=()=>{reset();renderNode(0);};document.querySelector('#end-home').onclick=home;focusMain();
}
home();
