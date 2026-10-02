"""Independent final MP3 decode, loudness/true-peak, and preservation audit."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT/'qa/bgm_v2'


def main():
    rows = json.loads((ROOT/'bgm_validation_v2.json').read_text())
    checked = []
    for row in rows:
        path = ROOT/row['path']
        assert hashlib.sha256(path.read_bytes()).hexdigest() == row['sha256']
        result = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(path),
                                 '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                                capture_output=True, text=True, check=True)
        summary = result.stderr.split('Summary:')[-1]
        (QA/f'{path.stem}_loudness.txt').write_text(summary)
        integrated = float(re.search(r'I:\s*([-\d.]+) LUFS', summary)[1])
        lra = float(re.search(r'LRA:\s*([-\d.]+) LU', summary)[1])
        true_peak = float(re.search(r'Peak:\s*([-\d.]+) dBFS', summary)[1])
        assert true_peak <= -5.8
        assert lra <= 5, (path, lra)
        pcm = np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(path),
                            '-f', 'f32le', '-ac', '1', 'pipe:1']), dtype='<f4')
        assert len(pcm) == row['decoded_samples'] and np.isfinite(pcm).all()
        # A loop's 10 ms blocks should not contain accidental silent gaps.
        blocks = pcm[:len(pcm)//441*441].reshape(-1, 441).astype(float)
        levels = np.sqrt(np.mean(blocks**2, axis=1))
        silent_blocks = int(np.count_nonzero(levels < 10**(-60/20)))
        if row['loop']:
            assert silent_blocks == 0
        checked.append(dict(path=row['path'], integrated_lufs=integrated, loudness_range_lu=lra,
                            true_peak_dbfs=true_peak, silent_10ms_blocks_below_minus60dbfs=silent_blocks,
                            sha256_matches=True, decode_ok=True))
    protected = json.loads((QA/'protected_before.json').read_text())
    changed = [p for p, h in protected.items() if hashlib.sha256((ROOT.parent/p).read_bytes()).hexdigest() != h]
    assert not changed, changed
    result = dict(tracks=checked, protected_files_checked=len(protected), protected_files_changed=changed,
                  subjective_listening_performed=False, browser_playback_tested=False)
    (QA/'independent_check.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
