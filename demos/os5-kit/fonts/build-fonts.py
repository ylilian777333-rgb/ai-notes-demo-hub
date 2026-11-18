#!/usr/bin/env python3
"""Build OS5Sans webfont subsets from locally installed MiSans (Xiaomi, free commercial license).

Collects every character used by the OS5 scene demo pages and kit, then writes
os5sans-{400,500,600,650,700}.woff2 next to this script. Re-run after editing copy:
    python3 demos/os5-kit/fonts/build-fonts.py
"""
import glob
import os

from fontTools import subset
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
DEMOS = os.path.dirname(os.path.dirname(HERE))
SRC_DIRS = [os.path.expanduser('~/Library/Fonts'), '/Library/Fonts']
WEIGHTS = {400: 'MiSans-Regular.ttf', 500: 'MiSans-Medium.ttf', 600: 'MiSans-Demibold.ttf',
           650: 'MiSans-Semibold.ttf', 700: 'MiSans-Bold.ttf'}
PAGES = ['os5-ai-apps-negative-screen', 'os5-today-ai-app', 'os5-commute-ai-app', 'os5-clinic-ai-app',
         'os5-dining-ai-app', 'os5-anniversary-ai-app', 'os5-medication-ai-app', 'os5-course-ai-app-figma',
         'os5-travel-ai-app-figma', 'os5-hometown-ai-app', 'os5-scene-ai-apk']


def find(name):
    for d in SRC_DIRS:
        p = os.path.join(d, name)
        if os.path.exists(p):
            return p
    raise SystemExit('missing font ' + name)


def charset():
    chars = set(chr(c) for c in range(0x20, 0x7f))
    chars.update('，。、；：？！“”‘’（）《》【】…—·～￥¥℃°±×÷→←↑↓⇄丨｜「」『』')
    files = [os.path.join(DEMOS, 'os5-kit', f) for f in ('scenes.js', 'cards.js', 'landing.js', 'interaction.js')]
    files += [os.path.join(DEMOS, p, 'index.html') for p in PAGES]
    for f in files:
        if os.path.exists(f):
            chars.update(open(f, encoding='utf-8').read())
    return ''.join(sorted(c for c in chars if ord(c) >= 0x20 and not (0xd800 <= ord(c) <= 0xdfff)))


def main():
    text = charset()
    print('characters:', len(text))
    for w, fn in WEIGHTS.items():
        src = find(fn)
        opts = subset.Options()
        opts.flavor = 'woff2'
        opts.layout_features = ['kern', 'liga', 'tnum', 'pnum']
        opts.name_IDs = ['*']
        opts.notdef_outline = True
        opts.hinting = False
        font = TTFont(src)
        sub = subset.Subsetter(opts)
        sub.populate(text=text)
        sub.subset(font)
        out = os.path.join(HERE, 'os5sans-%d.woff2' % w)
        font.flavor = 'woff2'
        font.save(out)
        print(out, os.path.getsize(out))


if __name__ == '__main__':
    main()
