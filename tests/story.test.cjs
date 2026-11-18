const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const elements = new Map();
function element(selector) {
  if (!elements.has(selector)) elements.set(selector, { innerHTML: '', value: '', setAttribute(){}, focus(){}, showModal(){}, close(){}, addEventListener(){}, querySelectorAll(){ return []; } });
  return elements.get(selector);
}
const sandbox = { document: { querySelector: element }, localStorage: { getItem(){return null;}, setItem(){}, removeItem(){} }, window: { scrollTo(){} }, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('story.js', 'utf8'), sandbox);
const run = code => vm.runInContext(code, sandbox);

let paths = 0;
function check(prefix) {
  if (prefix.length === 6) {
    run(`answers = ${JSON.stringify(prefix)}; renderEnding()`);
    const html = element('#app').innerHTML;
    assert.match(html, /故事結局/);
    assert.equal((html.match(/data-revisit=/g) || []).length, 6);
    if (prefix[2] !== 2) assert.doesNotMatch(html, /你曾在群組羞辱小安/);
    if (prefix[3] !== 2) assert.doesNotMatch(html, /你曾轉傳未經查證的說法/);
    paths++;
    return;
  }
  const i = prefix.length;
  run(`answers = ${JSON.stringify(prefix)}; renderNode(${i})`);
  assert.equal((element('#app').innerHTML.match(/data-choice=/g) || []).length, 4, `node ${i}, prefix ${prefix}`);
  for (let n = 0; n < 4; n++) {
    run(`answers = ${JSON.stringify([...prefix,n])}; renderFeedback(${i},${n})`);
    assert.match(element('#app').innerHTML, /接下來發生了/);
    check([...prefix,n]);
  }
}
check([]);
assert.equal(paths, 4096);
console.log(`Checked ${paths} complete paths, four options at every decision, feedback, endings and choice history.`);
