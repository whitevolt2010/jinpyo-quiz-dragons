"""Original slow BGM, additive sine synthesis. Never writes SFX or game code.

Run from the project root: .venv/bin/python assets/tools/build_bgm_v2.py
Only NumPy and ffmpeg/ffprobe are needed. All loop tails wrap before encoding.
"""
from pathlib import Path
import hashlib
import json
import subprocess
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 44100
TARGET = 10 ** (-6 / 20)
CONFIG = {
    'title': dict(bpm=80, key=60, lead='box', pad=.16, bass=.15,
                  chords=[0, 5, 3, 4], melody=[2, 4, 3, 2, 2, 1, 1, 0],
                  instruments='부드러운 오르골, 따뜻한 패드, 사인파 베이스'),
    'map': dict(bpm=78, key=60, lead='marimba', pad=.13, bass=.25,
                chords=[0, 3, 5, 4], melody=[0, 1, 2, 1, 3, 2, 1, 0],
                instruments='마림바, 부드러운 베이스, 옅은 패드'),
    'battle': dict(bpm=76, key=62, lead='piano', pad=.18, bass=.16,
                   chords=[0, 5, 3, 4], melody=[1, 2, 1, 3, 2, 1, 2, 0],
                   instruments='부드러운 전자피아노, 사인파 패드·베이스'),
    'boss': dict(bpm=72, key=55, lead='cello', pad=.27, bass=.22,
                 chords=[0, 3, 5, 4], melody=[0, 2, 1, 2, 2, 1, 1, 0],
                 instruments='느린 현악풍 패드, 낮은 첼로풍 선율, 부드러운 베이스'),
    'inn': dict(bpm=70, key=60, lead='piano', pad=.23, bass=.18,
                chords=[0, 5, 3, 4], melody=[2, 1, 0, 1, 2, 1, 1, 0],
                instruments='낮은 전자피아노, 포근한 패드, 사인파 베이스'),
    'ending': dict(bpm=88, key=60, lead='horn', pad=.21, bass=.20,
                   chords=[0, 3, 5, 4], melody=[0, 2, 3, 2, 2, 1, 1, 0],
                   instruments='둥근 호른풍 팡파르, 전자피아노, 따뜻한 패드'),
}
SCALE = [0, 2, 4, 5, 7, 9, 11]


def note(midi, seconds, kind):
    t = np.arange(round(seconds * SR)) / SR
    f = 440 * 2 ** ((midi - 69) / 12)
    # Rounded attacks; no square/saw oscillator, noise, or percussion.
    if kind == 'box':
        y = (np.sin(2*np.pi*f*t)*np.exp(-t/1.4)
             + .15*np.sin(2*np.pi*2*f*t)*np.exp(-t/.5)
             + .035*np.sin(2*np.pi*3*f*t)*np.exp(-t/.25))
        attack, release = .028, .5
    elif kind == 'marimba':
        y = np.sin(2*np.pi*f*t)*np.exp(-t/.95)
        y += .09*np.sin(2*np.pi*3*f*t)*np.exp(-t/.22)
        attack, release = .022, .4
    elif kind == 'piano':
        y = (np.sin(2*np.pi*f*t) + .13*np.sin(2*np.pi*2*f*t)
             + .035*np.sin(2*np.pi*3*f*t))*np.exp(-t/2.2)
        attack, release = .045, .6
    else:
        partials = {'pad': [1, .12, .045], 'bass': [1, .05],
                    'cello': [1, .20, .09, .03], 'horn': [1, .25, .09, .035]}[kind]
        y = sum(a*np.sin(2*np.pi*f*(h+1)*t) for h, a in enumerate(partials))
        attack, release = {'pad': (.85, 1.3), 'bass': (.15, .6),
                           'cello': (.4, .8), 'horn': (.18, .7)}[kind]
    env = np.sin(np.minimum(t/attack, 1)*np.pi/2)**2
    env *= np.sin(np.clip((seconds-t)/release, 0, 1)*np.pi/2)**2
    return y*env


def add(buf, wave, seconds, gain, loop):
    start = round(seconds*SR)
    if loop:
        start %= len(buf)
        first = min(len(wave), len(buf)-start)
        buf[start:start+first] += gain*wave[:first]
        if first < len(wave):
            buf[:len(wave)-first] += gain*wave[first:]
    else:
        count = min(len(wave), len(buf)-start)
        if count > 0:
            buf[start:start+count] += gain*wave[:count]


def compose(name, c):
    beat = 60/c['bpm']
    loop = name != 'ending'
    buf = np.zeros(round(96*beat*SR))
    events = []
    for bar in range(24):
        degree = c['chords'][(bar//2) % 4]
        if name == 'ending' and bar >= 22:
            degree = 0
        root = c['key']+SCALE[degree]
        third = 3 if degree == 5 else 4
        triad = [root, root+third, root+7]
        if bar % 2 == 0:
            # Close, low chord voicings; each harmony lasts two bars.
            voiced = [p-12 if p > c['key']+9 else p for p in triad]
            for p in voiced:
                add(buf, note(p, 8*beat+1.3, 'pad'), bar*4*beat, c['pad']/3, loop)
            add(buf, note(root-24, 8*beat+.6, 'bass'), bar*4*beat, c['bass'], loop)
        # Two unhurried notes per bar, with a breathing space every fourth bar.
        # Second and third eight-bar phrases vary the melody without speeding up.
        index = c['melody'][bar % 8]
        if bar//8 == 1:
            index = (index+1) % 5
        palette = sorted(set(triad + [c['key']+7, c['key']+12]))
        p = palette[index % len(palette)]
        if name == 'title':
            p += 12
        if name == 'boss':
            p -= 12
        if name == 'ending' and bar >= 22:
            p = c['key'] + (7 if bar == 22 else 0)
        starts = [0, 2] if bar % 4 != 3 else [0]
        if name in ('boss', 'inn') and bar % 2:
            starts = [0]
        for j, offset in enumerate(starts):
            pitch = p if j == 0 else palette[(index+1) % len(palette)] + (12 if name == 'title' else -12 if name == 'boss' else 0)
            if name == 'title' and pitch > 79:
                pitch -= 12
            length = (3 if len(starts) == 1 else 1.8)*beat+.7
            if name == 'ending' and bar == 23:
                length = 3.7*beat
            gain = .24 if name == 'title' else .23
            add(buf, note(pitch, length, c['lead']), (bar*4+offset)*beat, gain, loop)
            events.append(dict(beat=bar*4+offset, midi=pitch, duration_seconds=round(length, 4)))
        if name == 'ending' and bar % 2 == 0:
            for pitch in triad:
                add(buf, note(pitch, 3*beat, 'piano'), bar*4*beat, .035, False)
    # Quiet room reflections. Circular for loops, one-way for the ending.
    dry = buf.copy()
    for delay, level in [(.113, .10), (.227, .065), (.389, .035)]:
        n = round(delay*SR)
        if loop:
            buf += np.roll(dry, n)*level
        else:
            buf[n:] += dry[:-n]*level
    # Smooth eighth-order magnitude rolloff, -3 dB at 2.2 kHz.
    # Periodic FFT processing preserves the wrapped tails at the loop boundary.
    freqs = np.fft.rfftfreq(len(buf), 1/SR)
    response = 1/np.sqrt(1+(freqs/2200)**8)
    buf = np.fft.irfft(np.fft.rfft(buf)*response, n=len(buf))
    buf -= buf.mean()
    if loop:
        # Put the MP3 edge at a quiet, slowly moving point within 50 ms of
        # the bar line. This keeps encoder edge error small without a gap.
        radius = round(.05*SR)
        candidates = np.arange(-radius, radius)
        slope = buf[candidates] - buf[candidates-1]
        cost = np.abs(buf[candidates]) + 8*np.abs(slope)
        shift = int(candidates[np.argmin(cost)])
        buf = np.roll(buf, -shift)
        for event in events:
            event['render_start_seconds'] = round((event['beat']*beat-shift/SR) % (len(buf)/SR), 6)
    if not loop:
        n = round(4*beat*SR)
        buf[-n:] *= np.cos(np.linspace(0, np.pi/2, n))**2
        n = round(.1*SR)
        buf[:n] *= np.sin(np.linspace(0, np.pi/2, n))**2
    return buf, events


def decode(path):
    return np.frombuffer(subprocess.check_output([
        'ffmpeg', '-v', 'error', '-i', str(path), '-f', 'f32le', '-ac', '1', 'pipe:1']), dtype='<f4')


def db(value):
    return float(20*np.log10(max(float(value), 1e-15)))


def encode(path, buf):
    buf *= TARGET/np.max(np.abs(buf))
    for _ in range(8):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR),
                        '-ac', '1', '-i', 'pipe:0', '-c:a', 'libmp3lame', '-b:a', '128k',
                        '-write_xing', '1', str(path)], input=buf.astype('<f4').tobytes(), check=True)
        dec = decode(path)
        peak = np.max(np.abs(dec))
        if abs(db(peak)+6) < .025:
            return dec
        buf *= TARGET/peak
    raise RuntimeError(f'Peak normalization failed: {path}')


def validate(path, dec, source, c, events):
    loop = path.stem != 'ending'
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams',
                                               '-of', 'json', str(path)]))['streams'][0]
    rms = float(np.sqrt(np.mean(dec.astype(float)**2)))
    blocks = dec[:len(dec)//SR*SR].reshape(-1, SR).astype(float)
    rms_blocks = np.sqrt(np.mean(blocks**2, axis=1))
    spec = np.abs(np.fft.rfft(dec.astype(float)))**2
    freqs = np.fft.rfftfreq(len(dec), 1/SR)
    high_fraction = float(spec[freqs >= 2500].sum()/spec.sum())
    delta = float(abs(dec[0]-dec[-1]))
    half = round(.05*SR)
    seam = np.concatenate([dec[-half:], dec[:half]])
    seam_ratio = float(np.sqrt(np.mean(seam.astype(float)**2))/rms)
    row = dict(path='bgm/'+path.name, bpm=c['bpm'], instruments=c['instruments'],
               key_midi=c['key'], meter='4/4', bars=24, duration_seconds=round(len(dec)/SR, 6),
               sample_rate=int(probe['sample_rate']), channels=int(probe['channels']),
               codec=probe['codec_name'], bitrate=int(probe['bit_rate']),
               peak_dbfs=round(db(np.max(np.abs(dec))), 3), rms_dbfs=round(db(rms), 3),
               one_second_rms_range_db=round(db(max(rms_blocks))-db(min(rms_blocks)), 3),
               high_band_energy_percent=round(high_fraction*100, 6),
               loop=loop, decoded_samples=len(dec), loop_boundary_delta=delta if loop else None,
               loop_boundary_dbfs=round(db(delta), 3) if loop else None,
               seam_rms_to_track_rms=round(seam_ratio, 4) if loop else None,
               source_loop_boundary_delta=float(abs(source[0]-source[-1])) if loop else None,
               final_sample_dbfs=round(db(abs(dec[-1])), 3),
               melody_midi_range=[min(e['midi'] for e in events), max(e['midi'] for e in events)],
               bytes=path.stat().st_size, sha256=hashlib.sha256(path.read_bytes()).hexdigest())
    assert len(dec) == len(source), row
    assert row['sample_rate'] == SR and row['codec'] == 'mp3', row
    assert 60 <= row['duration_seconds'] <= 90 and abs(row['peak_dbfs']+6) < .1, row
    assert np.isfinite(dec).all() and np.max(np.abs(dec)) < 1, row
    assert high_fraction < .01, row
    if loop:
        assert delta < .005 and seam_ratio > .15, row
        assert row['one_second_rms_range_db'] < 9, row
    else:
        assert row['final_sample_dbfs'] < -75, row
    return row


def main():
    qa = ROOT/'qa/bgm_v2'
    qa.mkdir(parents=True, exist_ok=True)
    rows = []
    for name, c in CONFIG.items():
        source, events = compose(name, c)
        path = ROOT/'bgm'/f'{name}.mp3'
        dec = encode(path, source)
        row = validate(path, dec, source, c, events)
        rows.append(row)
        (qa/f'{name}_score.json').write_text(json.dumps(dict(config=c, melody=events), ensure_ascii=False, indent=2)+'\n')
        # Last 3 s followed by first 3 s, twice: a reproducible seam audition file.
        if row['loop']:
            clip = np.tile(np.concatenate([dec[-3*SR:], dec[:3*SR]]), 2)
        else:
            clip = dec[-12*SR:]
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR),
                        '-ac', '1', '-i', 'pipe:0', '-c:a', 'pcm_s16le', str(qa/f'{name}_boundary.wav')],
                       input=clip.astype('<f4').tobytes(), check=True)
        print(json.dumps(row, ensure_ascii=False), flush=True)
    (ROOT/'bgm_validation_v2.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2)+'\n')
    # Preserve the original SFX validation records, update only BGM metadata.
    old = json.loads((ROOT/'audio_validation.json').read_text())
    (ROOT/'audio_validation.json').write_text(json.dumps([r for r in old if not r['path'].startswith('bgm/')]+rows, ensure_ascii=False, indent=2)+'\n')
    protected = json.loads((qa/'protected_before.json').read_text())
    changed = [p for p, digest in protected.items() if hashlib.sha256((ROOT.parent/p).read_bytes()).hexdigest() != digest]
    assert not changed, changed
    (qa/'protected_check.json').write_text(json.dumps(dict(checked_files=len(protected), changed_files=changed), indent=2)+'\n')


if __name__ == '__main__':
    main()
