const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const elements = new Map();
function element(selector) {
  if (!elements.has(selector)) elements.set(selector, { innerHTML:'', value:'', setAttribute(){}, focus(){}, showModal(){}, close(){}, addEventListener(){}, querySelectorAll(){return [];} });
  return elements.get(selector);
}
const sandbox = {document:{querySelector:element},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},window:{scrollTo(){}},console};
vm.createContext(sandbox);
for (const file of ['story-data.js','story.js','story-engine.js']) vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
const run = code => vm.runInContext(code,sandbox);
const app = element('#app');
let paths=0;

function check(prefix) {
  const i=prefix.length;
  run(`answers=${JSON.stringify(prefix)}`);
  if(i===8){
    run('renderEnding()');
    const html=app.innerHTML;
    assert.match(html,/故事結局/);
    assert.equal((html.match(/class="review-card"/g)||[]).length,8,'Every ending must review all 8 choices');
    assert.equal((html.match(/data-revisit=/g)||[]).length,8);
    for(let n=0;n<8;n++){
      const text=run(`chapters[${n}].choices(answers.slice(0,${n}))[answers[${n}]].text`);
      assert.ok(html.includes(text),`Ending omitted selected option ${n}: ${prefix}`);
      const review=run(`chapters[${n}].choices(answers.slice(0,${n}))[answers[${n}]].review`);
      assert.ok(html.includes(review),`Ending omitted selected analysis ${n}: ${prefix}`);
    }
    paths++;return;
  }
  run(`renderNode(${i})`);
  assert.equal((app.innerHTML.match(/data-choice=/g)||[]).length,4,`Expected four choices at ${prefix}`);
  assert.doesNotMatch(app.innerHTML,/可以怎麼理解：/,'Analysis must wait until the ending');
  if(i){const outcome=run(`chapters[${i-1}].choices(answers.slice(0,${i-1}))[answers[${i-1}]].next`);assert.ok(app.innerHTML.includes(outcome),'Previous selection must affect next scene');}
  for(let n=0;n<4;n++)check([...prefix,n]);
}
check([]);
assert.equal(paths,65536);
for(const [choices,expected] of [
  [[0,0,0,0,0,0,0,0],'留一點空間，慢慢前進'],
  [[0,2,2,1,1,0,2,3],'事情還沒有結束'],
  [[0,2,2,1,1,1,0,0],'從面對影響開始'],
  [[0,0,0,0,0,3,0,2],'事情還沒有結束']
]){
  run(`answers=${JSON.stringify(choices)};renderEnding()`);
  assert.ok(app.innerHTML.includes(expected),`Expected ${expected} for ${choices}`);
}
console.log(`Checked ${paths} complete paths, all 8 four-option nodes, delayed per-choice reviews, carryover and representative endings.`);
