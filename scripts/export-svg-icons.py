"""One-time export of the existing icon outlines; requires fonttools and brotli.

The SVG assets and manifest are versioned, so normal builds require no Python.
"""
import json
import re
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

fonts = {
    ('Font Awesome 5 Free', '900'): '506695ac034d749a.woff2',
    ('Font Awesome 5 Free', '400'): '284a4cbb1f8e5c1f.woff2',
    ('Font Awesome 5 Brands', '400'): '94290ff772f0e0e9.woff2',
    ('eicons', '400'): '42ecc73572f7be7c.woff2',
}
output = Path('public/assets/icons')
output.mkdir(exist_ok=True)
loaded = {key: TTFont('public/assets/' + filename) for key, filename in fonts.items()}
manifest = {}
for css in Path('design-source/pages').glob('*.css'):
    for selector, rule in re.findall(r'(\.v\d+::(?:before|after))\{([^}]+)\}', css.read_text(encoding='utf-8')):
        content = re.search(r'content:"([^"]+)"', rule)
        if not content or not any(ord(c) >= 0xE000 for c in content[1]):
            continue
        family = re.search(r'font-family:([^;]+)', rule)[1].strip('"')
        weight = re.search(r'font-weight:(\d+)', rule)[1]
        key = f'{family}|{weight}|{ord(content[1][0]):x}'
        if key in manifest:
            continue
        font = loaded[(family, weight)]
        glyph_name = font.getBestCmap()[ord(content[1][0])]
        glyphs = font.getGlyphSet()
        pen = SVGPathPen(glyphs)
        glyphs[glyph_name].draw(pen)
        units = font['head'].unitsPerEm
        advance = font['hmtx'][glyph_name][0]
        ascent = font['hhea'].ascent
        filename = f'{fonts[(family, weight)].split(".")[0]}-{ord(content[1][0]):x}.svg'
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {advance} {units}"><path transform="translate(0 {ascent}) scale(1 -1)" d="{pen.getCommands()}"/></svg>'
        (output / filename).write_text(svg, encoding='utf-8')
        manifest[key] = {'src': '/assets/icons/' + filename, 'widthEm': advance / units}

notices = []
for key, font in loaded.items():
    notices.append(' / '.join(key))
    for name_id in (0, 13, 14):
        entries = {record.toUnicode() for record in font['name'].names if record.nameID == name_id}
        notices.extend(sorted(entries))
(output / 'LICENSE-NOTICES.txt').write_text('\n\n'.join(notices), encoding='utf-8')
Path('src/lib/icon-assets.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(f'Exported {len(manifest)} matching SVG icons.')
