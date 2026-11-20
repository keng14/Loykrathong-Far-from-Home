/* =====================================================================
 * krathong-art.js — hand-tuned 2D vector art for World Loy Krathong
 *   ktKrathongSVG(config, opts)  full krathong (3/4 view, layered petals)
 *   ktBaseSwatch / ktFlowerSwatch / ktToppingSwatch   studio option icons
 * All shapes are plain SVG (gradients, no filters) so 30+ can float at once.
 * ===================================================================== */
'use strict';

const KT_PALETTES = {
    banana:  { shape: 'leaf',    light: '#4ade80', dark: '#15803d', edge: '#bbf7d0', fold: '#f0fdf4', bodyTop: '#16a34a', bodyBot: '#14532d', band: '#facc15', cushion: '#14532d', cushionEdge: '#22c55e', pattern: 'stripes', patternColor: '#bbf7d0' },
    bread:   { shape: 'round',   light: '#fcd34d', dark: '#b45309', edge: '#fef3c7', fold: '#fffbeb', bodyTop: '#d97706', bodyBot: '#78350f', band: '#fef08a', cushion: '#92400e', cushionEdge: '#f59e0b', pattern: 'speckle', patternColor: '#fef3c7' },
    lotus:   { shape: 'lotus',   light: '#fbcfe8', dark: '#db2777', edge: '#fdf2f8', fold: '#ffffff', bodyTop: '#ec4899', bodyBot: '#831843', band: '#fde68a', cushion: '#831843', cushionEdge: '#f472b6', pattern: 'arches',  patternColor: '#fce7f3' },
    coconut: { shape: 'slim',    light: '#d9f99d', dark: '#65a30d', edge: '#f7fee7', fold: '#ffffff', bodyTop: '#92400e', bodyBot: '#3b1a08', band: '#fbbf24', cushion: '#3f6212', cushionEdge: '#a3e635', pattern: 'fiber',   patternColor: '#e7c08a' },
    ice:     { shape: 'crystal', light: '#f0f9ff', dark: '#38bdf8', edge: '#ffffff', fold: '#ffffff', bodyTop: '#7dd3fc', bodyBot: '#0369a1', band: '#e0f2fe', cushion: '#075985', cushionEdge: '#7dd3fc', pattern: 'facets',  patternColor: '#ffffff', alpha: 0.9 }
};

const KT_FLOWER_COLORS = {
    marigold: ['#ea580c', '#f59e0b', '#fbbf24', '#fde047'],
    lotus:    ['#db2777', '#f472b6', '#fbcfe8', '#fde047'],
    orchid:   ['#7e22ce', '#a855f7', '#e9d5ff', '#fde047'],
    rose:     ['#7f1d1d', '#b91c1c', '#ef4444', '#fecaca'],
    jasmine:  ['#cbd5e1', '#f8fafc', '#ffffff', '#facc15']
};

let ktUid = 0;
const f1 = n => Math.round(n * 10) / 10;
const TAU = Math.PI * 2;

function ktShade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    const ch = v => Math.round((t - v) * p + v);
    const r = ch(n >> 16), g = ch((n >> 8) & 255), b = ch(n & 255);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* ---------- shared gradients ---------- */
function ktDefs(u, P) {
    return `<defs>
        <linearGradient id="${u}body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.bodyTop}"/><stop offset="1" stop-color="${P.bodyBot}"/></linearGradient>
        <linearGradient id="${u}shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".28" stop-color="#000" stop-opacity="0"/>
            <stop offset=".62" stop-color="#fff" stop-opacity=".16"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/>
        </linearGradient>
        <radialGradient id="${u}cush" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="${ktShade(P.cushion, -0.35)}"/><stop offset=".72" stop-color="${P.cushion}"/><stop offset="1" stop-color="${P.cushionEdge}"/></radialGradient>
        <radialGradient id="${u}water" cx=".5" cy=".4" r=".55"><stop offset="0" stop-color="#fde68a" stop-opacity=".42"/><stop offset=".45" stop-color="${P.bodyTop}" stop-opacity=".16"/><stop offset="1" stop-color="#0ea5e9" stop-opacity="0"/></radialGradient>
        <linearGradient id="${u}cand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f59e0b"/><stop offset=".3" stop-color="#fffbeb"/><stop offset=".55" stop-color="#fef3c7"/><stop offset="1" stop-color="#d97706"/></linearGradient>
        <radialGradient id="${u}glow"><stop offset="0" stop-color="#fef3c7" stop-opacity=".9"/><stop offset=".3" stop-color="#fbbf24" stop-opacity=".38"/><stop offset="1" stop-color="#f59e0b" stop-opacity="0"/></radialGradient>
        <radialGradient id="${u}flameO" cx=".5" cy=".78" r=".75"><stop offset="0" stop-color="#fffbeb"/><stop offset=".35" stop-color="#fde047"/><stop offset=".75" stop-color="#fb923c"/><stop offset="1" stop-color="#ea580c" stop-opacity=".85"/></radialGradient>
        <linearGradient id="${u}flameI" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fef9c3"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
        <radialGradient id="${u}ember"><stop offset="0" stop-color="#fff7ed"/><stop offset=".35" stop-color="#fb923c"/><stop offset="1" stop-color="#ea580c" stop-opacity="0"/></radialGradient>
        <linearGradient id="${u}gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fef9c3"/><stop offset=".45" stop-color="#facc15"/><stop offset="1" stop-color="#a16207"/></linearGradient>
        <radialGradient id="${u}heart" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#fda4af"/><stop offset=".45" stop-color="#f43f5e"/><stop offset="1" stop-color="#9f1239"/></radialGradient>
        <radialGradient id="${u}cat" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e8f0"/></radialGradient>
        <linearGradient id="${u}lotusP" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${P.dark}"/><stop offset=".7" stop-color="${P.light}"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
        <linearGradient id="${u}ele" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f5f9"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>
        <linearGradient id="${u}paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbeb"/><stop offset=".6" stop-color="#fef3c7"/><stop offset="1" stop-color="#e7c773"/></linearGradient>
        <linearGradient id="${u}leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4ade80"/><stop offset="1" stop-color="#15803d"/></linearGradient>
        <clipPath id="${u}clip"><path d="${KT_BODY_PATH}"/></clipPath>
    </defs>`;
}

const KT_BODY_PATH = 'M 42 120 A 58 18 0 0 1 158 120 C 158 138 134 152 100 152 C 66 152 42 138 42 120 Z';

/* ---------- petals ---------- */
function ktPetalGeom(shape, W, H) {
    if (shape === 'round') {
        const L = `M ${-W} 0 C ${-W} ${-H * .72} ${-W * .62} ${-H} 0 ${-H} L 0 0 Z`;
        const R = `M 0 ${-H} C ${W * .62} ${-H} ${W} ${-H * .72} ${W} 0 L 0 0 Z`;
        return { L, R, full: `M ${-W} 0 C ${-W} ${-H * .72} ${-W * .62} ${-H} 0 ${-H} C ${W * .62} ${-H} ${W} ${-H * .72} ${W} 0`, fold: `M 0 -1 L 0 ${-H * .8}` };
    }
    if (shape === 'crystal') {
        const L = `M ${-W} 0 L ${-W * .82} ${-H * .55} L 0 ${-H} L 0 0 Z`;
        const R = `M 0 ${-H} L ${W * .82} ${-H * .55} L ${W} 0 L 0 0 Z`;
        return { L, R, full: `M ${-W} 0 L ${-W * .82} ${-H * .55} L 0 ${-H} L ${W * .82} ${-H * .55} L ${W} 0`, fold: `M ${-W * .82} ${-H * .55} L 0 ${-H * .35} L ${W * .82} ${-H * .55}` };
    }
    if (shape === 'lotus') {
        W *= 1.3;
        const L = `M ${-W} 0 C ${-W * 1.1} ${-H * .5} ${-W * .4} ${-H * .85} 0 ${-H} L 0 0 Z`;
        const R = `M 0 ${-H} C ${W * .4} ${-H * .85} ${W * 1.1} ${-H * .5} ${W} 0 L 0 0 Z`;
        return { L, R, full: `M ${-W} 0 C ${-W * 1.1} ${-H * .5} ${-W * .4} ${-H * .85} 0 ${-H} C ${W * .4} ${-H * .85} ${W * 1.1} ${-H * .5} ${W} 0`, fold: `M 0 -1 Q ${W * .12} ${-H * .5} 0 ${-H * .9}`, lotus: true, W };
    }
    if (shape === 'slim') { W *= 0.72; H *= 1.14; }
    const L = `M ${-W} 0 C ${-W} ${-H * .45} ${-W * .35} ${-H * .8} 0 ${-H} L 0 0 Z`;
    const R = `M 0 ${-H} C ${W * .35} ${-H * .8} ${W} ${-H * .45} ${W} 0 L 0 0 Z`;
    return { L, R, full: `M ${-W} 0 C ${-W} ${-H * .45} ${-W * .35} ${-H * .8} 0 ${-H} C ${W * .35} ${-H * .8} ${W} ${-H * .45} ${W} 0`, fold: `M 0 -1 L 0 ${-H * .9}` };
}

function ktPetal(u, P, x, y, rot, sx, sy, W, H, back) {
    const g = ktPetalGeom(P.shape, W, H);
    const lightC = back ? ktShade(P.light, -0.28) : P.light;
    const darkC = back ? ktShade(P.dark, -0.32) : P.dark;
    const op = P.alpha ? ` opacity="${P.alpha}"` : '';
    let inner;
    if (g.lotus) {
        inner = `<path d="${g.L}" fill="url(#${u}lotusP)"/><path d="${g.R}" fill="url(#${u}lotusP)"/>
            <path d="${g.L}" fill="#831843" opacity="${back ? .35 : .18}"/>
            <path d="${g.full}" fill="none" stroke="${P.edge}" stroke-width=".7" opacity=".9"/>
            <path d="${g.fold}" fill="none" stroke="${P.fold}" stroke-width=".6" opacity=".6"/>`;
    } else {
        inner = `<path d="${g.L}" fill="${darkC}"/><path d="${g.R}" fill="${lightC}"/>
            <path d="${g.full}" fill="none" stroke="${P.edge}" stroke-width=".7" opacity=".85"/>
            <path d="${g.fold}" fill="none" stroke="${P.fold}" stroke-width=".6" opacity="${P.shape === 'crystal' ? .7 : .45}"/>`;
    }
    return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${f1(sx * 100) / 100} ${f1(sy * 100) / 100})"${op}>${inner}</g>`;
}

// One ring of standing petals around an ellipse; returns {back, front} so contents can sit between.
function ktPetalRing(u, P, n, cx, cy, rx, ry, W, H, offset, pins) {
    const back = [], front = [];
    for (let i = 0; i < n; i++) {
        const a = offset + (i / n) * TAU;
        const s = Math.sin(a), c = Math.cos(a);
        const x = cx + rx * c, y = cy + ry * s;
        const rot = c * 42;
        const sy = s > 0 ? 1 - 0.55 * s : 1 + 0.06 * -s;
        const sx = 0.62 + 0.38 * Math.abs(s);
        let html = ktPetal(u, P, x, y, rot, sx, sy, W, H, s < 0);
        if (pins && s > 0.15) html += `<circle cx="${f1(x)}" cy="${f1(y - 2.4)}" r="1.25" fill="#fef9c3" stroke="#a16207" stroke-width=".4"/>`;
        (s < 0 ? back : front).push({ y, html });
    }
    const join = arr => arr.sort((p, q) => p.y - q.y).map(p => p.html).join('');
    return { back: join(back), front: join(front) };
}

/* ---------- body texture ---------- */
function ktBodyPattern(u, P) {
    const c = P.patternColor;
    let out = '';
    if (P.pattern === 'stripes') {
        for (let i = 0; i <= 12; i++) {
            const x = 44 + i * 9.4;
            out += `<path d="M ${f1(x)} 112 Q ${f1(x + (x - 100) * 0.06)} 136 ${f1(100 + (x - 100) * 0.8)} 153" stroke="${c}" stroke-width="${i % 2 ? .7 : 1.2}" opacity="${i % 2 ? .18 : .3}" fill="none"/>`;
        }
    } else if (P.pattern === 'speckle') {
        for (let i = 0; i < 34; i++) {
            const x = 48 + ((i * 37) % 104), y = 123 + ((i * 17) % 26);
            out += `<ellipse cx="${x}" cy="${y}" rx="${f1(.7 + (i % 3) * .3)}" ry=".55" fill="${c}" opacity=".6" transform="rotate(${(i * 47) % 180} ${x} ${y})"/>`;
        }
        out += `<path d="M 50 128 Q 100 146 150 128" stroke="#fef3c7" stroke-width="2.5" opacity=".18" fill="none"/>`;
    } else if (P.pattern === 'arches') {
        for (let i = 0; i < 7; i++) {
            const x0 = 37 + i * 18;
            out += `<path d="M ${x0} 156 Q ${x0 + 9} 112 ${x0 + 18} 156" fill="${ktShade(P.bodyTop, .18)}" opacity=".45" stroke="${c}" stroke-width=".7"/>`;
        }
    } else if (P.pattern === 'fiber') {
        for (let i = 0; i < 46; i++) {
            const x = 44 + ((i * 29) % 112), y = 121 + ((i * 11) % 30), len = 3 + (i % 4);
            out += `<path d="M ${x} ${y} l ${f1(len * .85)} ${f1(-len * .5)}" stroke="${c}" stroke-width=".6" opacity=".38"/>`;
        }
        out += `<ellipse cx="100" cy="121" rx="58" ry="4" fill="#fef3c7" opacity=".12"/>`;
    } else if (P.pattern === 'facets') {
        out += `<path d="M 52 124 L 70 146 M 84 126 L 92 151 M 118 124 L 130 149 M 140 122 L 152 136" stroke="#fff" stroke-width=".8" opacity=".55"/>
                <path d="M 60 128 L 76 132 L 70 146 Z M 122 128 L 136 133 L 128 147 Z" fill="#fff" opacity=".18"/>
                <path d="M 112 134 l 1.4 3.4 l 3.4 1.4 l -3.4 1.4 l -1.4 3.4 l -1.4 -3.4 l -3.4 -1.4 l 3.4 -1.4 Z" fill="#fff" opacity=".85"/>`;
    }
    return `<g clip-path="url(#${u}clip)">${out}</g>`;
}

/* ---------- flowers (flat fills: reusable for swatches) ---------- */
function ktScallop(R, n, d, ry = 1) {
    let p = `M ${f1(R)} 0`;
    for (let k = 0; k < n; k++) {
        const a1 = ((k + 0.5) / n) * TAU, a2 = ((k + 1) / n) * TAU, cr = R * (1 + 2 * d);
        p += ` Q ${f1(Math.cos(a1) * cr)} ${f1(Math.sin(a1) * cr * ry)} ${f1(Math.cos(a2) * R)} ${f1(Math.sin(a2) * R * ry)}`;
    }
    return p + ' Z';
}

function ktFlower(type, r) {
    const C = KT_FLOWER_COLORS[type] || KT_FLOWER_COLORS.marigold;
    const shadow = `<ellipse cx="0" cy="${f1(r * .45)}" rx="${f1(r * 1.02)}" ry="${f1(r * .42)}" fill="#020617" opacity=".28"/>`;
    let g = '';
    if (type === 'lotus') {
        for (let k = 0; k < 8; k++) g += `<path d="M 0 0 C ${f1(r * .4)} ${f1(-r * .3)} ${f1(r * .32)} ${f1(-r * .82)} 0 ${f1(-r * 1.05)} C ${f1(-r * .32)} ${f1(-r * .82)} ${f1(-r * .4)} ${f1(-r * .3)} 0 0 Z" fill="${C[1]}" stroke="${C[2]}" stroke-width=".5" transform="rotate(${k * 45 + 22.5})"/>`;
        for (let k = 0; k < 6; k++) g += `<path d="M 0 0 C ${f1(r * .3)} ${f1(-r * .25)} ${f1(r * .24)} ${f1(-r * .6)} 0 ${f1(-r * .74)} C ${f1(-r * .24)} ${f1(-r * .6)} ${f1(-r * .3)} ${f1(-r * .25)} 0 0 Z" fill="${C[2]}" stroke="#fff" stroke-width=".4" transform="rotate(${k * 60})"/>`;
        g += `<circle r="${f1(r * .24)}" fill="${C[3]}"/><circle r="${f1(r * .12)}" fill="#ca8a04" opacity=".6"/>`;
    } else if (type === 'orchid') {
        [[-90, 1], [-18, .95], [54, .9], [126, .9], [198, .95]].forEach(([a, s]) => {
            g += `<ellipse cx="0" cy="${f1(-r * .5 * s)}" rx="${f1(r * .34)}" ry="${f1(r * .55 * s)}" fill="${C[1]}" stroke="${C[2]}" stroke-width=".6" transform="rotate(${a + 90})"/>`;
            g += `<path d="M 0 ${f1(-r * .15)} L 0 ${f1(-r * .8 * s)}" stroke="${C[2]}" stroke-width=".5" opacity=".7" transform="rotate(${a + 90})"/>`;
        });
        g += `<path d="M ${f1(-r * .32)} ${f1(r * .05)} Q 0 ${f1(r * .7)} ${f1(r * .32)} ${f1(r * .05)} Q 0 ${f1(r * .22)} ${f1(-r * .32)} ${f1(r * .05)} Z" fill="${C[0]}"/>`;
        g += `<circle r="${f1(r * .17)}" fill="${C[3]}"/>`;
    } else if (type === 'rose') {
        g += `<path d="${ktScallop(r, 5, .1)}" fill="${C[1]}" stroke="${C[0]}" stroke-width=".5"/>`;
        g += `<circle r="${f1(r * .7)}" fill="${C[2]}" opacity=".55"/>`;
        g += `<circle r="${f1(r * .62)}" fill="${C[1]}"/>`;
        g += `<path d="M ${f1(-r * .14)} 0 A ${f1(r * .14)} ${f1(r * .14)} 0 1 1 ${f1(r * .14)} 0 A ${f1(r * .3)} ${f1(r * .3)} 0 1 1 ${f1(-r * .44)} 0 A ${f1(r * .5)} ${f1(r * .5)} 0 0 1 ${f1(r * .5)} ${f1(-r * .1)}" fill="none" stroke="${C[0]}" stroke-width="${f1(r * .1)}" stroke-linecap="round"/>`;
        g += `<path d="M ${f1(-r * .45)} ${f1(-r * .35)} A ${f1(r * .55)} ${f1(r * .55)} 0 0 1 ${f1(r * .1)} ${f1(-r * .58)}" fill="none" stroke="${C[3]}" stroke-width="${f1(r * .07)}" opacity=".6" stroke-linecap="round"/>`;
    } else if (type === 'jasmine') {
        [[-r * .42, r * .12, .58], [r * .42, r * .14, .58], [0, -r * .36, .62]].forEach(([x, y, s]) => {
            let star = '';
            for (let k = 0; k < 5; k++) star += `<ellipse cx="0" cy="${f1(-r * .5 * s)}" rx="${f1(r * .26 * s)}" ry="${f1(r * .5 * s)}" fill="${C[2]}" stroke="${C[0]}" stroke-width=".4" transform="rotate(${k * 72})"/>`;
            g += `<g transform="translate(${f1(x)} ${f1(y)})">${star}<circle r="${f1(r * .13 * s + .4)}" fill="${C[3]}"/></g>`;
        });
        g += `<ellipse cx="${f1(r * .1)}" cy="${f1(r * .5)}" rx="${f1(r * .14)}" ry="${f1(r * .28)}" fill="#f1f5f9" stroke="#86efac" stroke-width=".5" transform="rotate(30 ${f1(r * .1)} ${f1(r * .5)})"/>`;
    } else { // marigold
        g += `<path d="${ktScallop(r, 13, .12)}" fill="${C[1]}" stroke="${C[0]}" stroke-width=".55"/>`;
        g += `<path d="${ktScallop(r * .74, 11, .13)}" fill="${C[2]}" stroke="${C[1]}" stroke-width=".5"/>`;
        g += `<circle r="${f1(r * .6)}" fill="none" stroke="${C[0]}" stroke-width=".7" stroke-dasharray="1 1.3" opacity=".7"/>`;
        g += `<path d="${ktScallop(r * .46, 9, .14)}" fill="${C[3]}" stroke="${C[2]}" stroke-width=".4"/>`;
        g += `<circle r="${f1(r * .18)}" fill="${C[0]}" opacity=".55"/>`;
    }
    return shadow + `<g transform="scale(1 .86)">${g}</g>`;
}

function ktLeaf(len, w) {
    return `<path d="M 0 0 C ${f1(w)} ${f1(-len * .3)} ${f1(w * .6)} ${f1(-len * .8)} 0 ${f1(-len)} C ${f1(-w * .6)} ${f1(-len * .8)} ${f1(-w)} ${f1(-len * .3)} 0 0 Z" fill="#15803d" stroke="#052e16" stroke-width=".4"/><path d="M 0 -.5 L 0 ${f1(-len * .85)}" stroke="#86efac" stroke-width=".5" opacity=".7"/>`;
}

/* ---------- centre pieces ---------- */
function ktCandle(u) {
    return `
        <circle class="kt-glow" cx="100" cy="64" r="34" fill="url(#${u}glow)"/>
        <rect x="94" y="80" width="12" height="32" rx="2" fill="url(#${u}cand)"/>
        <ellipse cx="100" cy="80" rx="6" ry="2" fill="#fffbeb"/>
        <path d="M 95 80.5 q -.2 6 1.4 7.5 q 1.6 -1.2 1.3 -7 Z" fill="#fffbeb"/>
        <path d="M 103.5 81 q .3 3.5 1 4 q .8 -.6 .5 -4 Z" fill="#fffbeb" opacity=".85"/>
        <path d="M 100 80 Q 99.6 77 100.3 74.6" stroke="#292524" stroke-width="1.1" stroke-linecap="round" fill="none"/>
        <g class="kt-flame">
            <path d="M 100 50 C 104.5 57 107.5 63 106 69 C 105 73.5 102.5 75.5 100 75.5 C 97.5 75.5 95 73.5 94 69 C 92.5 63 95.5 57 100 50 Z" fill="url(#${u}flameO)"/>
            <path d="M 100 59 C 102.5 63 103.5 67 102.6 70 C 102 72.5 101 73.6 100 73.6 C 99 73.6 98 72.5 97.4 70 C 96.5 67 97.5 63 100 59 Z" fill="url(#${u}flameI)"/>
            <ellipse cx="100" cy="73.6" rx="2" ry="1.3" fill="#60a5fa" opacity=".55"/>
        </g>`;
}

function ktIncense(u) {
    const stick = (x0, y0, x1, y1, i) => {
        const mx = x0 + (x1 - x0) * .42, my = y0 + (y1 - y0) * .42;
        return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#78350f" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="${x0}" y1="${y0}" x2="${f1(mx)}" y2="${f1(my)}" stroke="#dc2626" stroke-width="1.9" stroke-linecap="round"/>
            <circle cx="${x1}" cy="${y1}" r="4" fill="url(#${u}ember)"/>
            <circle cx="${x1}" cy="${y1}" r="1.1" fill="#fff7ed"/>
            <path class="kt-smoke" style="animation-delay:${-i * 1.3}s" d="M ${x1} ${y1 - 2} c -3 -5 3 -9 0 -14 c -3 -5 2.5 -9 0 -13" stroke="#f1f5f9" stroke-width="1.2" fill="none" opacity=".3" stroke-linecap="round"/>`;
    };
    return stick(89, 112, 80, 58, 0) + stick(111, 112, 120, 58, 1) + stick(104, 112, 108, 53, 2);
}

function ktIngot(u) {
    return `<ellipse cx="0" cy="6" rx="13" ry="3" fill="#020617" opacity=".3"/>
        <path d="M -14 -1 Q -16 -7 -10 -6 Q 0 -1.5 10 -6 Q 16 -7 14 -1 Q 11 7 0 7 Q -11 7 -14 -1 Z" fill="url(#${u}gold)" stroke="#854d0e" stroke-width=".7"/>
        <ellipse cx="0" cy="-5.5" rx="6.3" ry="5.2" fill="url(#${u}gold)" stroke="#854d0e" stroke-width=".6"/>
        <ellipse cx="-2" cy="-7.5" rx="2" ry="1.4" fill="#fff" opacity=".7"/>
        <path d="M -9 1 Q 0 4 9 1" stroke="#fef9c3" stroke-width=".8" fill="none" opacity=".7"/>`;
}

function ktHeartPlaque(u) {
    const heart = 'M 0 7 C -14 -2 -11 -14 0 -7 C 11 -14 14 -2 0 7 Z';
    return `<line x1="0" y1="30" x2="0" y2="4" stroke="url(#${u}gold)" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M -1 8 q -5 3 -6 7 q 4 -1 6 -5 q 2 4 6 5 q -1 -4 -6 -7 Z" fill="#fde68a" opacity=".9"/>
        <path d="${heart}" fill="url(#${u}heart)" stroke="#fff1f2" stroke-width="1.2"/>
        <path d="M -6.5 -6.5 Q -4 -9 -1.5 -6.8" stroke="#fff" stroke-width="1" fill="none" opacity=".75" stroke-linecap="round"/>
        <path d="M 0 2.4 C -4.2 -.3 -3.4 -4.2 0 -2.2 C 3.4 -4.2 4.2 -.3 0 2.4 Z" fill="#fff1f2" opacity=".9"/>
        <path d="M 11 -12 l .7 1.7 l 1.7 .7 l -1.7 .7 l -.7 1.7 l -.7 -1.7 l -1.7 -.7 l 1.7 -.7 Z" fill="#fef9c3"/>`;
}

function ktLuckyCat(u) {
    return `<ellipse cx="0" cy="13" rx="10" ry="2.6" fill="#020617" opacity=".3"/>
        <ellipse cx="0" cy="4.5" rx="9" ry="9.5" fill="url(#${u}cat)" stroke="#cbd5e1" stroke-width=".6"/>
        <path d="M 7 -2 Q 13 -6 12 -13" stroke="#e2e8f0" stroke-width="5" stroke-linecap="round" fill="none"/>
        <circle cx="12" cy="-13.5" r="3" fill="#fff" stroke="#cbd5e1" stroke-width=".5"/>
        <ellipse cx="12" cy="-12.7" rx="1.1" ry=".8" fill="#fda4af"/>
        <path d="M -8 -12 L -6.5 -20 L -1.5 -14 Z M 8 -12 L 6.5 -20 L 1.5 -14 Z" fill="#fff" stroke="#cbd5e1" stroke-width=".5"/>
        <path d="M -6.6 -13 L -6 -17.5 L -3.2 -14.2 Z M 6.6 -13 L 6 -17.5 L 3.2 -14.2 Z" fill="#fda4af"/>
        <circle cx="0" cy="-8.5" r="8.4" fill="url(#${u}cat)" stroke="#cbd5e1" stroke-width=".6"/>
        <path d="M 2 -16.5 Q 6 -16 6.8 -12 Q 4 -13 2 -16.5 Z" fill="#f59e0b" opacity=".85"/>
        <path d="M -6.5 -11 Q -5 -15 -2.5 -15.8 Q -3.5 -12.5 -6.5 -11 Z" fill="#334155" opacity=".85"/>
        <path d="M -5 -9 q 1.6 -1.6 3.2 0 M 1.8 -9 q 1.6 -1.6 3.2 0" stroke="#1e293b" stroke-width=".9" fill="none" stroke-linecap="round"/>
        <path d="M -.9 -6.6 L .9 -6.6 L 0 -5.6 Z" fill="#f472b6"/>
        <path d="M 0 -5.6 q -1 1.3 -2.2 .6 M 0 -5.6 q 1 1.3 2.2 .6" stroke="#64748b" stroke-width=".5" fill="none"/>
        <path d="M -3.5 -6 L -9.5 -7 M -3.5 -5 L -9.5 -4.6 M 3.5 -6 L 9.5 -7 M 3.5 -5 L 9.5 -4.6" stroke="#94a3b8" stroke-width=".35"/>
        <ellipse cx="-4.5" cy="-6.4" rx="1.4" ry=".8" fill="#fda4af" opacity=".6"/><ellipse cx="4.5" cy="-6.4" rx="1.4" ry=".8" fill="#fda4af" opacity=".6"/>
        <path d="M -7 -1.2 Q 0 2 7 -1.2" stroke="#dc2626" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <circle cx="0" cy="1.6" r="2" fill="url(#${u}gold)" stroke="#a16207" stroke-width=".4"/>
        <ellipse cx="-3.5" cy="8" rx="4.2" ry="3" fill="url(#${u}gold)" stroke="#a16207" stroke-width=".5"/>
        <path d="M -6 8 L -1 8" stroke="#a16207" stroke-width=".5"/>
        <ellipse cx="4.6" cy="9" rx="2.3" ry="2" fill="#fff" stroke="#cbd5e1" stroke-width=".5"/>`;
}


function ktGarland(u) {
    let buds = '';
    const n = 16;
    for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU, x = 11 * Math.cos(a), y = 5.2 * Math.sin(a);
        buds += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="2.1" ry="1.5" fill="#ffffff" stroke="#cbd5e1" stroke-width=".4" transform="rotate(${f1(a * 180 / Math.PI + 90)} ${f1(x)} ${f1(y)})"/>`;
    }
    return `<ellipse cx="0" cy="3" rx="13" ry="4" fill="#020617" opacity=".25"/>
        <ellipse cx="0" cy="0" rx="11" ry="5.2" fill="none" stroke="#15803d" stroke-width="1.6" opacity=".7"/>
        ${buds}
        <path d="M -1 5 q -3 4 -4.5 9 M 1 5 q 3 4 4.5 9" stroke="#16a34a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M 0 5 q -1 5 -1 8" stroke="#dc2626" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <circle cx="0" cy="5.6" r="3" fill="#dc2626" stroke="#7f1d1d" stroke-width=".5"/>
        <path d="M -1 5.6 a 1 1 0 1 1 1.6 .4 a 1.8 1.8 0 1 1 -2.6 -.8" fill="none" stroke="#7f1d1d" stroke-width=".55"/>
        <circle cx="-4.6" cy="5.4" r="1.9" fill="#f59e0b" stroke="#c2410c" stroke-width=".4"/>
        <circle cx="4.6" cy="5.4" r="1.9" fill="#f59e0b" stroke="#c2410c" stroke-width=".4"/>`;
}

function ktBetel(u) {
    return `<ellipse cx="0" cy="6" rx="10" ry="2.6" fill="#020617" opacity=".3"/>
        <path d="M -9 3 Q -11 -6 -3 -12 Q 2 -7 1 3 Q -4 7 -9 3 Z" fill="#166534" stroke="#052e16" stroke-width=".5"/>
        <path d="M -7 4 Q -9 -5 0 -13 Q 9 -5 7 4 Q 0 8 -7 4 Z" fill="url(#${u}leaf)" stroke="#052e16" stroke-width=".6"/>
        <path d="M 0 -12 L 0 5 M 0 -6 l -4 3 M 0 -6 l 4 3 M 0 -1 l -4.5 3 M 0 -1 l 4.5 3" stroke="#bbf7d0" stroke-width=".5" opacity=".75" fill="none"/>
        <ellipse cx="-2.6" cy="-4.8" rx="3" ry="2.4" fill="#9a3412" stroke="#431407" stroke-width=".4"/>
        <ellipse cx="-2.6" cy="-5.2" rx="2.1" ry="1.5" fill="#fdba74"/>
        <path d="M -3.8 -5.2 q 1.2 -.8 2.4 0" stroke="#c2410c" stroke-width=".4" fill="none"/>
        <ellipse cx="2.8" cy="-3.6" rx="2.6" ry="2.1" fill="#9a3412" stroke="#431407" stroke-width=".4"/>
        <ellipse cx="2.8" cy="-4" rx="1.8" ry="1.3" fill="#fed7aa"/>
        <circle cx="0.4" cy="-8.4" r="1.2" fill="#f8fafc" opacity=".9"/>`;
}

function ktElephant(u) {
    return `<ellipse cx="1" cy="12" rx="12" ry="2.6" fill="#020617" opacity=".3"/>
        <path d="M 11 -1 q 3 2 2 7" stroke="#94a3b8" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <rect x="-6.5" y="3" width="3.6" height="8.5" rx="1.4" fill="#94a3b8"/>
        <rect x="6" y="3" width="3.6" height="8.5" rx="1.4" fill="#94a3b8"/>
        <rect x="-2.5" y="3.5" width="3.6" height="8.5" rx="1.4" fill="#cbd5e1"/>
        <rect x="9" y="3.5" width="3.4" height="8" rx="1.4" fill="#cbd5e1"/>
        <ellipse cx="3" cy="1" rx="10.5" ry="7.2" fill="url(#${u}ele)" stroke="#94a3b8" stroke-width=".5"/>
        <path d="M -2 -5.6 L 9 -5.6 Q 10.5 0 9.5 4.5 L -2.5 4.5 Q -3.6 0 -2 -5.6 Z" fill="#dc2626" stroke="#facc15" stroke-width=".9"/>
        <path d="M 1 -2.5 l 2 2 l -2 2 l -2 -2 Z M 6 -2.5 l 2 2 l -2 2 l -2 -2 Z" fill="#facc15"/>
        <path d="M -2.5 4.5 l 1 2 l 1 -2 l 1 2 l 1 -2 l 1 2 l 1 -2 l 1 2 l 1 -2 l 1 2 l 1 -2 l 1 2 l 1 -2" stroke="#facc15" stroke-width=".6" fill="none"/>
        <circle cx="-7" cy="-3.5" r="5.8" fill="url(#${u}ele)" stroke="#94a3b8" stroke-width=".5"/>
        <path d="M -11.2 -1.5 Q -16.8 -3.5 -16.2 -10.2 Q -15.8 -13.4 -13.4 -12.4" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M -11.2 -1.5 Q -16.8 -3.5 -16.2 -10.2" stroke="#94a3b8" stroke-width=".5" fill="none" opacity=".7"/>
        <path d="M -9.6 .6 q -2.6 1.2 -4 -.8" stroke="#fffbeb" stroke-width="1.3" stroke-linecap="round" fill="none"/>
        <ellipse cx="-3.6" cy="-2.6" rx="3.6" ry="4.8" fill="#cbd5e1" stroke="#94a3b8" stroke-width=".5"/>
        <ellipse cx="-3.6" cy="-2.4" rx="2" ry="3" fill="#fda4af" opacity=".45"/>
        <circle cx="-8.8" cy="-5.2" r=".85" fill="#1e293b"/>
        <path d="M -10.5 -8.6 L -8.5 -12.6 L -6.4 -8.6 Z" fill="url(#${u}gold)" stroke="#a16207" stroke-width=".4"/>
        <circle cx="-8.5" cy="-12.9" r=".9" fill="#fef9c3"/>`;
}

function ktDiploma(u) {
    return `<ellipse cx="0" cy="7" rx="13" ry="2.6" fill="#020617" opacity=".3"/>
        <rect x="-12" y="-3.6" width="24" height="7.2" rx="3.6" fill="url(#${u}paper)" stroke="#a16207" stroke-width=".5"/>
        <path d="M -9 -1.6 L 9 -1.6 M -9 1.2 L 9 1.2" stroke="#d6b35a" stroke-width=".4" opacity=".7"/>
        <ellipse cx="12" cy="0" rx="2" ry="3.6" fill="#fde68a" stroke="#a16207" stroke-width=".5"/>
        <ellipse cx="12" cy="0" rx=".9" ry="1.6" fill="#e7c773"/>
        <rect x="-1.7" y="-3.9" width="3.4" height="7.8" fill="#dc2626"/>
        <path d="M 0 -3.4 C -5 -9 -8 -4 -1.4 -3 Z M 0 -3.4 C 5 -9 8 -4 1.4 -3 Z" fill="#ef4444" stroke="#991b1b" stroke-width=".4"/>
        <path d="M -.8 3.8 L -3 10 M .8 3.8 L 3.4 9.6" stroke="#dc2626" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="0" cy="-3.4" r="1.4" fill="#b91c1c"/>
        <circle cx="-7" cy="4.4" r="2.6" fill="url(#${u}gold)" stroke="#a16207" stroke-width=".45"/>
        <path d="M -7 3.2 l .4 .9 l 1 .1 l -.75 .65 l .25 1 l -.9 -.55 l -.9 .55 l .25 -1 l -.75 -.65 l 1 -.1 Z" fill="#fff7cc"/>`;
}


const KT_SIDE_SLOT = {
    coins:    i => `<g transform="translate(125 114) scale(1.2)">${ktIngot(i)}</g>`,
    couple:   i => `<g transform="translate(125 86)">${ktHeartPlaque(i)}</g>`,
    cat:      i => `<g transform="translate(127 104) scale(1.05)">${ktLuckyCat(i)}</g>`,
    garland:  i => `<g transform="translate(127 118) scale(1.45)">${ktGarland(i)}</g>`,
    betel:    i => `<g transform="translate(128 112) scale(1.45)">${ktBetel(i)}</g>`,
    elephant: i => `<g transform="translate(131 105) scale(1.35)">${ktElephant(i)}</g>`,
    diploma:  i => `<g transform="translate(127 112) rotate(-16) scale(1.4)">${ktDiploma(i)}</g>`
};
function ktSideOrnament(u, id, left = false) {
    if (id === 'coins-pair') return `<g transform="translate(76 113) scale(1.15)">${ktIngot(u)}</g><g transform="translate(125 114) scale(1.05)">${ktIngot(u)}</g>`;
    const fn = KT_SIDE_SLOT[id];
    if (!fn) return '';
    return left ? `<g transform="matrix(-1 0 0 1 200 0)">${fn(u)}</g>` : fn(u);
}

/* ---------- full krathong ---------- */
function ktKrathongSVG(config, opts = {}) {
    const n = ++ktUid;
    const u = `kt${n}-`;
    const P = KT_PALETTES[config.base] || KT_PALETTES.banana;
    const flowerType = KT_FLOWER_COLORS[config.flower] ? config.flower : 'marigold';
    const topping = config.topping || 'incense';

    const outer = ktPetalRing(u, P, 14, 100, 120, 58, 18, 9, 27, 0.11, true);
    const inner = ktPetalRing(u, P, 12, 100, 116, 45, 13.5, 7, 18, 0.11 + Math.PI / 12, false);

    // Flowers & leaves around the top, split into behind / in front of the centre piece
    const backItems = [], frontItems = [];
    const place = (y, html, front) => (front ? frontItems : backItems).push({ y, html });
    for (let i = 0; i < 9; i++) {
        const a = 0.35 + (i / 9) * TAU + Math.PI / 9, s = Math.sin(a), c = Math.cos(a);
        const x = 100 + 38 * c, y = 112.5 + 11.5 * s;
        const rot = Math.atan2(s * 11.5, c * 37) * 180 / Math.PI + 90;
        place(y - 0.5, `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${f1(.7 + .3 * Math.abs(s))} 1)">${ktLeaf(9, 3.2)}</g>`, s > 0.1);
    }
    for (let i = 0; i < 9; i++) {
        const a = 0.35 + (i / 9) * TAU, s = Math.sin(a), c = Math.cos(a);
        const x = 100 + 32 * c, y = 110.5 + 10 * s, k = 0.88 + 0.22 * (s + 1) / 2;
        place(y, `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(k * 100) / 100})">${ktFlower(flowerType, 9)}</g>`, s > 0.1);
    }
    for (let i = 0; i < 5; i++) {
        const a = 1.1 + (i / 5) * TAU, s = Math.sin(a), c = Math.cos(a);
        const x = 100 + 17 * c, y = 109 + 5 * s;
        place(y, `<g transform="translate(${f1(x)} ${f1(y)}) scale(.8)">${ktFlower(flowerType, 7)}</g>`, s > 0.2);
    }
    const sortJoin = arr => arr.sort((p, q) => p.y - q.y).map(p => p.html).join('');

    // Offerings: incense sits around the candle; anything else takes a side slot (1st right, 2nd mirrored left)
    const picks = [topping, config.topping2].filter((x, i, arr) => x && arr.indexOf(x) === i);
    const sideItems = picks.filter(x => x !== 'incense');
    const centre = (picks.includes('incense') ? ktIncense(u) : '') + ktCandle(u);
    let ornament = '';
    if (sideItems.length === 1 && sideItems[0] === 'coins') ornament = ktSideOrnament(u, 'coins-pair');
    else if (sideItems.length === 1 && sideItems[0] === 'garland') ornament = ktSideOrnament(u, 'garland', true);
    else sideItems.forEach((id, i) => { ornament += ktSideOrnament(u, id, i === 1); });

    const size = opts.standalone
        ? `xmlns="http://www.w3.org/2000/svg" width="${opts.size || 600}" height="${opts.size || 600}"`
        : 'width="100%" height="100%" aria-hidden="true"';
    const delay = -((n * 0.37) % 3).toFixed(2);

    return `<svg viewBox="0 0 200 200" ${size} style="overflow:visible;--kd:${delay}s">${ktDefs(u, P)}
        <ellipse cx="100" cy="160" rx="92" ry="24" fill="url(#${u}water)"/>
        <ellipse class="kt-ripple" cx="100" cy="153" rx="70" ry="14" fill="none" stroke="#bae6fd" stroke-width="1.1" opacity=".55"/>
        <ellipse class="kt-ripple kt-ripple2" cx="100" cy="153" rx="70" ry="14" fill="none" stroke="#7dd3fc" stroke-width=".9" opacity=".4"/>
        <ellipse cx="100" cy="166" rx="16" ry="2.2" fill="#fde68a" opacity=".3"/>
        <ellipse cx="102" cy="172" rx="11" ry="1.6" fill="#fde68a" opacity=".22"/>
        <ellipse cx="98" cy="177" rx="7" ry="1.2" fill="#fde68a" opacity=".15"/>
        <ellipse cx="100" cy="164" rx="44" ry="7" fill="${P.bodyTop}" opacity=".22"/>
        <ellipse cx="100" cy="151" rx="54" ry="8" fill="#020617" opacity=".45"/>
        <path d="${KT_BODY_PATH}" fill="url(#${u}body)"${P.alpha ? ` opacity="${P.alpha}"` : ''}/>
        ${ktBodyPattern(u, P)}
        <path d="${KT_BODY_PATH}" fill="url(#${u}shade)"/>
        <path d="M 130 141 Q 145 135 152 126" stroke="#fff" stroke-width="2" opacity=".2" fill="none" stroke-linecap="round"/>
        ${outer.back}
        ${inner.back}
        <path d="M 158 124 A 58 18 0 0 1 42 124" stroke="${P.band}" stroke-width="2.4" fill="none"/>
        <path d="M 156 128 A 56 17 0 0 1 44 128" stroke="${P.band}" stroke-width=".8" fill="none" opacity=".6" stroke-dasharray="2 2"/>
        <ellipse cx="100" cy="116" rx="47" ry="14" fill="url(#${u}cush)"/>
        <ellipse cx="100" cy="115.5" rx="38" ry="10.5" fill="none" stroke="${P.cushionEdge}" stroke-width=".6" opacity=".45"/>
        ${sortJoin(backItems)}
        ${centre}
        ${inner.front}
        ${sortJoin(frontItems)}
        ${ornament}
        ${outer.front}
    </svg>`;
}

/* ---------- studio swatches ---------- */
function ktBaseSwatch(baseId) {
    const u = `kt${++ktUid}-`;
    const P = KT_PALETTES[baseId] || KT_PALETTES.banana;
    const petals = [[-13, 16, -32, 1], [13, 16, 32, 1], [-6, 18, -12, 1], [6, 18, 12, 1], [0, 19, 0, 1.08]]
        .map(([x, y, r, s]) => ktPetal(u, P, 20 + x, y, r, s, s, 6.5, 15, false)).join('');
    return `<svg viewBox="0 0 40 26" width="100%" height="100%" aria-hidden="true">${ktDefs(u, P)}
        <path d="M 4 17 Q 20 29 36 17 Z" fill="url(#${u}body)"/>${petals}
        <path d="M 6 19 Q 20 26 34 19" stroke="${P.band}" stroke-width="1.1" fill="none"/></svg>`;
}
function ktFlowerSwatch(flowerId) {
    return `<svg viewBox="-11 -11 22 22" width="100%" height="100%" aria-hidden="true">${ktFlower(flowerId, 9)}</svg>`;
}
function ktToppingSwatch(toppingId) {
    const u = `kt${++ktUid}-`;
    const defs = ktDefs(u, KT_PALETTES.banana);
    if (toppingId === 'coins') return `<svg viewBox="-17 -14 34 24" width="100%" height="100%" aria-hidden="true">${defs}${ktIngot(u)}</svg>`;
    if (toppingId === 'couple') return `<svg viewBox="-16 -16 32 32" width="100%" height="100%" aria-hidden="true">${defs}${ktHeartPlaque(u)}</svg>`;
    if (toppingId === 'cat') return `<svg viewBox="-14 -22 30 37" width="100%" height="100%" aria-hidden="true">${defs}${ktLuckyCat(u)}</svg>`;
    if (toppingId === 'garland') return `<svg viewBox="-14 -9 28 24" width="100%" height="100%" aria-hidden="true">${defs}${ktGarland(u)}</svg>`;
    if (toppingId === 'betel') return `<svg viewBox="-12 -15 24 24" width="100%" height="100%" aria-hidden="true">${defs}${ktBetel(u)}</svg>`;
    if (toppingId === 'elephant') return `<svg viewBox="-19 -16 34 30" width="100%" height="100%" aria-hidden="true">${defs}${ktElephant(u)}</svg>`;
    if (toppingId === 'diploma') return `<svg viewBox="-15 -12 30 24" width="100%" height="100%" aria-hidden="true">${defs}${ktDiploma(u)}</svg>`;
    return `<svg viewBox="70 30 60 84" width="100%" height="100%" aria-hidden="true">${defs}${ktIncense(u)}${ktCandle(u)}</svg>`;
}
