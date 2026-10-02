/* 녹음해 둘 말소리 목록 만들기 → voice_list.json */
const fs=require('fs');
const g=fs.readFileSync('src/game.js','utf8');
const sec=g.slice(g.indexOf('/* ===================== 자료'), g.indexOf('/* ===================== 게임 상태'));
global.window=global;
const keys=new Set();
const add=(l,t)=>{ if(t) keys.add(l+':'+t); };
eval(fs.readFileSync('src/ko_old.js','utf8')+'const KO_VOCAB=[];window.KO_VOCAB=KO_VOCAB;'+fs.readFileSync('src/en_data.js','utf8')+"const clamp = (v, a, b) => Math.max(a, Math.min(b, v));"+sec+`
let R={who:'jinseo',stage:1};
for (let st=1; st<=7; st++) for (const cat of ['ko','en']) for (let k=0;k<3000;k++){ R.stage=st; const q=makeQuestion(cat); for (const arr of [q.say,q.sayAfter,q.answerSay]) (arr||[]).forEach(([l,t])=>add(l,t)); }
WORDS.forEach(w=>{ add('e',w.w); add('k',w.k); });
SENTS.forEach(s=>add('e',s.en)); TALKS.forEach(t=>{add('e',t.q);add('e',t.a);});
MON.slice(1).forEach(m=>add('k',m[0]+' 등장!'));
STAGES.slice(1).forEach((s,i)=>{ add('k','스테이지 '+(i+1)); add('k',s.name); add('k', s.mid[1]+' 등장!'); });
BOSS.slice(1).forEach(b=>add('k',b[0]+' 등장!'));
for(let n=1;n<=6;n++) add('k',n+'칸');
Object.values(KIDS).forEach(k=>add('k',k.name)); Object.values(HEROES).forEach(h=>add('k',h.name));
`);
for (const m of g.matchAll(/\['([ke])', '([^']+)'\]/g)) add(m[1], m[2]);
eval(fs.readFileSync('src/ko_vocab.js','utf8')+';global.__V=KO_VOCAB');
__V.forEach(x=>add('k', x[2].replace(/\(\s*\)/g, '빈칸')));
const list=[...keys].sort();
fs.writeFileSync('voice_list.json', JSON.stringify(list,null,0));
console.log(list.length, list.filter(k=>k[0]==='k').length, 'ko');
console.log(list.filter(k=>k[0]==='k').slice(0,60).join(' | '));
