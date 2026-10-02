"""Chroma key, pixel-preserving sizing, WebP export and verification."""
from pathlib import Path
import json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path('/private/tmp/jinpyo-assets-source')
SPECS=json.loads((ROOT/'generation_prompts.json').read_text())
SOURCES={s['name']:s.get('path') for s in json.loads((ROOT/'generation_sources.json').read_text())}

def key(im):
    # If generation supplied actual alpha, first use the requested solid key backing.
    backing=Image.new('RGBA',im.size,(255,0,255,255)); backing.alpha_composite(im.convert('RGBA'))
    a=np.array(backing).astype(np.float32); r,g,b=a[:,:,:3].transpose(2,0,1)
    distance=np.sqrt((255-r)**2+g*g+(255-b)**2)
    mask=(distance<115)|((r>140)&(b>140)&(g<90)&(np.minimum(r,b)-g>110))
    a[:,:,3]=np.where(mask,0,255)
    # Clean chroma contamination only in a two-pixel band beside transparency.
    near=np.array(Image.fromarray((mask*255).astype('uint8')).filter(ImageFilter.MaxFilter(5)))>0
    spill=near&~mask&(np.minimum(r,b)>g+25)
    a[spill,0]=np.minimum(a[spill,0],a[spill,1]+22)
    a[spill,2]=np.minimum(a[spill,2],a[spill,1]+22)
    a[mask,:3]=0
    return Image.fromarray(np.uint8(np.clip(a,0,255)))

def build():
    results=[]
    for spec in SPECS:
        src=SOURCE/(spec['name']+'.png'); dst=ROOT/'img'/(spec['name']+'.webp')
        if not src.exists() and SOURCES.get(spec['name']): src=Path(SOURCES[spec['name']])
        if not src.exists(): continue
        im=Image.open(src).convert('RGBA')
        if spec['kind']=='sprite':
            im=key(im); box=im.getbbox()
            if not box: raise ValueError(src)
            im=im.crop(box); size=spec['size']; span=round(size*.84)
            im.thumbnail((span,span),Image.Resampling.NEAREST)
            canvas=Image.new('RGBA',(size,size)); canvas.alpha_composite(im,((size-im.width)//2,round(size*.92)-im.height))
            im=canvas
        else: im=im.convert('RGB').resize(tuple(spec['size']),Image.Resampling.NEAREST)
        im.save(dst,'WEBP',quality=85,method=6,exact=True)
    # Matching gem states share the identical facet geometry and alpha silhouette.
    on=ROOT/'img/gem_on.webp'; off=ROOT/'img/gem_off.webp'
    if on.exists() and off.exists():
        im=Image.open(on).convert('RGBA'); gray=im.convert('L')
        arr=np.array(gray); gray=Image.fromarray((arr.astype(float)*.62+35).astype('uint8'))
        matched=Image.merge('RGBA',(gray,gray,gray,im.getchannel('A')))
        matched.save(off,'WEBP',quality=85,method=6,exact=True)
    for spec in SPECS:
        path=ROOT/'img'/(spec['name']+'.webp')
        if not path.exists(): continue
        im=Image.open(path).convert('RGBA'); a=np.array(im)
        corners=[int(a[y,x,3]) for x,y in [(0,0),(im.width-1,0),(0,im.height-1),(im.width-1,im.height-1)]]
        row={'path':str(path.relative_to(ROOT)),'width':im.width,'height':im.height,'bytes':path.stat().st_size,'transparent':spec['kind']=='sprite','corner_alpha':corners}
        if spec['kind']=='sprite':
            assert corners==[0,0,0,0],path
            assert 0<np.count_nonzero(a[:,:,3])<im.width*im.height*.85,path
            row['alpha_bbox']=im.getbbox()
            row['key_color_pixels']=int(np.count_nonzero((a[:,:,0]>190)&(a[:,:,1]<70)&(a[:,:,2]>190)&(a[:,:,3]>0)))
            assert row['key_color_pixels']==0,path
        else: assert a[:,:,3].min()==255,path
        assert im.size==(tuple(spec['size']) if isinstance(spec['size'],list) else (spec['size'],spec['size'])),path
        results.append(row)
    (ROOT/'image_validation.json').write_text(json.dumps(results,indent=2)+'\n')
    cols=6; cw=224; ch=180; rows=math.ceil(len(results)/cols)
    sheet=Image.new('RGB',(cols*cw,rows*ch),(27,34,49)); draw=ImageDraw.Draw(sheet)
    for i,row in enumerate(results):
        x=(i%cols)*cw; y=(i//cols)*ch
        draw.rounded_rectangle((x+4,y+4,x+cw-4,y+ch-4),radius=7,fill=(63,78,96))
        im=Image.open(ROOT/row['path']).convert('RGBA'); im.thumbnail((cw-20,ch-30),Image.Resampling.NEAREST)
        sheet.paste(im,(x+(cw-im.width)//2,y+8+(ch-30-im.height)//2),im)
        draw.text((x+9,y+ch-20),Path(row['path']).stem,fill='white')
    sheet.save(ROOT/'contact_sheet.png',optimize=True)
    print(f'{len(results)}/54 images exported and verified')

if __name__=='__main__': build()
