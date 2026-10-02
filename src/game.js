/* ===================== 어휘 용사: 퀴즈 앤 드래곤 ===================== */
const GAME_VERSION = 1;
const $ = id => document.getElementById(id) || { style: {}, classList: { add() {}, remove() {}, toggle() {} }, addEventListener() {}, set innerHTML(v) {}, set textContent(v) {} };
const IMG = 'assets/img/';
const FAST = /[?&]fast/.test(location.search) ? 0.02 : 1;   /* 시험용: ?fast 면 연출을 빨리 */
let epoch = 0;   /* 메뉴로 화면을 떠나면 +1 → 진행 중이던 연출은 조용히 멈춤 */
const wait = ms => { const ep = epoch; return new Promise(r => setTimeout(() => { if (ep === epoch) r(); }, ms * FAST)); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- 화면 맞추기 ---------- */
function fit() {
  const w = innerWidth, h = innerHeight; if (!w || !h) return;
  const s = Math.min(w / 1280, h / 720);
  const st = $('stage'); st.style.transform = 'scale(' + s + ')';
  st.style.left = ((w - 1280 * s) / 2) + 'px'; st.style.top = ((h - 720 * s) / 2) + 'px';
}
addEventListener('resize', fit); fit();

/* ---------- 그림: 없으면 이모지로 대신 ---------- */
function spr(el, name, emo) {
  el.innerHTML = '';
  const img = new Image(); img.alt = '';
  img.onerror = () => { el.innerHTML = '<span class="emo">' + emo + '</span>'; };
  img.src = IMG + name + '.webp'; el.appendChild(img);
}
function sprHTML(name, emo) { return '<img src="' + IMG + name + '.webp" alt="" onerror="this.outerHTML=\'<span class=emo>' + emo + '</span>\'">'; }

/* ===================== 소리 ===================== */
const SFX_NAMES = ['coin', 'start', 'select', 'cursor', 'dice_roll', 'dice_stop', 'step', 'correct', 'wrong', 'attack', 'hit', 'enemy_attack', 'gem', 'monster_down', 'heal', 'treasure', 'magic', 'boss_appear', 'tick', 'timer_warn', 'levelup', 'stage_clear', 'game_over', 'continue'];
const BGM_NAMES = ['title', 'map', 'battle', 'boss', 'inn', 'ending'];
const BGM_VOL = 0.2;   /* 배경음악은 작게 — 공부에 방해되지 않게 */
let AC = null, master, sfxBus, bgmBus, voiceBus;
const BUF = {};
let muted = false, bgmNode = null, bgmName = '', voiceNode = null;
function audioInit() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  AC = new (window.AudioContext || window.webkitAudioContext)();
  master = AC.createGain(); master.connect(AC.destination);
  sfxBus = AC.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(master);
  bgmBus = AC.createGain(); bgmBus.gain.value = BGM_VOL; bgmBus.connect(master);
  voiceBus = AC.createGain(); voiceBus.gain.value = 1.3; voiceBus.connect(master);
  loadSounds();
}
async function loadBuf(key, url) {
  if (BUF[key] !== undefined) return BUF[key];
  BUF[key] = null;
  try {
    const r = await fetch(url); if (!r.ok) throw 0;
    const ab = await r.arrayBuffer();
    BUF[key] = await new Promise((ok, no) => AC.decodeAudioData(ab, ok, no));
  } catch (e) { BUF[key] = null; }
  return BUF[key];
}
async function loadSounds() {
  await Promise.all(SFX_NAMES.map(n => loadBuf('s:' + n, 'assets/sfx/' + n + '.mp3')));
  if (bgmName) { const n = bgmName; bgmName = ''; bgm(n); }
  for (const n of BGM_NAMES) await loadBuf('m:' + n, 'assets/bgm/' + n + '.mp3');
  if (bgmName && !bgmNode) { const n = bgmName; bgmName = ''; bgm(n); }
}
/* 파일이 없을 때 쓰는 간단한 삑 소리 */
const BEEP = {
  coin: [[988, .06], [1319, .25]], start: [[523, .1], [659, .1], [784, .1], [1047, .3]], select: [[880, .08], [1175, .12]], cursor: [[660, .04]],
  dice_stop: [[440, .08]], step: [[700, .04]], correct: [[784, .1], [1047, .1], [1319, .25]], wrong: [[300, .18], [220, .35]],
  attack: [[1200, .05], [600, .08]], hit: [[150, .12]], enemy_attack: [[120, .2]], gem: [[1568, .08], [2093, .15]], monster_down: [[880, .08], [660, .08], [440, .2]],
  heal: [[660, .08], [880, .08], [1100, .2]], treasure: [[784, .1], [988, .1], [1175, .1], [1568, .3]], magic: [[1319, .07], [1568, .07], [1760, .07], [2093, .2]],
  boss_appear: [[220, .3], [196, .3], [220, .3], [196, .5]], tick: [[1000, .03]], timer_warn: [[1400, .06], [1400, .06]], levelup: [[523, .08], [784, .08], [1047, .3]],
  stage_clear: [[523, .12], [659, .12], [784, .12], [1047, .12], [784, .12], [1047, .5]], game_over: [[392, .3], [330, .3], [262, .6]], continue: [[880, .1]], dice_roll: [[500, .03], [600, .03], [500, .03]],
};
function sfx(n) {
  if (!AC || muted) return;
  const b = BUF['s:' + n];
  if (b) { const s = AC.createBufferSource(); s.buffer = b; s.connect(sfxBus); s.start(); return; }
  let t = AC.currentTime;
  for (const [f, d] of (BEEP[n] || [[600, .08]])) {
    const o = AC.createOscillator(), g = AC.createGain(); o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + d + .02); t += d * .9;
  }
}
function bgm(n) {
  if (bgmName === n && bgmNode) return;
  bgmName = n;
  if (bgmNode) { try { bgmNode.stop(); } catch (e) {} bgmNode = null; }
  if (!AC || !n) return;
  const b = BUF['m:' + n]; if (!b) return;
  const s = AC.createBufferSource(); s.buffer = b; s.loop = n !== 'ending'; s.connect(bgmBus); s.start(); bgmNode = s;
}
function setMute(m) {
  muted = m; $('muteBtn').textContent = m ? '🔇' : '🔊';
  if (master) master.gain.value = m ? 0 : 1;
  if (m && 'speechSynthesis' in window) speechSynthesis.cancel();
}
$('muteBtn').addEventListener('click', e => { e.stopPropagation(); setMute(!muted); });

/* ---------- 말소리: 녹음 클립 우선, 없으면 기기 음성 ---------- */
const CLIP = window.CLIP || {};
let speakToken = 0;
function stopVoice() {
  speakToken++;
  if (voiceNode) { try { voiceNode.stop(); } catch (e) {} voiceNode = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (bgmBus) bgmBus.gain.value = BGM_VOL;
}
async function playClip(key) {
  const id = CLIP[key]; if (id == null || !AC || muted) return false;
  const b = await loadBuf('v:' + id, 'assets/voice/' + id + '.m4a'); if (!b) return false;
  return new Promise(res => {
    const s = AC.createBufferSource(); s.buffer = b; s.playbackRate.value = key[0] === 'e' ? 0.9 : 1; s.connect(voiceBus);
    s.onended = () => res(true); voiceNode = s; s.start();
  });
}
function ttsSay(text, lang) {
  return new Promise(res => {
    if (!('speechSynthesis' in window) || muted) return res(false);
    const u = new SpeechSynthesisUtterance(text); u.lang = lang === 'e' ? 'en-US' : 'ko-KR'; u.rate = lang === 'e' ? 0.8 : 0.95;
    const vs = speechSynthesis.getVoices().filter(v => v.lang.startsWith(lang === 'e' ? 'en' : 'ko'));
    const pref = vs.find(v => /Samantha|Yuna|Google/.test(v.name)); if (pref) u.voice = pref;
    let done = false; const fin = () => { if (!done) { done = true; res(true); } };
    u.onend = fin; u.onerror = fin; setTimeout(fin, 1500 + text.length * 260);
    speechSynthesis.speak(u);
  });
}
/* parts: [['k','문장'],['e','apple'],…] 차례대로 읽기 */
async function speak(parts) {
  stopVoice(); const tok = speakToken;
  if (!AC || muted) return;
  if (bgmBus) bgmBus.gain.value = BGM_VOL * 0.35;
  for (const [l, t] of parts) {
    if (tok !== speakToken) return;
    if (!t) continue;
    const ok = await playClip(l + ':' + t);
    if (!ok && tok === speakToken) await ttsSay(t, l);
    await wait(120);
  }
  if (tok === speakToken && bgmBus) bgmBus.gain.value = BGM_VOL;
}

/* ===================== 저장 ===================== */
const SAVE_KEY = 'quiz-dragons-v1';
let save = { hi: 0, p: { jinpyo: { stage: 1 }, jinseo: { stage: 1 } }, crt: true };
try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.p && s.p.jinpyo && s.p.jinseo) save = Object.assign(save, s); } catch (e) {}
function unlocked(who, lv) { const u = save.u || (save.u = {}); return u[who + lv] || 1; }
function unlock(who, lv, st) { const u = save.u || (save.u = {}); if ((u[who + lv] || 1) < st) u[who + lv] = st; }
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }

/* ===================== 자료 ===================== */
const KIDS = {
  jinpyo: { name: '진표', age: '7살', desc: '국어·영어 어휘 모험!<br>다음 화면에서 난이도를 골라요', face: 'face_jinpyo', emo: '👦' },
  jinseo: { name: '진서', age: '5살', desc: '국어·영어 어휘 모험!<br>다음 화면에서 난이도를 골라요', face: 'face_jinseo', emo: '👧' },
};
const HEROES = {
  warrior: { name: '전사', emo: '🛡️', ab: '하트가 1개 더 많고<br>몬스터를 물리치면 하트 회복' },
  wizard: { name: '마법사', emo: '🧙', ab: '가끔 문제 종류<br>(국어/영어)를 고를 수 있어요' },
  amazon: { name: '아마존', emo: '🏹', ab: '가끔 틀린 보기가<br>사라져요' },
  ninja: { name: '닌자', emo: '🥷', ab: '가끔 분신술!<br>맞히면 보석 2개' },
};
const MON = [null,
  ['슬라임', '🟢'], ['박쥐', '🦇'], ['버섯돌이', '🍄'], ['고블린', '👺'], ['해골 병사', '💀'], ['꼬마 유령', '👻'], ['늑대', '🐺'],
  ['돌 골렘', '🗿'], ['미믹', '📦'], ['하피', '🦅'], ['오크', '👹'], ['마녀', '🧙‍♀️'], ['도마뱀 전사', '🦎'], ['미노타우로스', '🐂']];
const BOSS = [null, ['아기 초록 용', '🐲'], ['바다뱀 용', '🐉'], ['얼음 용', '🐉'], ['번개 용', '🐉'], ['흑기사', '🤺'], ['쌍두 용', '🐉'], ['황금 용왕', '👑']];
const STAGES = [null,
  { name: '풀밭 마을', g: 2, mons: [1, 2, 3], boss: 1, mid: [4, '고블린 대장'] },
  { name: '버섯 숲', g: 3, mons: [3, 2, 4, 6], boss: 6, mid: ['b1', '아기 초록 용'] },
  { name: '바닷가 동굴', g: 4, mons: [2, 6, 9, 10], boss: 2, mid: ['b6', '쌍두 용'] },
  { name: '사막 피라미드', g: 5, mons: [4, 5, 13, 9], boss: 4, mid: ['b2', '바다뱀 용'] },
  { name: '눈 덮인 산', g: 6, mons: [7, 8, 6, 10], boss: 3, mid: ['b4', '번개 용'] },
  { name: '불꽃 화산', g: 6, mons: [11, 12, 13, 8], boss: 5, mid: ['b3', '얼음 용'] },
  { name: '용의 성', g: 7, mons: [11, 12, 14, 5, 9], boss: 7, mid: ['b5', '흑기사'] },
];
const JINSEO_SUB = ['', '그림 낱말 + 색깔', '영어 그림 낱말 시작', '소리 흉내말 + 숫자', '영어 색깔·숫자', '큰 숫자까지', '국어·영어 섞어서', '모두 다 나와요!'];

/* ---------- 말판 지도(모든 스테이지 같은 모양, 칸 내용만 다름) ---------- */
const NODES = [
  [90, 640], [225, 640], [360, 640], [495, 640], [630, 640], [765, 640], [900, 640], [1035, 640], [1170, 600],
  [1110, 480], [970, 480],
  [830, 480], [690, 480], [550, 480],          // 11~13 아래 길
  [850, 375], [700, 375], [550, 375],          // 14~16 윗길
  [410, 440], [270, 440], [130, 400],
  [170, 290], [310, 290], [450, 290], [590, 290], [730, 290], [870, 290], [1010, 290], [1160, 190],
];
const NEXT = { 10: [11, 14], 13: [17], 16: [17], 27: [] };
function nextOf(i) { return NEXT[i] || [i + 1]; }
const LAST = 27;
function makeBoard(stage) {
  /* 칸 종류: m=몬스터 i=여관 f=요정 c=보물 d=용(반드시 멈춤) */
  const base = ['s', 'm', 'm', 'c', 'm', 'm', 'f', 'm', 'm', 'm', 'd', 'm', 'i', 'm', 'm', 'c', 'f', 'm', 'm', 'i', 'm', 'm', 'd', 'm', 'c', 'm', 'm', 'b'];
  /* 시작·용·보스 칸은 그대로, 나머지 칸 순서는 판마다 섞기 */
  const fixed = [0, 10, 22, 27];
  const free = base.map((t, i) => i).filter(i => !fixed.includes(i));
  const mixed = shuf(free.map(i => base[i]));
  free.forEach((i, k) => { base[i] = mixed[k]; });
  R.monSeed = rndi(100);
  const koOnly = R.level === 0 && stage <= 1;
  return base.map((t, i) => ({ t, cat: koOnly || Math.random() < 0.5 ? 'ko' : 'en', done: false }));
}

/* ===================== 문제 만들기 ===================== */
function rndi(n) { return Math.floor(Math.random() * n); }
function pick1(a) { return a[rndi(a.length)]; }
function shuf(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rndi(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function wsel(table) { let t = 0; for (const k in table) t += table[k]; let r = Math.random() * t; for (const k in table) { r -= table[k]; if (r < 0) return k; } return Object.keys(table)[0]; }
/* 최근에 나온 문제는 피하기 (판이 바뀌어도 기억) */
const RECENT_KEY = 'quiz-dragons-recent-v1';
let recentQ = []; try { recentQ = JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch (e) {}
let recentDirty = 0;
function seenQ(key) {
  if (recentQ.includes(key)) return true;
  recentQ.push(key); if (recentQ.length > 400) recentQ.shift();
  if (++recentDirty % 5 === 0) try { localStorage.setItem(RECENT_KEY, JSON.stringify(recentQ)); } catch (e) {}
  return false;
}
/* 카드 덱: 목록을 섞어 하나씩 뽑고, 다 뽑으면 다시 섞기 → 외워지지 않게 */
const DECK_KEY = 'quiz-dragons-deck-v1';
let DECK = {}; try { DECK = JSON.parse(localStorage.getItem(DECK_KEY)) || {}; } catch (e) {}
function draw(name, list, idf) {
  if (!list.length) return null;
  name = (R && R.who || '') + ':' + name;
  const ids = list.map(idf), have = new Set(ids);
  let d = DECK[name] || [], id = null;
  while (d.length && id == null) { const x = d.pop(); if (have.has(x)) id = x; }
  if (id == null) { d = shuf(ids); id = d.pop(); }
  DECK[name] = d;
  try { localStorage.setItem(DECK_KEY, JSON.stringify(DECK)); } catch (e) {}
  return list[ids.indexOf(id)];
}
function fromAW(o) { /* o: {q,a,w:[...],...} → 보기 섞기 */
  const ch = shuf([o.a, ...o.w]); return Object.assign({ choices: ch, ans: ch.indexOf(o.a), answer: o.a }, o);
}
function pickWrong(pool, ans, n, bad) {
  const out = []; const no = new Set([ans, ...(bad || [])]);
  for (const v of shuf(pool)) { if (v && !no.has(v) && !out.includes(v)) out.push(v); if (out.length >= n) break; }
  return out;
}

/* ---------- 국어 ---------- */
const MEANING_TYPES = ['낱말 뜻', '한자어', '사자성어', '관용어', '속담'];
const wordOf = q => { const m = q.match(/^"([^"]+)"의 뜻은\?$/); return m ? m[1] : null; };
function koVocab(g) {
  const all = (window.KO_VOCAB || []).concat(window.KO_VOCAB2 || []);
  const list = all.filter(x => x[0] === g);
  if (!list.length) return null;
  const [gg, type, q, a, w, ex, big] = draw('kv' + g, list, x => x[2] + '|' + (x[6] || ''));
  seenQ('kv' + q);
  const say = [['k', q.replace(/\(\s*\)/g, '빈칸')]];
  if (MEANING_TYPES.includes(type)) {
    const same = all.filter(x => x[1] === type && x[3] !== a && Math.abs(x[0] - g) <= 1);
    const word = wordOf(q);
    /* 절반은 거꾸로: 뜻을 보여 주고 낱말 고르기 */
    if (word && Math.random() < 0.5) {
      const others = same.map(x => wordOf(x[2])).filter(x => x && x !== word);
      if (others.length >= 3) {
        const ws = pickWrong(others, word, 3);
        return fromAW({ q: '이런 뜻을 가진 말은?', big: a, a: word, w: ws, tag: type + ' (거꾸로)', hint: '"' + word + '" = ' + a + '. ' + ex, say: [['k', '이런 뜻을 가진 말은?']] });
      }
    }
    /* 보기도 매번 바뀌게: 원래 오답 2개 + 다른 문제의 뜻 1개 */
    const extra = pickWrong(same.map(x => x[3]), a, 1, w);
    const ws = shuf(w).slice(0, extra.length ? 2 : 3).concat(extra);
    return fromAW({ q, big: big || '', a, w: ws, tag: type, hint: ex, say });
  }
  return fromAW({ q, big: big || '', a, w: shuf(w).slice(0, 3), tag: type, hint: ex, say });
}
const AUG_TAGS = ['관용어', '사자성어', '낱말 뜻', '속담 뜻', '속담 쓰임', '흉내 내는 말', '높임말'];
function koOld(g) {
  const si = g >= 5 ? pick1([3, 4]) : clamp(g, 2, 5) - 1;
  for (let t = 0; t < 8; t++) {
    const q = makeQ(si);
    if (seenQ('ko' + q.q + q.big + q.answer) && t < 7) continue;
    if (q.tag === '글 읽기' && Math.random() < 0.6 && t < 7) continue;
    /* 보기 3개짜리는 같은 종류 다른 문제의 정답을 하나 더 붙여 4지선다로 */
    let choices = q.choices.slice();
    if (choices.length === 3 && AUG_TAGS.includes(q.tag)) {
      for (let k = 0; k < 12 && choices.length < 4; k++) { const o = makeQ(si); if (o.tag === q.tag && !choices.includes(o.answer) && String(o.answer).length <= String(q.answer).length + 6) choices.push(o.answer); }
      choices = shuf(choices);
    }
    return { q: q.q, big: q.big, choices, ans: choices.indexOf(q.answer), answer: q.answer, hint: q.hint, tag: q.tag, long: q.long, say: [['k', q.say]] };
  }
}
function koQuestion(g) {
  const oldShare = window.KO_VOCAB2 ? ({ 1: .15, 2: .25, 3: .25, 4: .25, 5: .2, 6: .15 }[g] || .2) : ({ 2: .45, 3: .4, 4: .4, 5: .3, 6: .25 }[g] || .3);
  let q = null;
  if (Math.random() >= oldShare) q = koVocab(g);
  if (!q) q = koOld(g >= 6 ? 5 : g);
  q.cat = 'ko'; return q;
}

/* ---------- 영어 ---------- */
const EN = {
  byG: g => WORDS.filter(w => w.g === g),
  near: g => WORDS.filter(w => Math.abs(w.g - g) <= 1),
};
function enWord(g) { return draw('ew' + g, EN.byG(g), w => w.w); }
function josa(w, a, b) { const h = [...w].reverse().find(c => c >= '가' && c <= '힣'); if (!h) return a + '(' + b + ')'; return (h.charCodeAt(0) - 0xAC00) % 28 ? a : b; }
const GENERIC_A = /^(Sure|Sounds|Okay|OK|Yes|No|Me, too|Great|Good|Of course|Thank|Thanks|You are welcome|Sorry|That|Why not|All right|Fine|Nice|Wow|Really|Let's)/i;
function sameKo(a, b) { return a.k === b.k || a.w.toLowerCase() === b.w.toLowerCase(); }
function enGen(type, g) {
  if (type === 'meaning') {
    const w = enWord(g);
    const ws = shuf(EN.near(g).filter(x => !sameKo(x, w))).reduce((o, x) => { if (o.length < 3 && !o.some(y => y.k === x.k)) o.push(x); return o; }, []);
    return fromAW({ q: '이 영어 낱말의 뜻은?', big: (w.e ? w.e + ' ' : '') + w.w, a: w.k, w: ws.map(x => x.k), tag: '낱말 뜻', hint: w.w + ' = ' + w.k, say: [['e', w.w]], word: w });
  }
  if (type === 'word') {
    const w = enWord(g);
    /* 첫 글자나 길이가 비슷한 낱말을 보기로 → 더 헷갈리게 */
    const near = EN.near(g).filter(x => !sameKo(x, w));
    const alike = shuf(near.filter(x => x.w[0].toLowerCase() === w.w[0].toLowerCase() || Math.abs(x.w.length - w.w.length) <= 1));
    const ws = alike.concat(shuf(near)).filter((x, i, a) => a.findIndex(y => y.w === x.w) === i).slice(0, 3);
    if (ws.length < 3) return enGen('meaning', g);
    return fromAW({ q: '"' + w.k + '"' + josa(w.k, '을', '를') + ' 영어로 하면?', big: w.e || '', a: w.w, w: ws.map(x => x.w), tag: '영어로 말하기', hint: w.k + ' = ' + w.w, say: [['k', w.k], ['k', '영어로 하면?']], sayAfter: [['e', w.w]], word: w, emoBig: true });
  }
  if (type === 'listen') {
    const w = enWord(g);
    const ws = shuf(EN.near(g).filter(x => !sameKo(x, w))).slice(0, 3);
    return fromAW({ q: '🔊 잘 듣고, 들은 낱말을 골라요!', big: '', a: w.w, w: ws.map(x => x.w), tag: '듣기', hint: w.w + ' = ' + w.k, say: [['e', w.w], ['e', w.w]], word: w });
  }
  if (type === 'spell') {
    const L = EN.byG(g).filter(w => /^[a-z]{3,9}$/.test(w.w));
    for (let t = 0; t < 40; t++) {
      const w = pick1(L); const i = rndi(w.w.length); const c = w.w[i];
      const all = new Set(WORDS.map(x => x.w.toLowerCase()));
      const letters = 'abcdefghijklmnoprstuvwy'.split('').filter(x => x !== c && !all.has(w.w.slice(0, i) + x + w.w.slice(i + 1)));
      if (letters.length < 3 || seenQ('sp' + w.w)) continue;
      const vow = 'aeiou'.includes(c);
      const pool = letters.filter(x => 'aeiou'.includes(x) === vow);
      const ws = pickWrong(pool.length >= 3 ? pool : letters, c, 3);
      return fromAW({ q: '빈칸에 들어갈 알파벳은?', big: (w.e ? w.e + ' ' : '') + w.w.slice(0, i) + '_' + w.w.slice(i + 1), ko: w.k, a: c, w: ws, tag: '철자', hint: w.w + ' = ' + w.k, say: [['e', w.w]], word: w });
    }
    return enGen('meaning', g);
  }
  if (type === 'sent') {
    const L = SENTS.filter(s => s.g === g && POOL[s.p]);
    for (let t = 0; t < 40; t++) {
      const s = t ? pick1(L) : draw('se' + g, L, x => x.en);
      const re = new RegExp('\\b' + s.b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
      if (!re.test(s.en)) continue;
      const cap = /^[A-Z]/.test(s.b);
      const pool = POOL[s.p].map(x => cap ? x[0].toUpperCase() + x.slice(1) : x.toLowerCase());
      const ws = pickWrong(pool, s.b, 3, [s.b.toLowerCase(), s.b[0].toUpperCase() + s.b.slice(1)]);
      if (ws.length < 3) continue;
      return fromAW({ q: '빈칸에 알맞은 낱말은?', big: s.en.replace(re, '____'), ko: s.ko, a: s.b, w: ws, tag: '문장 완성', hint: s.en + '  (' + s.ko + ')', say: [['k', '빈칸에 알맞은 낱말은?']], sayAfter: [['e', s.en]] });
    }
    return enGen('meaning', g);
  }
  if (type === 'talk') {
    const L = TALKS.filter(s => Math.abs(s.g - g) <= 1);
    const s = draw('tk' + g, L, x => x.q + x.a);
    const ws = shuf(TALKS.filter(x => x.a !== s.a && x.q !== s.q && Math.abs(x.g - g) <= 2 && !GENERIC_A.test(x.a))).slice(0, 3).map(x => x.a);
    return fromAW({ q: '알맞은 대답은?', big: s.q, a: s.a, w: ws, tag: '대화', hint: s.q + ' — ' + s.a + '  (' + s.ko + ')', say: [['e', s.q]], sayAfter: [['e', s.a]] });
  }
}
/* 교과서·학습지 수준 영어 문제 */
function enVocab2(g) {
  const list = (window.EN_VOCAB2 || []).filter(x => x[0] === g);
  if (!list.length) return null;
  const [gg, type, q, big, a, w, ex, sp] = draw('ev' + g, list, x => x[2] + '|' + x[3] + '|' + x[4]);
  const say = [['k', q]]; if (big && !/_/.test(big)) say.push(['e', big]);
  return fromAW({ q, big: big || '', a, w: shuf(w).slice(0, 3), tag: type, hint: ex, say, sayAfter: sp ? [['e', sp]] : null });
}
function enQuestion(g) {
  if (window.EN_VOCAB2 && Math.random() < 0.55) { const q = enVocab2(g); if (q) { q.cat = 'en'; return q; } }
  const W = g <= 2 ? { meaning: 25, word: 25, spell: 20, sent: 20, listen: 10 }
    : g <= 4 ? { meaning: 20, word: 20, spell: 15, sent: 30, talk: 15 }
    : { meaning: 15, word: 20, spell: 15, sent: 35, talk: 15 };
  const q = enGen(wsel(W), g); q.cat = 'en'; return q;
}

/* ---------- 진서용 그림 퀴즈 ---------- */
const COLORS = [['🔴', '빨간색', 'red'], ['🟠', '주황색', 'orange'], ['🟡', '노란색', 'yellow'], ['🟢', '초록색', 'green'], ['🔵', '파란색', 'blue'], ['🟣', '보라색', 'purple'], ['⚫', '검은색', 'black'], ['⚪', '하얀색', 'white'], ['🟤', '갈색', 'brown']];
const NUMS = [[1, '하나', 'one'], [2, '둘', 'two'], [3, '셋', 'three'], [4, '넷', 'four'], [5, '다섯', 'five'], [6, '여섯', 'six'], [7, '일곱', 'seven'], [8, '여덟', 'eight']];
const COUNT_EMO = ['🍎', '⭐', '🐟', '🌸', '🍓', '🐥', '🎈', '🍪'];
const SOUND_PIC = [['멍멍', '🐶'], ['야옹', '🐱'], ['꿀꿀', '🐷'], ['음매', '🐮'], ['꽥꽥', '🦆'], ['개굴개굴', '🐸'], ['삐약삐약', '🐥'], ['꼬끼오', '🐓'], ['어흥', '🐯'], ['붕붕', '🐝'], ['칙칙폭폭', '🚂'], ['부릉부릉', '🚗'], ['따르릉', '⏰'], ['히힝', '🐴'], ['짹짹', '🐦'], ['딩동', '🔔']];
const KID_PIC = () => (typeof PIC !== 'undefined' ? PIC : []).filter(p => p[1].length <= 4 && !/[ㄱ-ㅎ]/.test(p[1]));
const EN_PIC_OK = 'cat dog pig cow hen duck bird fish frog bear lion tiger rabbit monkey elephant mouse sheep horse bee apple banana milk egg bread cake water rice candy cookie pizza ball book pen bed box cup bag hat car bus bike key doll drum star sun moon tree flower leaf hand eye nose mouth foot leg baby house door school pencil notebook scissors orange grape melon strawberry peach carrot potato tomato corn onion juice meat noodle salad spoon fork train boat ship truck'.split(' ');
const EN_PIC = () => WORDS.filter(w => w.e && EN_PIC_OK.includes(w.w));
function emoQ(o) { const q = fromAW(o); q.emo = true; q.kid = true; return q; }
function kidGen(type) {
  if (type === 'kopic') {
    const L = KID_PIC(); const p = draw('kp', L, x => x[1]);
    const ws = shuf(L.filter(x => x[0] !== p[0] && x[1] !== p[1])).slice(0, 3).map(x => x[0]);
    return emoQ({ cat: 'ko', q: '"' + p[1] + '" 어디 있을까?', a: p[0], w: ws, tag: '그림 낱말', hint: p[0] + ' ' + p[1], say: [['k', p[1]], ['k', '어디 있을까?']], answerSay: [['k', p[1]]] });
  }
  if (type === 'kocolor' || type === 'encolor') {
    const c = pick1(COLORS); const ws = shuf(COLORS.filter(x => x !== c)).slice(0, 3).map(x => x[0]);
    const en = type === 'encolor';
    return emoQ({ cat: en ? 'en' : 'ko', q: en ? '"' + c[2] + '" 색깔을 찾아요!' : '"' + c[1] + '"을 찾아요!', a: c[0], w: ws, tag: en ? '영어 색깔' : '색깔', hint: c[0] + ' ' + c[1] + ' = ' + c[2], say: en ? [['e', c[2]], ['k', '색깔을 찾아요!']] : [['k', c[1]], ['k', '어디 있을까?']], answerSay: en ? [['e', c[2]]] : [['k', c[1]]] });
  }
  if (type === 'kosound') {
    const s = pick1(SOUND_PIC); const ws = shuf(SOUND_PIC.filter(x => x !== s)).slice(0, 3).map(x => x[1]);
    return emoQ({ cat: 'ko', q: '"' + s[0] + '" 소리를 내는 건?', a: s[1], w: ws, tag: '소리 흉내말', hint: s[1] + ' ' + s[0], say: [['k', s[0]], ['k', '소리를 내는 건 누구일까?']], answerSay: [['k', s[0]]] });
  }
  if (type === 'kocount' || type === 'encount') {
    const top = R.stage >= 5 ? 8 : 6;
    const n = pick1(NUMS.slice(0, top)); const e = pick1(COUNT_EMO); const en = type === 'encount';
    /* 가까운 숫자를 보기로 → 잘 세어야 맞힘 */
    const ws = shuf(NUMS.slice(0, top).filter(x => x !== n && Math.abs(x[0] - n[0]) <= 3)).slice(0, 3);
    const show = k => e.repeat(k[0]);
    const q = fromAW({ cat: en ? 'en' : 'ko', q: en ? '"' + n[2] + '" 만큼 있는 건?' : '"' + n[1] + '" 만큼 있는 건?', a: show(n), w: ws.map(show), tag: en ? '영어 숫자' : '숫자', hint: n[0] + ' = ' + n[1] + ' = ' + n[2], say: en ? [['e', n[2]]] : [['k', n[1]]], answerSay: en ? [['e', n[2]]] : [['k', n[1]]] });
    q.emo = true; q.kid = true; q.count = true; return q;
  }
  if (type === 'enpic') {
    const L = EN_PIC(); const w = draw('ep', L, x => x.w);
    const ws = shuf(L.filter(x => x.e !== w.e && x.k !== w.k)).slice(0, 3).map(x => x.e);
    return emoQ({ cat: 'en', q: '"' + w.w + '" 어디 있을까?', a: w.e, w: ws, tag: '영어 그림 낱말', hint: w.e + ' ' + w.w + ' = ' + w.k, say: [['e', w.w], ['k', '어디 있을까?']], answerSay: [['e', w.w], ['k', w.k]] });
  }
}
function kidQuestion(stage, cat) {
  const T = {
    1: { ko: { kopic: 2, kocolor: 1 }, en: { kopic: 1 } },
    2: { ko: { kopic: 1, kosound: 1, kocolor: 1 }, en: { enpic: 3, encolor: 1 } },
    3: { ko: { kosound: 2, kocount: 1, kopic: 1 }, en: { enpic: 2, encolor: 1, encount: 1 } },
    4: { ko: { kopic: 1, kosound: 1, kocount: 1 }, en: { enpic: 2, encolor: 1, encount: 1 } },
    5: { ko: { kosound: 1, kocount: 2, kopic: 1 }, en: { encolor: 1, encount: 2, enpic: 2 } },
    6: { ko: { kopic: 1, kosound: 1, kocount: 1, kocolor: 1 }, en: { enpic: 2, encolor: 1, encount: 1 } },
    7: { ko: { kopic: 1, kosound: 1, kocount: 1 }, en: { enpic: 2, encolor: 1, encount: 1 } },
  }[stage][cat];
  const q = kidGen(wsel(T));
  return q;
}

function makeQuestion(cat) {
  if (R.level === 0) return kidQuestion(R.stage, cat);
  /* 고른 학년 그대로, 6~7스테이지는 한 학년 위 문제가 조금 섞임 */
  let g = R.level;
  if (R.stage >= 6 && g < 6 && Math.random() < 0.3) g++;
  const q = cat === 'ko' ? koQuestion(g) : enQuestion(g);
  q.g = g; return q;
}

/* ===================== 게임 상태 ===================== */
let R = null;           // 지금 판
let scene = 'title';
let credit = 0;
function show(id) {
  document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id));
  scene = id;
  $('hud').classList.toggle('on', ['map', 'battle', 'event'].includes(id));
}
function hud() {
  if (!R) return;
  $('hudWho').innerHTML = KIDS[R.who].name + ' · ' + (R.level ? LEVELS[R.level][0] : '그림') + ' · ' + HEROES[R.hero].name;
  let h = '';
  for (let i = 0; i < R.maxHp; i++) h += i < R.hp ? sprHTML('heart', '❤️') : sprHTML('heart_empty', '🤍');
  $('hearts').innerHTML = h;
  $('hudStage').textContent = 'ST.' + R.stage;
  $('hudScore').textContent = String(R.score).padStart(7, '0');
  const it = R.items;
  $('items').innerHTML = [['potion', '🧪', '물약: 하트 2개 회복'], ['hint', '💡', '힌트: 틀린 보기 2개 지우기'], ['shield', '🛡️', '방패: 틀려도 하트가 줄지 않아요 (자동)']]
    .map(([k, e, t]) => '<span class="item ' + (it[k] ? 'use' : 'zero') + '" data-k="' + k + '" title="' + t + '">' + e + it[k] + '</span>').join('');
}
$('items').addEventListener('click', e => { const el = e.target.closest('.item'); if (el) useItem(el.dataset.k); });
function addScore(n) { R.score += n; if (R.score > save.hi) { save.hi = R.score; } hud(); }

/* ===================== 타이틀 ===================== */
function toTitle() {
  R = null; show('title'); bgm('title'); stopVoice();
  $('hiTxt').textContent = 'HI-SCORE ' + String(save.hi).padStart(7, '0');
  credit = 0; $('creditTxt').textContent = 'CREDIT 0'; $('pushTxt').textContent = 'INSERT COIN';
}
function titlePress() {
  audioInit();
  if (credit === 0) { credit = 1; sfx('coin'); $('creditTxt').textContent = 'CREDIT 1'; $('pushTxt').textContent = 'PUSH START'; bgm('title'); return; }
  sfx('start'); credit = 0; toSelectKid();
}
$('title').addEventListener('pointerdown', titlePress);

/* ===================== 선택 ===================== */
let selStep = 'kid', selVal = null;
function cardsHTML(list, cls) {
  $('cards').className = 'cards ' + cls;
  $('cards').innerHTML = list.map(c => '<div class="card panel" data-v="' + c.v + '">' + c.html + '</div>').join('');
}
function toSelectKid() {
  show('select'); selStep = 'kid'; selVal = null;
  $('selTitle').textContent = '누가 모험을 떠날까요?'; $('selSub').textContent = '';
  cardsHTML(Object.entries(KIDS).map(([v, k]) => ({ v, html: '<div class="face" style="border:none;background:none;border-radius:0">' + '<img src="assets/' + k.face + '.png" alt="" onerror="this.outerHTML=\'' + k.emo + '\'"></div><div class="nm">' + k.name + ' <small style="font-size:24px">(' + k.age + ')</small></div><div class="ds">' + k.desc + '</div>' })), 'kids');
  speak([['k', '누가 모험을 떠날까요?']]);
}
const LEVELS = [
  ['그림 퀴즈', '글을 몰라도 OK!<br>그림 보고 소리 듣고', '🖼️'],
  ['초1', '쉬운 낱말·흉내말<br>영어 첫 낱말', '1'], ['초2', '생활 낱말·반대말<br>영어 철자·문장', '2'],
  ['초3', '높임말·감정 낱말<br>영어 문장·대화', '3'], ['초4', '한자어·속담·관용어<br>영어 문장·대화', '4'],
  ['초5', '교과 낱말·사자성어<br>영어 긴 문장', '5'], ['초6', '어려운 낱말·사자성어<br>영어 고급 문장', '6'],
];
function toSelectLevel() {
  selStep = 'level'; selVal = R.level != null ? R.level : (R.who === 'jinseo' ? 0 : 2);
  $('selTitle').textContent = '난이도를 골라요!'; $('selSub').textContent = KIDS[R.who].name + '에게 맞는 단계를 골라요';
  $('cards').className = 'cards'; $('cards').style.flexWrap = 'wrap';
  $('cards').innerHTML = LEVELS.map((l, i) => '<div class="card panel" data-v="' + i + '" style="max-width:270px;min-width:262px;flex:0 0 262px;padding:10px 12px"><div class="nm" style="font-size:' + (i ? 40 : 32) + 'px">' + (i ? '' : '🖼️ ') + l[0] + '</div><div class="ds" style="font-size:19px">' + l[1] + '</div><div style="font-size:17px;color:#ffd23f;margin-top:4px">STAGE ' + unlocked(R.who, i) + '까지 열림</div></div>').join('');
  markSel();
  speak([['k', '난이도를 골라요!']]);
}
function toSelectHero() {
  $('cards').style.flexWrap = '';
  selStep = 'hero'; selVal = null;
  $('selTitle').textContent = '용사를 골라요!'; $('selSub').textContent = '용사마다 특별한 힘이 있어요';
  cardsHTML(Object.entries(HEROES).map(([v, h]) => ({ v, html: '<div class="pic"><div class="spr">' + sprHTML('hero_' + v, h.emo) + '</div></div><div class="nm">' + h.name + '</div><div class="ab">' + h.ab + '</div>' })), 'heroes');
  speak([['k', '용사를 골라요!']]);
}
function toSelectStage() {
  selStep = 'stage'; selVal = Math.min(R.stage || 99, unlocked(R.who, R.level));
  $('selTitle').textContent = '어느 스테이지부터 할까요?'; $('selSub').textContent = '열린 스테이지만 고를 수 있어요';
  const max = unlocked(R.who, R.level);
  $('cards').className = 'cards'; $('cards').style.flexWrap = 'wrap';
  $('cards').innerHTML = STAGES.slice(1).map((s, i) => {
    const n = i + 1, open = n <= max;
    const sub = R.level === 0 ? JINSEO_SUB[n] : LEVELS[R.level][0] + (n >= 6 && R.level < 6 ? ' + 조금 더 어려운 문제' : n === 7 ? ' 최종' : '');
    return '<div class="card panel' + (open ? '' : ' locked') + '" data-v="' + n + '" style="max-width:280px;min-width:270px;flex:0 0 270px;padding:12px;' + (open ? '' : 'opacity:.4') + '"><div class="nm" style="font-size:28px">' + (open ? '' : '🔒 ') + n + '. ' + s.name + '</div><div class="ds" style="font-size:20px">' + sub + '</div></div>';
  }).join('');
  markSel();
}
function markSel() { document.querySelectorAll('#cards .card').forEach(c => c.classList.toggle('sel', c.dataset.v == selVal)); }
$('cards').addEventListener('click', e => {
  const c = e.target.closest('.card'); if (!c || c.classList.contains('locked')) return;
  audioInit(); sfx('cursor'); selVal = c.dataset.v; markSel();
  if (selStep === 'kid') speak([['k', KIDS[selVal].name]]);
  if (selStep === 'hero') speak([['k', HEROES[selVal].name]]);
  if (selStep === 'level') speak([['k', selVal == 0 ? '그림 퀴즈' : '초' + selVal]]);
});
$('cards').addEventListener('dblclick', () => $('selGo').click());
$('selGo').addEventListener('click', () => {
  if (!selVal) { sfx('wrong'); return; }
  sfx('select');
  if (selStep === 'kid') { R = { who: selVal }; toSelectLevel(); return; }
  if (selStep === 'level') { R.level = +selVal; toSelectHero(); return; }
  if (selStep === 'hero') { R.hero = selVal; if (unlocked(R.who, R.level) > 1) { toSelectStage(); return; } selVal = 1; }
  $('cards').style.flexWrap = '';
  startRun(+selVal);
});

/* ===================== 판 시작 ===================== */
function startRun(stage) {
  const maxHp = (R.level <= 1 ? 6 : 5) + (R.hero === 'warrior' ? 1 : 0);
  Object.assign(R, { stage, hp: maxHp, maxHp, score: 0, items: { potion: 1, hint: 1, shield: 0 }, continues: 0, wrongs: [], right: 0, total: 0 });
  startStage();
}
function startStage() {
  R.board = makeBoard(R.stage); R.pos = 0; R.board[0].done = true; R.stageWrongs = []; R.stageRight = 0; R.stageTotal = 0;
  show('map'); bgm('map'); hud(); drawMap();
  const s = STAGES[R.stage];
  mapMsg('<b>STAGE ' + R.stage + ' · ' + s.name + '</b>', '주사위를 굴려 앞으로 가요! 맨 끝 성에 <b>보스</b>가 기다려요.');
  speak([['k', '스테이지 ' + R.stage], ['k', s.name]]);
  $('rollBtn').disabled = false;
}
function mapMsg(n, m) { $('mapName').innerHTML = n; $('mapMsg').innerHTML = m; }

/* ===================== 지도 ===================== */
const TILE = { s: ['start', '🚩'], m: ['mon', ''], i: ['inn', '🏠'], f: ['elf', '🧚'], c: ['chest', '🎁'], d: ['dragon', '🐉'], b: ['boss', '🏰'] };
function drawMap() {
  $('mapBg').style.backgroundImage = 'url(' + IMG + 'bg_map_' + R.stage + '.webp)';
  $('mapBg').style.backgroundColor = ['', '#5fae4a', '#3d7a3a', '#3b8bb8', '#d8b26a', '#cfe3f0', '#7a3a2a', '#40305a'][R.stage];
  let svg = '';
  NODES.forEach((p, i) => nextOf(i).forEach(j => {
    const q = NODES[j];
    svg += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '" stroke="#000" stroke-width="22" stroke-linecap="round"/>' +
      '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '" stroke="#fff3c4" stroke-width="12" stroke-linecap="round" stroke-dasharray="2 18"/>';
  }));
  $('mapSvg').innerHTML = svg;
  $('nodes').innerHTML = R.board.map((b, i) => {
    const [cls, emo] = TILE[b.t]; const p = NODES[i];
    let inner = emo, tag = '';
    if (b.t === 'm') { const mid = monFor(i); inner = sprHTML('mon_' + String(mid).padStart(2, '0'), MON[mid][1]); tag = '<span class="tag">' + (b.cat === 'ko' ? '가' : 'A') + '</span>'; }
    if (b.t === 'b') inner = '🏰';
    if (b.t === 'd') { const m = STAGES[R.stage].mid[0]; inner = typeof m === 'string' ? sprHTML('boss_' + m.slice(1), '🐉') : sprHTML('mon_' + String(m).padStart(2, '0'), '🐉'); }
    return '<div class="node ' + cls + (b.t === 'm' && b.cat === 'en' ? ' en' : '') + (b.done && i ? ' done' : '') + '" data-i="' + i + '" style="left:' + p[0] + 'px;top:' + p[1] + 'px">' + inner + tag + '</div>';
  }).join('');
  $('token').innerHTML = '<div class="spr">' + sprHTML('hero_' + R.hero, HEROES[R.hero].emo) + '</div>';
  placeToken(R.pos, true);
}
function monFor(i) { const L = STAGES[R.stage].mons; return L[(i * 7 + R.stage + (R.monSeed || 0)) % L.length]; }
function placeToken(i, instant) {
  const t = $('token'); if (instant) t.style.transition = 'none';
  t.style.left = NODES[i][0] + 'px'; t.style.top = NODES[i][1] + 'px';
  if (instant) { void t.offsetWidth; t.style.transition = ''; }
}
let rolling = false;
$('rollBtn').addEventListener('click', roll);
async function roll() {
  if (rolling || scene !== 'map') return;
  rolling = true; $('rollBtn').disabled = true; audioInit(); stopVoice();
  const d = $('dice'); d.classList.add('roll'); sfx('dice_roll');
  let n = 1;
  for (let k = 0; k < 14; k++) { n = 1 + rndi(6); d.textContent = n; await wait(60 + k * 6); }
  d.classList.remove('roll'); sfx('dice_stop');
  speak([['k', n + '칸']]);
  await wait(500);
  await move(n);
  rolling = false;
}
async function move(n) {
  while (n > 0) {
    let nx = nextOf(R.pos);
    if (!nx.length) break;
    let to = nx[0];
    if (nx.length > 1) to = await chooseFork(nx);
    R.pos = to; n--;
    placeToken(to); $('token').classList.remove('hop'); void $('token').offsetWidth; $('token').classList.add('hop'); sfx('step');
    await wait(260);
    const t = R.board[to].t;
    if (t === 'd' && !R.board[to].done) { mapMsg('🐉 용의 칸!', '용 칸에서는 반드시 멈춰서 싸워야 해요!'); break; }
    if (t === 'b') break;
  }
  await wait(250);
  landOn(R.pos);
}
function chooseFork(opts) {
  return new Promise(res => {
    $('forkMsg').style.display = 'block'; speak([['k', '어느 길로 갈까요?']]);
    const ic = ids => ids.map(i => ({ m: '⚔️', i: '🏠', f: '🧚', c: '🎁', d: '🐉' }[R.board[i].t] || '')).join(' ');
    mapMsg('갈림길! 어느 길로 갈까요?', '<b>아래 길</b>: ' + ic([11, 12, 13]) + '<br><b>윗길</b>: ' + ic([14, 15, 16]));
    const els = opts.map(i => document.querySelector('.node[data-i="' + i + '"]'));
    els.forEach(e => e.classList.add('reach'));
    const h = e => {
      const el = e.target.closest('.node'); if (!el || !opts.includes(+el.dataset.i)) return;
      $('nodes').removeEventListener('click', h); els.forEach(x => x.classList.remove('reach')); $('forkMsg').style.display = 'none'; sfx('select'); res(+el.dataset.i);
    };
    $('nodes').addEventListener('click', h);
    forkKeys = opts; forkPick = i => h({ target: document.querySelector('.node[data-i="' + opts[i] + '"]') });
  });
}
let forkKeys = null, forkPick = null;
function landOn(i) {
  const b = R.board[i];
  forkKeys = null;
  if (b.t === 'm') return startBattle({ kind: 'mon', mon: monFor(i), cat: b.cat, node: i });
  if (b.t === 'd') return startBattle({ kind: 'mid', node: i });
  if (b.t === 'b') return startBattle({ kind: 'boss', node: i });
  if (b.t === 'i') return eventInn(i);
  if (b.t === 'f') return eventElf(i);
  if (b.t === 'c') return eventChest(i);
  backToMap();
}
function backToMap(msg) {
  show('map'); bgm('map'); hud(); drawMap();
  mapMsg('<b>STAGE ' + R.stage + ' · ' + STAGES[R.stage].name + '</b>', msg || '주사위를 굴려요!');
  $('rollBtn').disabled = false;
}

/* ===================== 전투 ===================== */
let B = null;
function gemsNeeded(kind) {
  const kid = R.level === 0;
  if (kind === 'boss') return kid ? 4 : (R.stage === 7 ? 7 : 5);
  if (kind === 'mid') return kid ? 3 : 3;
  return kid ? (R.stage <= 2 ? 1 : 2) : 2;
}
async function startBattle(o) {
  B = Object.assign({ gems: 0, need: gemsNeeded(o.kind), qn: 0 }, o);
  if (o.kind === 'mon') { B.name = MON[o.mon][0]; B.img = 'mon_' + String(o.mon).padStart(2, '0'); B.emo = MON[o.mon][1]; }
  if (o.kind === 'mid') {
    const m = STAGES[R.stage].mid;
    if (typeof m[0] === 'string') { const bi = +m[0].slice(1); B.img = 'boss_' + bi; B.emo = BOSS[bi][1]; } else { B.img = 'mon_' + String(m[0]).padStart(2, '0'); B.emo = MON[m[0]][1]; }
    B.name = m[1];
  }
  if (o.kind === 'boss') { const bi = STAGES[R.stage].boss; B.img = 'boss_' + bi; B.emo = BOSS[bi][1]; B.name = BOSS[bi][0]; }
  show('battle');
  $('batBg').style.backgroundImage = 'url(' + IMG + 'bg_battle_' + R.stage + '.webp)';
  $('batBg').style.backgroundColor = '#223';
  spr($('batHero'), 'hero_' + R.hero, HEROES[R.hero].emo);
  spr($('batMon'), B.img, B.emo);
  $('batMon').className = 'spr mon' + (o.kind !== 'mon' ? ' boss' : '');
  $('monName').textContent = (o.kind === 'boss' ? '👑 BOSS ' : o.kind === 'mid' ? '🔥 ' : '') + B.name;
  drawGems();
  clearQ();
  if (o.kind === 'mon') { bgm('battle'); speak([['k', B.name + ' 등장!']]); await wait(900); }
  else { bgm(''); sfx('boss_appear'); stamp(o.kind === 'boss' ? 'BOSS!' : 'WARNING!', '#ff4d5e'); $('stage').classList.add('shake'); setTimeout(() => $('stage').classList.remove('shake'), 400); await wait(2000); bgm('boss'); }
  nextQuestion();
}
function drawGems() {
  $('gems').innerHTML = Array.from({ length: B.need }, (_, i) => '<span class="gem' + (i < B.gems ? ' on' : '') + '">' + (i < B.gems ? sprHTML('gem_on', '🔴') : sprHTML('gem_off', '⚪')) + '</span>').join('');
}
function clearQ() {
  $('qtext').textContent = ''; $('qbig').textContent = ''; $('choices').innerHTML = ''; $('cat').style.display = 'none';
  $('ability').style.display = 'none'; $('explain').style.display = 'none'; $('qbox').style.display = 'none';
}
function battleCat() {
  if (B.kind === 'mon') return B.cat;
  if (R.level === 0 && R.stage <= 1) return 'ko';
  return B.qn % 2 ? 'en' : 'ko';
}
async function nextQuestion() {
  if (scene !== 'battle') return;
  clearQ(); B.locked = true;
  let cat = battleCat();
  B.ninja = false; B.amazon = false;
  /* 용사 특별한 힘 */
  if (R.hero === 'wizard' && Math.random() < 0.3) cat = await pickCategory();
  if (R.hero === 'ninja' && Math.random() < 0.3) B.ninja = true;
  if (R.hero === 'amazon' && Math.random() < 0.35) B.amazon = true;
  const q = makeQuestion(cat); B.q = q; B.qn++; R.total++; R.stageTotal++;
  if (B.amazon) { /* 틀린 보기 1~2개 지우기 */
    const wr = shuf(q.choices.map((c, i) => i).filter(i => i !== q.ans)).slice(0, q.choices.length >= 4 ? 2 : 1);
    q.gone = wr;
  }
  renderQ(q);
  if (B.ninja) { abilityMsg('🥷 분신술! 맞히면 보석 2개!'); sfx('magic'); }
  else if (B.amazon) { abilityMsg('🏹 아마존의 눈! 틀린 보기가 사라졌어요'); sfx('magic'); }
  B.locked = false;
  readQ(q);
}
function pickCategory() {
  return new Promise(res => {
    $('pickCat').style.display = 'flex'; sfx('magic'); speak([['k', '마법사의 힘! 문제 종류를 골라요']]);
    const done = c => { $('pickCat').style.display = 'none'; sfx('select'); res(c); };
    $('pkKo').onclick = () => done('ko'); $('pkEn').onclick = () => done('en');
  });
}
function abilityMsg(t) { const a = $('ability'); a.textContent = t; a.style.display = 'block'; }
function renderQ(q) {
  const c = $('cat'); c.style.display = 'flex'; c.className = q.cat;
  c.innerHTML = sprHTML(q.cat === 'ko' ? 'icon_ko' : 'icon_en', q.cat === 'ko' ? '📜' : '🔤') + (q.cat === 'ko' ? '국어' : '영어') + ' · ' + esc(q.tag || '');
  const long = q.long || (q.big && q.big.length > 40);
  $('qbox').style.display = 'block'; $('qbox').classList.toggle('tall', !!long);
  $('qtext').textContent = q.q;
  const big = $('qbig'); big.className = '';
  if (q.big) {
    big.innerHTML = esc(q.big) + (q.ko ? '<span class="ko">' + esc(q.ko) + '</span>' : '');
    if (long) big.className = 'long';
    else if (/^\p{Extended_Pictographic}/u.test(q.big) && q.big.replace(/[\p{Extended_Pictographic}️‍\s]/gu, '').length === 0) big.className = 'emo';
  } else if (q.ko) big.innerHTML = '<span class="ko">' + esc(q.ko) + '</span>';
  else big.innerHTML = '';
  $('speakBtn').style.display = q.say ? '' : 'none';
  const ch = $('choices'); ch.className = q.choices.length === 3 && q.emo ? 'three' : '';
  const maxLen = Math.max(...q.choices.map(x => String(x).length));
  ch.innerHTML = q.choices.map((t, i) => {
    let cls = 'ch';
    if (q.emo) cls += ' emo'; else if (maxLen > 18) cls += ' small'; else if (maxLen > 11) cls += ' mid';
    if (q.gone && q.gone.includes(i)) cls += ' gone';
    const label = q.count ? '<span style="font-size:' + (String(t).length > 8 ? 40 : 56) + 'px;letter-spacing:-6px">' + t + '</span>' : esc(t);
    return '<button class="' + cls + '" data-i="' + i + '"><span class="k">' + 'ABCD'[i] + '</span><span>' + label + '</span></button>';
  }).join('');
  if (long) { $('choices').style.bottom = '12px'; }
  $('choices').classList.remove('locked');
}
function readQ(q) { if (q.say) speak(q.say); }
$('speakBtn').addEventListener('click', e => { e.stopPropagation(); if (B && B.q) readQ(B.q); });
$('choices').addEventListener('click', e => { const b = e.target.closest('.ch'); if (b) answer(+b.dataset.i); });

/* ---------- 답하기 ---------- */
async function answer(i) {
  if (!B || B.locked || scene !== 'battle') return;
  const q = B.q; if (i >= 0 && q.gone && q.gone.includes(i)) return;
  B.locked = true; stopVoice();
  $('choices').classList.add('locked');
  const btns = [...document.querySelectorAll('#choices .ch')];
  const ok = i === q.ans;
  if (ok) {
    btns[i].classList.add('right'); btns.forEach((b, k) => { if (k !== i) b.classList.add('dim'); });
    sfx('correct'); stamp(pick1(['딩동댕!', '정답!', '최고!', '굉장해!']), '#3ee07a');
    R.right++; R.stageRight++;
    const bonus = (100 + 100 * Math.min(B.qn, 5)) * (B.ninja ? 2 : 1);
    addScore(bonus);
    if (q.sayAfter || q.answerSay) speak(q.sayAfter || q.answerSay); else if (q.cat === 'en' && q.word) speak([['e', q.word.w]]);
    await wait(500);
    await heroAttack(B.ninja ? 2 : 1, bonus);
    if (B.gems >= B.need) return winBattle();
    await wait(400);
    nextQuestion();
  } else {
    if (i >= 0) btns[i].classList.add('wrong');
    btns[q.ans].classList.add('right');
    sfx('wrong'); stamp('땡!', '#ff4d5e');
    R.wrongs.push(q); R.stageWrongs.push(q);
    await wait(700);
    await monsterAttack();
    showExplain(q, i);
  }
}
async function heroAttack(n, pts) {
  const h = $('batHero'), m = $('batMon');
  h.classList.remove('lunge'); void h.offsetWidth; h.classList.add('lunge'); sfx('attack');
  await wait(200);
  const fx = $('fx'); const s = document.createElement('div'); s.className = 'slash'; s.style.left = '880px'; s.style.top = '230px'; fx.appendChild(s);
  m.classList.remove('hitflash'); void m.offsetWidth; m.classList.add('hitflash'); sfx('hit');
  const d = document.createElement('div'); d.className = 'dmg'; d.textContent = '+' + pts; d.style.left = '900px'; d.style.top = '150px'; fx.appendChild(d);
  setTimeout(() => { s.remove(); d.remove(); }, 1000);
  for (let k = 0; k < n && B.gems < B.need; k++) { B.gems++; drawGems(); const g = $('gems').children[B.gems - 1]; if (g) g.classList.add('lit'); sfx('gem'); await wait(250); }
  await wait(300);
}
async function monsterAttack() {
  const m = $('batMon'), h = $('batHero');
  m.classList.remove('mlunge'); void m.offsetWidth; m.classList.add('mlunge'); sfx('enemy_attack');
  await wait(200);
  h.classList.remove('hitflash'); void h.offsetWidth; h.classList.add('hitflash');
  $('stage').classList.add('shake'); setTimeout(() => $('stage').classList.remove('shake'), 400);
  let mark = '💔';
  if (R.items.shield > 0) { R.items.shield--; mark = '🛡️'; sfx('magic'); } else R.hp = Math.max(0, R.hp - 1);
  hud();
  const d = document.createElement('div'); d.className = 'dmg'; d.textContent = mark; d.style.left = '170px'; d.style.top = '150px'; $('fx').appendChild(d); setTimeout(() => d.remove(), 1000);
  await wait(400);
}
function showExplain(q, i) {
  $('choices').innerHTML = '';
  $('explain').style.display = 'block';
  $('exH').textContent = '😅 아쉬워요! 정답은…';
  $('exA').innerHTML = q.emo ? '<span style="font-size:' + (q.count ? 44 : 72) + 'px;vertical-align:middle">' + esc(q.answer) + '</span>  ' + esc((q.hint || '').replace(q.answer, '').trim()) : esc(q.answer);
  $('exE').textContent = q.emo ? '' : (q.hint || '');
  const parts = [['k', '정답은']];
  if (q.answerSay) parts.push(...q.answerSay);
  else if (q.cat === 'en' && q.word) parts.push(['e', q.word.w], ['k', q.word.k]);
  else if (q.sayAfter) parts.push(...q.sayAfter);
  else if (!q.emo) parts.push([q.cat === 'en' && /^[\x00-\x7f]+$/.test(q.answer) ? 'e' : 'k', String(q.answer)]);
  speak(parts);
  B.explaining = true;
  $('exNext').disabled = true; setTimeout(() => { $('exNext').disabled = false; }, 900 * FAST);
}
$('exNext').addEventListener('click', () => {
  if (!B || !B.explaining) return; B.explaining = false; sfx('select'); stopVoice();
  $('explain').style.display = 'none';
  if (R.hp <= 0) return gameOver();
  nextQuestion();
});
async function winBattle() {
  const m = $('batMon'); m.classList.remove('hitflash'); m.classList.add('down'); sfx('monster_down');
  stopVoice();
  const pts = B.kind === 'boss' ? 3000 : B.kind === 'mid' ? 1000 : 300;
  addScore(pts);
  stamp(B.kind === 'mon' ? 'WIN!' : 'VICTORY!', '#ffd23f');
  R.board[B.node].done = true;
  if (R.hero === 'warrior' && R.hp < R.maxHp) { R.hp++; hud(); sfx('heal'); }
  await wait(1500);
  m.classList.remove('down');
  if (B.kind === 'boss') return stageClear();
  let msg = B.name + '을(를) 물리쳤어요! +' + pts + '점';
  if (B.kind === 'mid') { R.items.hint++; msg += ' · 💡힌트를 얻었어요!'; }
  backToMap(msg);
}
function stamp(t, color) {
  const s = document.createElement('div'); s.className = 'stamp'; s.textContent = t; s.style.color = color;
  s.style.textShadow = '6px 6px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000';
  $('fx').appendChild(s); setTimeout(() => s.remove(), 950);
}

/* ---------- 아이템 ---------- */
function useItem(k) {
  if (!R || !R.items[k]) return;
  if (k === 'potion') { if (R.hp >= R.maxHp) return; R.items.potion--; R.hp = Math.min(R.maxHp, R.hp + 2); sfx('heal'); hud(); return; }
  if (scene !== 'battle' || !B || B.locked) return;
  if (k === 'hint') {
    const q = B.q; const wr = q.choices.map((c, i) => i).filter(i => i !== q.ans && !(q.gone || []).includes(i));
    if (!wr.length) return;
    R.items.hint--; sfx('magic');
    q.gone = (q.gone || []).concat(shuf(wr).slice(0, Math.min(2, wr.length - (wr.length > 2 ? 0 : 1)) || 1));
    document.querySelectorAll('#choices .ch').forEach((b, i) => b.classList.toggle('gone', q.gone.includes(i)));
    hud();
  }

}

/* ===================== 이벤트 칸 ===================== */
function eventScreen(bg, npc, emo, html, btns) {
  show('event'); hud();
  $('evBg').style.backgroundImage = 'url(' + IMG + bg + '.webp)'; $('evBg').style.backgroundColor = '#332';
  $('evNpc').style.display = npc ? '' : 'none'; if (npc) spr($('evNpc'), npc, emo);
  $('evChest').style.display = 'none';
  $('evSay').innerHTML = html;
  $('evBtns').innerHTML = '';
  btns.forEach(([t, cls, fn]) => { const b = document.createElement('button'); b.className = 'abtn ' + (cls || ''); b.textContent = t; b.onclick = () => { sfx('select'); fn(); }; $('evBtns').appendChild(b); });
}
function eventInn(i) {
  bgm('inn'); R.board[i].done = true;
  eventScreen('bg_inn', 'npc_inn', '👩‍🍳', '여관에 온 걸 환영해요! 🍲<br>문제를 맞히면 따뜻한 수프로 <b>하트 3개</b>를 채워 줄게요.<br>틀려도 하트 1개는 채워 줘요.',
    [['문제 풀기!', '', () => miniQuiz('inn')], ['그냥 쉬기 (하트 +1)', 'gray', () => { heal(1); backToMap('여관에서 쉬었어요. 하트 +1'); }]]);
  speak([['k', '여관에 온 걸 환영해요!']]);
}
function eventElf(i) {
  R.board[i].done = true; bgm('inn');
  eventScreen('bg_elf', 'npc_elf', '🧚', '반짝반짝~ 나는 요정이야! ✨<br>내 문제를 맞히면 <b>마법 아이템</b>을 줄게!<br>(💡힌트 · 🛡️방패 · 🧪물약 중 하나)',
    [['문제 풀기!', '', () => miniQuiz('elf')], ['지나가기', 'gray', () => backToMap()]]);
  sfx('magic'); speak([['k', '반짝반짝, 나는 요정이야!']]);
}
function eventChest(i) {
  R.board[i].done = true;
  eventScreen('bg_inn', null, '', '보물상자를 발견했어요! 🎁<br>열어 볼까요?', [['열기!', '', () => openChest()]]);
  $('evBg').style.backgroundImage = 'url(' + IMG + 'bg_map_' + R.stage + '.webp)';
  $('evChest').style.display = ''; spr($('evChest'), 'item_chest', '🎁');
}
function openChest() {
  spr($('evChest'), 'item_chest_open', '💰'); sfx('treasure');
  const r = Math.random(); let msg;
  if (r < 0.35) { const p = 500 + rndi(6) * 100; addScore(p); msg = '💰 금화 ' + p + '점!'; }
  else if (r < 0.55) { heal(R.maxHp); msg = '💖 하트가 모두 찼어요!'; }
  else if (r < 0.75) { R.items.hint++; msg = '💡 힌트를 얻었어요!'; }
  else if (r < 0.9) { R.items.potion++; msg = '🧪 물약을 얻었어요!'; }
  else { R.items.shield++; msg = '🛡️ 방패를 얻었어요! 한 번 틀려도 하트가 그대로예요'; }
  hud(); $('evSay').innerHTML = msg; speak([['k', '보물이다!']]);
  $('evBtns').innerHTML = ''; const b = document.createElement('button'); b.className = 'abtn'; b.textContent = '계속 ▶'; b.onclick = () => backToMap(msg); $('evBtns').appendChild(b);
}
function heal(n) { R.hp = Math.min(R.maxHp, R.hp + n); sfx('heal'); hud(); }
function miniQuiz(kind) {
  /* 전투 화면을 빌려 한 문제만 */
  const name = kind === 'inn' ? '여관 주인' : '요정';
  B = { kind: 'event', ev: kind, gems: 0, need: 1, qn: rndi(2), node: R.pos, name, img: kind === 'inn' ? 'npc_inn' : 'npc_elf', emo: kind === 'inn' ? '👩‍🍳' : '🧚' };
  show('battle'); $('batBg').style.backgroundImage = 'url(' + IMG + (kind === 'inn' ? 'bg_inn' : 'bg_elf') + '.webp)';
  spr($('batHero'), 'hero_' + R.hero, HEROES[R.hero].emo); spr($('batMon'), B.img, B.emo); $('batMon').className = 'spr mon';
  $('monName').textContent = name; drawGems();
  nextQuestion();
}
/* 이벤트 문제 결과는 answer() 대신 여기서 */
const _answer = answer;
answer = async function (i) {
  if (!B || B.kind !== 'event') return _answer(i);
  if (B.locked) return;
  const q = B.q; if (i >= 0 && q.gone && q.gone.includes(i)) return;
  B.locked = true; stopVoice(); $('choices').classList.add('locked');
  const btns = [...document.querySelectorAll('#choices .ch')]; const ok = i === q.ans;
  btns[q.ans].classList.add('right'); if (!ok && i >= 0) btns[i].classList.add('wrong');
  let msg;
  if (ok) {
    sfx('correct'); stamp('정답!', '#3ee07a'); R.right++; addScore(200);
    if (B.ev === 'inn') { heal(3); msg = '🍲 맛있는 수프! 하트 +3'; }
    else { const k = pick1(['hint', 'shield', 'potion']); R.items[k]++; sfx('magic'); msg = '✨ 요정의 선물: ' + { hint: '💡 힌트', shield: '🛡️ 방패', potion: '🧪 물약' }[k] + '!'; }
  } else {
    sfx('wrong'); stamp('땡!', '#ff4d5e'); R.wrongs.push(q); R.stageWrongs.push(q);
    if (B.ev === 'inn') { heal(1); msg = '정답은 "' + q.answer + '" · 그래도 하트 +1'; } else msg = '정답은 "' + q.answer + '" · 다음에 또 만나!';
  }
  hud(); if (q.sayAfter || q.answerSay) speak(q.sayAfter || q.answerSay);
  await wait(ok ? 1500 : 2600);
  B = null; backToMap(msg);
};

/* ===================== 스테이지 클리어 / 게임 오버 ===================== */
function stageClear() {
  show('clear'); bgm(''); sfx('stage_clear'); 
  $('clearBg').style.backgroundImage = 'url(' + IMG + 'bg_map_' + R.stage + '.webp)';
  const bonus = R.hp * 500; addScore(bonus);
  const pct = R.stageTotal ? Math.round(R.stageRight / R.stageTotal * 100) : 100;
  $('clearTally').innerHTML = 'STAGE ' + R.stage + ' · ' + STAGES[R.stage].name + ' 정복!<br>맞힌 문제 <b>' + R.stageRight + '</b> / ' + R.stageTotal + ' (' + pct + '%)<br>남은 하트 보너스 ' + R.hp + ' × 500 = <b>' + bonus + '</b><br>SCORE <b>' + R.score + '</b>';
  const ws = R.stageWrongs;
  $('clearWrongs').style.display = ws.length ? '' : 'none';
  $('clearWrongs').innerHTML = '<div style="color:#ffd23f">📒 틀린 문제 다시 보기</div>' + ws.map(q => '· ' + esc(q.q) + (q.big && !q.emo ? ' <span style="color:#ffd23f">' + esc(String(q.big).slice(0, 60)) + '</span>' : '') + ' → <b>' + esc(q.answer) + '</b>' + (q.hint && !q.emo ? ' <span style="color:#b9b0d6">(' + esc(q.hint) + ')</span>' : '')).join('<br>');
  const next = R.stage + 1;
  if (next <= 7) unlock(R.who, R.level, next);
  persist();
  $('clearNext').textContent = R.stage >= 7 ? '엔딩 보기 ▶' : '다음 스테이지 ▶';
  speak([['k', '스테이지 클리어!']]);
}
$('clearNext').addEventListener('click', () => {
  sfx('select');
  if (R.stage >= 7) return ending();
  R.stage++; R.hp = Math.min(R.maxHp, R.hp + 2); startStage();
});
let overId = null;
function gameOver() {
  show('over'); bgm(''); sfx('game_over'); persist();
  let n = 9; $('overCnt').textContent = n; $('overT').textContent = 'CONTINUE?';
  speak([['k', '다시 도전할까요?']]);
  clearInterval(overId);
  overId = setInterval(() => {
    n--; if (n < 0) { clearInterval(overId); $('overT').textContent = 'GAME OVER'; $('overCnt').textContent = ''; $('overMsg').textContent = '';
      $('overBtn').textContent = '처음 화면으로'; return; }
    $('overCnt').textContent = n; sfx('continue');
  }, 1300 * FAST);
  $('overBtn').textContent = '다시 도전!'; $('overMsg').textContent = '버튼을 누르면 하트가 가득 차요!';
}
$('overBtn').addEventListener('click', () => {
  clearInterval(overId);
  if ($('overT').textContent === 'GAME OVER') { persist(); return toTitle(); }
  sfx('coin'); R.continues++; R.hp = R.maxHp; R.score = 0;
  show('battle'); hud(); if (B) { B.locked = false; bgm(B.kind === 'mon' ? 'battle' : 'boss'); nextQuestion(); } else backToMap();
});
function ending() {
  show('ending'); bgm('ending'); sfx('levelup'); persist();
  const pct = R.total ? Math.round(R.right / R.total * 100) : 0;
  $('endTally').innerHTML = '🐉 황금 용왕을 물리쳤어요! 🐉<br>' + KIDS[R.who].name + ' 어휘 용사 탄생!<br><br>맞힌 문제 ' + R.right + ' / ' + R.total + ' (' + pct + '%)<br>다시 도전 ' + R.continues + '번 ' + (R.continues === 0 ? '👑' : '') + '<br>FINAL SCORE <b>' + R.score + '</b>';
  speak([['k', '축하해요! 어휘 용사 탄생!']]);
}
$('endBtn').addEventListener('click', () => { sfx('select'); toTitle(); });

/* ===================== 메뉴 ===================== */
function leave() {
  epoch++; rolling = false; forkKeys = null; stopVoice();
  $('forkMsg').style.display = 'none'; $('pickCat').style.display = 'none'; clearInterval(overId);
  $('fx').innerHTML = ''; B = null;
}
function openMenu() {
  if (!R || !['map', 'battle', 'event'].includes(scene)) return;
  audioInit(); sfx('select');
  $('menuSound').textContent = muted ? '🔊 소리 켜기' : '🔇 소리 끄기';
  $('menu').style.display = 'flex';
}
function closeMenu() { $('menu').style.display = 'none'; }
$('menuBtn').addEventListener('click', e => { e.stopPropagation(); openMenu(); });
$('menu').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const act = b.dataset.act; sfx('select');
  if (act === 'resume') return closeMenu();
  if (act === 'sound') { setMute(!muted); $('menuSound').textContent = muted ? '🔊 소리 켜기' : '🔇 소리 끄기'; return; }
  closeMenu(); leave();
  if (act === 'restart') { R.hp = R.maxHp; startStage(); }
  if (act === 'stage') { $('cards').style.flexWrap = ''; show('select'); toSelectStage(true); }
  if (act === 'kid') toSelectKid();
  if (act === 'level') { show('select'); toSelectLevel(); }
  if (act === 'title') { persist(); toTitle(); }
});
$('selBack').addEventListener('click', () => {
  sfx('select'); stopVoice(); $('cards').style.flexWrap = '';
  if (selStep === 'stage') return toSelectHero();
  if (selStep === 'hero') return toSelectLevel();
  if (selStep === 'level') return toSelectKid();
  toTitle();
});

/* ===================== 키보드 ===================== */
addEventListener('keydown', e => {
  const k = e.code;
  if (k === 'Escape') { if ($('menu').style.display === 'flex') closeMenu(); else openMenu(); return; }
  if ($('menu').style.display === 'flex') return;
  if (scene === 'title' && (k === 'Enter' || k === 'Space' || k === 'KeyZ')) { e.preventDefault(); titlePress(); return; }
  if (scene === 'battle') {
    if ($('explain').style.display === 'block' && (k === 'Enter' || k === 'Space')) { $('exNext').click(); return; }
    const m = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Numpad1: 0, Numpad2: 1, Numpad3: 2, Numpad4: 3, KeyA: 0, KeyB: 1, KeyC: 2, KeyD: 3 }[k];
    if (m != null && B && B.q && m < B.q.choices.length) answer(m);
  }
  if (scene === 'map') {
    if (forkKeys && (k === 'ArrowUp' || k === 'ArrowDown')) { forkPick(k === 'ArrowUp' ? 1 : 0); return; }
    if (k === 'Enter' || k === 'Space') { e.preventDefault(); roll(); }
  }
  if (scene === 'select' && k === 'Enter') $('selGo').click();
  if (scene === 'clear' && k === 'Enter') $('clearNext').click();
});

/* ===================== 불러오기 ===================== */
async function preload() {
  const names = ['bg_title', 'hero_warrior', 'hero_wizard', 'hero_amazon', 'hero_ninja', 'heart', 'heart_empty', 'gem_on', 'gem_off', 'icon_ko', 'icon_en'];
  let done = 0;
  await Promise.all(names.map(n => new Promise(r => { const im = new Image(); im.onload = im.onerror = () => { done++; $('loadBar').style.width = (done / names.length * 100) + '%'; r(); }; im.src = IMG + n + '.webp'; })));
  /* 나머지는 뒤에서 천천히 */
  setTimeout(() => {
    const rest = [];
    for (let i = 1; i <= 14; i++) rest.push('mon_' + String(i).padStart(2, '0'));
    for (let i = 1; i <= 7; i++) rest.push('boss_' + i, 'bg_map_' + i, 'bg_battle_' + i);
    rest.push('npc_inn', 'npc_elf', 'item_chest', 'item_chest_open', 'bg_inn', 'bg_elf', 'bg_ending');
    rest.forEach(n => { const im = new Image(); im.src = IMG + n + '.webp'; });
  }, 500);
  $('loading').style.display = 'none';
  toTitle();
}
preload();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
