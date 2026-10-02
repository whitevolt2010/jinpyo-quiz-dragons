#!/usr/bin/env python3
"""src/ 조각을 합쳐 index.html 을 만든다."""
import os, json
R = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(R, 'src')
rd = lambda f: open(os.path.join(S, f), encoding='utf-8').read() if os.path.exists(os.path.join(S, f)) else ''
clip = rd('clip.json') or '{}'
vocab = rd('ko_vocab.js') or 'const KO_VOCAB = [];'
js = '\n'.join(['window.CLIP = ' + clip.strip() + ';', rd('ko_old.js'), vocab, 'window.KO_VOCAB = KO_VOCAB;', rd('en_data.js'), rd('game.js')])
html = rd('head.html') + '<script>\n' + js + '\n</script>\n</body>\n</html>\n'
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(html)
print('index.html', len(html) // 1024, 'KB')
