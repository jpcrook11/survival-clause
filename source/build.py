#!/usr/bin/env python3
"""Rebuild ../index.html (the playable game) from the files in this folder.

Usage, from the repository root:
    python3 source/build.py

Needs only Python 3. The output is one self-contained HTML file: fonts, art,
music and code are all inlined, so it runs offline and on any static host.
"""
import base64, glob, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'index.html')

def read(*parts):
    with open(os.path.join(HERE, *parts), encoding='utf-8') as f:
        return f.read()

def b64(*parts):
    with open(os.path.join(HERE, *parts), 'rb') as f:
        return base64.b64encode(f.read()).decode('ascii')

FONTS = [
    ('Press Start 2P', 'press-start-2p-latin-400-normal.woff2'),
    ('VT323', 'vt323-latin-400-normal.woff2'),
    ('Silkscreen', 'silkscreen-latin-400-normal.woff2'),
]
font_css = ''
for family, file in FONTS:
    font_css += "@font-face{font-family:'%s';src:url(data:font/woff2;base64,%s) format('woff2');font-weight:400;font-style:normal;font-display:block;}\n" % (family, b64('fonts', file))

js_parts = []
for path in sorted(glob.glob(os.path.join(HERE, 'js', '*.js'))):
    with open(path, encoding='utf-8') as f:
        js_parts.append('/* ---- %s ---- */\n' % os.path.basename(path) + f.read())
js = '\n'.join(js_parts)
if '</script' in js:
    sys.exit('Build stopped: a JS file contains "</script", which would break the page.')

html = read('template.html')
html = html.replace('<!--HEAD-->', read('head.html').strip())
html = html.replace('/*FONTS*/', font_css)
html = html.replace('/*STYLE*/', read('style.css'))
html = html.replace('/*GLYPHS*/', 'const GLYPH_DATA = ' + read('glyphs.json') + ';')
html = html.replace('/*SCRIPTS*/', js)

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(html)
print('Built %s (%.1f KB)' % (OUT, os.path.getsize(OUT) / 1024))
