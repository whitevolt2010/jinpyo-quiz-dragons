#!/usr/bin/env python3
"""voice_list.json 의 말소리를 assets/voice/N.m4a 로 만들고 src/clip.json 을 쓴다.
영어 비행단 게임에 같은 문구 녹음이 있으면 그대로 복사한다."""
import json, os, re, shutil, subprocess, concurrent.futures as cf
R = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(R, 'assets/voice'); os.makedirs(OUT, exist_ok=True)
keys = json.load(open(os.path.join(R, 'voice_list.json')))
old = {}
fly = os.path.expanduser('~/Documents/jinpyo-english-fly/index.html')
if os.path.exists(fly):
    s = open(fly, encoding='utf-8').read(); i = s.find('const CLIP = '); j = s.find(';\n', i)
    old = json.loads(s[i + 13:j])
prev = {}
cp = os.path.join(R, 'src/clip.json')
if os.path.exists(cp): prev = json.load(open(cp))
clip = {}; n = max(prev.values(), default=0)
jobs = []
for k in keys:
    if k in prev and os.path.exists(f'{OUT}/{prev[k]}.m4a'):
        clip[k] = prev[k]; continue
    n += 1; clip[k] = n; jobs.append((k, n))
def make(job):
    k, n = job; dst = f'{OUT}/{n}.m4a'
    if k in old:
        src = os.path.expanduser(f'~/Documents/jinpyo-english-fly/audio/{old[k]}.m4a')
        if os.path.exists(src): shutil.copy(src, dst); return 'copy'
    lang, text = k[0], k[2:]
    voice = 'Samantha' if lang == 'e' else 'Yuna'
    rate = '150' if lang == 'e' else '175'
    spoken = text.replace('~', '').replace('·', ', ')
    aiff = dst + '.aiff'
    txt = dst + '.txt'; open(txt, 'w', encoding='utf-8').write(spoken)
    subprocess.run(['say', '-v', voice, '-r', rate, '-o', aiff, '-f', txt], check=True); os.remove(txt)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '48000', aiff, dst], check=True)
    os.remove(aiff); return 'say'
with cf.ThreadPoolExecutor(6) as ex:
    res = list(ex.map(make, jobs))
json.dump(clip, open(cp, 'w'), ensure_ascii=False, separators=(',', ':'))
print('clips', len(clip), 'new', len(jobs), 'copied', res.count('copy'), 'said', res.count('say'))
