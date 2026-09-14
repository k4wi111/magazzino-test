from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

old_css = ".swipe-delete{position:absolute;right:0;top:0;bottom:0;width:102px;min-height:0;border-radius:0;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:0;font-size:12px;font-weight:800;z-index:0}"
new_css = ".swipe-delete{position:absolute;right:0;top:0;bottom:0;width:102px;min-height:0;border-radius:0;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:0;font-size:12px;font-weight:800;z-index:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}"
if old_css not in s:
    raise SystemExit('Swipe delete CSS anchor not found')
s = s.replace(old_css, new_css, 1)

old_svg = ".swipe-delete svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}"
new_svg = old_svg + "\n.swipe-delete svg,.swipe-delete span{pointer-events:none}"
if old_svg not in s:
    raise SystemExit('Swipe delete icon CSS anchor not found')
s = s.replace(old_svg, new_svg, 1)

old_listener = "delSwipe.addEventListener('click',()=>deleteProductWithUndo(p.id))"
new_listener = "delSwipe.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation()});delSwipe.addEventListener('pointerup',e=>{e.preventDefault();e.stopPropagation();deleteProductWithUndo(p.id)})"
if old_listener not in s:
    raise SystemExit('Swipe delete click listener not found')
s = s.replace(old_listener, new_listener, 1)

p.write_text(s, encoding='utf-8')

sw = Path('service-worker.js')
w = sw.read_text(encoding='utf-8')
if "magazzino-fb-pwa-v12" not in w:
    raise SystemExit('Expected v12 cache not found')
w = w.replace("magazzino-fb-pwa-v12", "magazzino-fb-pwa-v13", 1)
sw.write_text(w, encoding='utf-8')
