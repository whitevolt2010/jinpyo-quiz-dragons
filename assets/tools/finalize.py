"""Validate required inventory and write a machine-readable manifest."""
from pathlib import Path
import hashlib, json
from PIL import Image
from build_audio import SFX, CONFIG

ROOT=Path(__file__).resolve().parents[1]
specs=json.loads((ROOT/'generation_prompts.json').read_text())
images=json.loads((ROOT/'image_validation.json').read_text())
audio=json.loads((ROOT/'audio_validation.json').read_text())
expected={'img/'+s['name']+'.webp' for s in specs}|{'sfx/'+s+'.mp3' for s in SFX}|{'bgm/'+s+'.mp3' for s in CONFIG}
actual={r['path'] for r in images+audio}
assert expected==actual,sorted(expected-actual)
for row in images+audio:
    path=ROOT/row['path']
    assert path.exists()
    row['bytes']=path.stat().st_size
    row['sha256']=hashlib.sha256(path.read_bytes()).hexdigest()
    if 'duration_seconds' in row:
        assert abs(row['peak_dbfs']+3)<.15,(row['path'],row['peak_dbfs'])
        if row['path'].startswith('bgm/'):
            assert 40<=row['duration_seconds']<=70
            if row['loop']: assert row['loop_boundary_delta']<.01
total=sum(r['bytes'] for r in images+audio)
manifest={'schema_version':1,'path_base':'assets/','image_count':len(images),'sfx_count':len(SFX),'bgm_count':len(CONFIG),'total_media_bytes':total,'budget_bytes':15000000,'within_media_budget':total<=15000000,'images':images,'audio':audio,'contact_sheet':{'path':'contact_sheet.png','bytes':(ROOT/'contact_sheet.png').stat().st_size},'notes':['Images: built-in image generation, Pillow WebP quality 85.','Audio: original procedural synthesis, 44.1 kHz mono MP3 128 kbps.','Loop points are decoded sample 0 through decoded_samples, end exclusive. MP3 gapless metadata must be honored.','gem_off uses the exact geometry of generated gem_on, recolored gray.']}
manifest['contact_sheet']['width'],manifest['contact_sheet']['height']=Image.open(ROOT/'contact_sheet.png').size
manifest['media_and_contact_sheet_bytes']=total+manifest['contact_sheet']['bytes']
assert manifest['media_and_contact_sheet_bytes']<=15000000,total
(ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'images':len(images),'sfx':len(SFX),'bgm':len(CONFIG),'media_bytes':total,'contact_sheet_bytes':manifest['contact_sheet']['bytes']},indent=2))
