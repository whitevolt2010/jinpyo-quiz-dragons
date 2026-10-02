const fs=require('fs');
const g=fs.readFileSync('src/game.js','utf8');
const sec=g.slice(g.indexOf('/* ===================== 자료'), g.indexOf('/* ===================== 게임 상태'));
const clampS="const clamp = (v, a, b) => Math.max(a, Math.min(b, v));";
const vocab=fs.existsSync('src/ko_vocab.js')?fs.readFileSync('src/ko_vocab.js','utf8'):'const KO_VOCAB=[];';
global.window=global;
eval(fs.readFileSync('src/ko_old.js','utf8')+vocab+';window.KO_VOCAB=KO_VOCAB;'+fs.readFileSync('src/en_data.js','utf8')+clampS+sec+`
let R={who:'jinpyo',stage:1};
let bad=0, n=0; const tags={};
for (const who of ['jinpyo','jinseo']) for (let st=1; st<=7; st++) for (const cat of ['ko','en']) for (let k=0;k<600;k++){
  R.who=who; R.stage=st; let q;
  try { q=makeQuestion(cat); } catch(e){ bad++; if(bad<15) console.log('ERR',who,st,cat,e.message); continue; }
  n++; const key=who+st+cat+':'+q.tag; tags[key]=(tags[key]||0)+1;
  const errs=[];
  if(!q.choices||q.choices.length<2) errs.push('choices');
  else { if(new Set(q.choices.map(String)).size!==q.choices.length) errs.push('dup');
    if(q.choices[q.ans]!==q.answer) errs.push('ans');
    if(q.choices.some(c=>c==null||c==='')) errs.push('empty'); }
  if(!q.q) errs.push('noq');
  if(errs.length){ bad++; if(bad<40) console.log(errs.join(','),who,st,cat,q.tag,'|',q.q,'|',q.big,'|',q.choices&&q.choices.join(' / '),'| A:',q.answer); }
}
console.log('total',n,'bad',bad);
if(process.argv[2]) console.log(tags);
`);
