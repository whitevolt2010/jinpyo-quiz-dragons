const fs=require('fs');
const g=fs.readFileSync('src/game.js','utf8');
const sec=g.slice(g.indexOf('/* ===================== 자료'), g.indexOf('/* ===================== 게임 상태'));
const clampS="const clamp = (v, a, b) => Math.max(a, Math.min(b, v));";
const rdo=f=>fs.existsSync(f)?fs.readFileSync(f,'utf8'):'';
const vocab=rdo('src/ko_vocab.js')+'\n'+rdo('src/ko_vocab2.js')+'\nif(typeof KO_VOCAB2!=="undefined")window.KO_VOCAB2=KO_VOCAB2;'+rdo('src/en_vocab2.js')+'\nif(typeof EN_VOCAB2!=="undefined")window.EN_VOCAB2=EN_VOCAB2;';
global.window=global;
eval(fs.readFileSync('src/ko_old.js','utf8')+vocab+';window.KO_VOCAB=KO_VOCAB;'+fs.readFileSync('src/en_data.js','utf8')+clampS+sec+`
let R={who:'jinpyo',stage:1,level:1}; global.localStorage={getItem(){return null},setItem(){}};
let bad=0, n=0; const tags={};
for (let lv=0; lv<=6; lv++) for (let st=1; st<=7; st++) for (const cat of ['ko','en']) for (let k=0;k<300;k++){
  const who='L'+lv; R.level=lv; R.stage=st; let q;
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
if(process.argv[2]==="len"){ const c={}; for (let lv=0; lv<=6; lv++) for (const cat of ["ko","en"]) for(let k=0;k<400;k++){ R.level=lv; R.stage=3; const q=makeQuestion(cat); const key=lv+cat+":"+q.choices.length; c[key]=(c[key]||0)+1; } console.log(c); }
`);
