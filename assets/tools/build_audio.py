"""Original deterministic four-voice chiptunes; no sampled commercial music."""
from pathlib import Path
import json, subprocess
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
SR=44100
RNG=np.random.default_rng(1992)
TARGET=10**(-3/20)

def tone(midi,duration,kind='pulse',end=None):
    n=round(duration*SR); t=np.arange(n)/SR
    f=440*2**((midi-69)/12)
    freq=np.full(n,f) if end is None else np.geomspace(f,440*2**((end-69)/12),n)
    phase=np.cumsum(freq)/SR
    if kind=='triangle': y=2/np.pi*np.arcsin(np.sin(2*np.pi*phase))
    elif kind=='noise':
        y=RNG.uniform(-1,1,n); y=np.convolve(y,np.ones(3)/3,mode='same')
    else:
        # Band-limited pulse (no harsh ultrasonic aliases).
        y=np.zeros(n)
        for h in range(1,12,2):
            if h*max(freq)<SR*.45: y+=np.sin(2*np.pi*h*phase)/h
        y*=2/np.pi
    attack=min(round(.004*SR),n//3); release=min(round(.025*SR),n//3)
    env=np.ones(n); env[:attack]=np.linspace(0,1,attack); env[-release:]=np.linspace(1,0,release)
    if kind=='noise': env*=np.exp(-t*18)
    return y*env

def add(buf,y,start,gain=1):
    i=round(start*SR); length=min(len(y),len(buf)-i)
    if length>0: buf[i:i+length]+=y[:length]*gain

def encode(name,buf,folder,loop=False):
    buf=buf.astype(np.float32); buf-=buf.mean()
    buf*=TARGET/max(np.max(np.abs(buf)),1e-9)
    path=ROOT/folder/(name+'.mp3')
    def write(b):
        subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','pipe:0','-c:a','libmp3lame','-b:a','128k','-write_xing','1',str(path)],input=b.astype('<f4').tobytes(),check=True)
    def read():
        return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-f','f32le','-ac','1','pipe:1']),dtype='<f4')
    for _ in range(24):
        write(buf); dec=read(); peak=float(np.max(np.abs(dec)))
        if abs(20*np.log10(peak)+3)<.06: break
        buf*=TARGET/peak
    assert abs(20*np.log10(peak)+3)<.15, (name,peak)
    return {'path':str(path.relative_to(ROOT)),'bytes':path.stat().st_size,'duration_seconds':round(len(dec)/SR,6),'sample_rate':SR,'channels':1,'peak_dbfs':round(float(20*np.log10(np.max(np.abs(dec)))),3),'loop':loop,'decoded_samples':len(dec),'loop_boundary_delta':round(float(abs(dec[0]-dec[-1])),7) if loop else None}

SFX={
 'coin':(.48,[83,95]), 'start':(1.5,[60,64,67,72,76,79,84]),
 'select':(.22,[76,84]), 'cursor':(.07,[81]), 'dice_roll':(1.2,[]),
 'dice_stop':(.16,[60]), 'step':(.10,[65]), 'correct':(.80,[72,76,79,84]),
 'wrong':(.65,[55,52,48]), 'attack':(.28,[]), 'hit':(.22,[]),
 'enemy_attack':(.38,[]), 'gem':(.8,[84,91,96,103]),
 'monster_down':(.70,[76,69,60,48]), 'heal':(1.1,[72,79,76,84,88]),
 'treasure':(1.6,[67,72,76,79,84,79,88]), 'magic':(1.2,[84,91,88,96,91,103]),
 'boss_appear':(2.,[48,55,60,48,56,62,67,72]), 'tick':(.065,[88]),
 'timer_warn':(.48,[88,88,88]), 'levelup':(1.8,[60,64,67,72,76,79,84,88]),
 'stage_clear':(3.,[67,67,67,72,76,79,76,79,84]),
 'game_over':(2.1,[76,72,69,67,64,60]), 'continue':(.6,[76,72])}

def sfx():
    out=[]
    for name,(duration,notes) in SFX.items():
        buf=np.zeros(round(duration*SR))
        if notes:
            step=(duration-.04)/len(notes)
            for i,note in enumerate(notes):
                add(buf,tone(note,step*.88,'triangle' if name=='wrong' else 'pulse',note-5 if name=='wrong' else None),i*step,.7)
                if name in ['start','treasure','levelup','stage_clear','game_over']: add(buf,tone(note-12,step*.85,'triangle'),i*step,.35)
        elif name=='dice_roll':
            for i,t in enumerate(np.arange(0,1.15,.064)): add(buf,tone(70,.045,'noise'),float(t),.4+.3*(i%3)/2)
        else:
            add(buf,tone(45,duration*.9,'noise'),0,.6)
            if name!='attack': add(buf,tone(48,duration*.8,'triangle',24),0,.8)
        out.append(encode(name,buf,'sfx'))
    return out

CONFIG={
 'title':(120,60,[0,7,9,5], [0,4,7,12,11,7,4,2],False),
 'map':(136,62,[0,5,7,0], [0,2,4,7,4,2,9,7],False),
 'battle':(160,64,[0,9,5,7], [0,7,12,7,4,11,9,7],False),
 'boss':(144,57,[0,5,8,7], [0,3,7,12,10,7,3,2],True),
 'inn':(96,65,[0,9,5,7], [4,7,9,7,4,2,0,2],False),
 'ending':(128,60,[0,5,9,7], [7,12,11,9,7,4,2,0],False)}

def music():
    out=[]
    for name,(bpm,root,progression,motif,minor) in CONFIG.items():
        beat=60/bpm; bars=24 if name=='inn' else 32
        duration=bars*4*beat; buf=np.zeros(round(duration*SR))
        for bar in range(bars):
            chord=progression[(bar//2)%4]; base=root+chord
            third=3 if minor or chord==9 else 4
            triad=[base,base+third,base+7]
            for half in range(8):
                t=(bar*4+half*.5)*beat
                # Two pulse voices, triangle bass, noise drums: four voices.
                phrase=(bar//8)%4
                degree=motif[(half+(bar%2)*2)%8]
                pitch=root+12+degree+(12 if phrase==2 and half>=4 else 0)
                if bar%4==3 and half>=6: pitch=root+12+[2,0][half-6]
                if name=='ending' and bar==bars-1: pitch=root+12+(0 if half>3 else [7,4,2,0][half])
                add(buf,tone(pitch,beat*.42,'triangle' if name=='inn' else 'pulse'),t,.23)
                add(buf,tone(triad[(half+bar)%3],beat*.35),t,.11)
                if half%2==0: add(buf,tone(base-12+(7 if half==4 else 0),beat*.82,'triangle'),t,.30)
                drum=tone(30,.06 if half%2 else .10,'noise')
                add(buf,drum,t,.05 if half%2 else (.12 if half in [2,6] else .075))
        if name=='ending':
            n=round(2*beat*SR); buf[-n:]*=np.linspace(1,0,n)
        # Every voice releases to zero before the boundary; harmonic form resolves to restart.
        out.append(encode(name,buf,'bgm',name!='ending'))
    return out

if __name__=='__main__':
    result=sfx()+music()
    (ROOT/'audio_validation.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))
