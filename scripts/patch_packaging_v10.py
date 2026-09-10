from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

def rep(old, new, name, count=1):
    global s
    found = s.count(old)
    if found < count:
        raise SystemExit(f'{name}: expected at least {count}, found {found}')
    s = s.replace(old, new, count)

# Compact styling while keeping touch targets usable.
rep('input,select{width:100%;min-height:46px;', 'input,select{width:100%;min-height:44px;', 'input height')
rep('.modal{padding:18px 18px calc(18px + env(safe-area-inset-bottom));', '.modal{padding:14px 16px calc(14px + env(safe-area-inset-bottom));', 'modal padding')
rep('.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}', '.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pack-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pack-title{margin-top:9px;font-size:11px;font-weight:800;color:#2b4461;text-transform:uppercase;letter-spacing:.45px}', 'grid css')
rep('label{display:block;font-size:12px;color:#526176;margin-top:10px;font-weight:700;letter-spacing:.1px}', 'label{display:block;font-size:12px;color:#526176;margin-top:7px;font-weight:700;letter-spacing:.1px}', 'label spacing')
rep('.hint{font-size:12px;color:#718096;margin-top:6px;line-height:1.4}', '.hint{font-size:11px;color:#718096;margin-top:3px;line-height:1.3}', 'hint spacing')
rep('.actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:17px;padding-top:13px;', '.actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:11px;padding-top:10px;', 'actions spacing')
rep('.partial-box{margin-top:14px;border:1px solid #d7e4f0;border-radius:15px;padding:12px;', '.partial-box{margin-top:9px;border:1px solid #d7e4f0;border-radius:15px;padding:10px;', 'partial spacing')
rep('.summary-calc{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}', '.summary-calc{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}', 'summary spacing')

# Shorter field labels and help text.
rep('<label>Tipo di conteggio<select id="mode"><option value="quantity">Quantità (KG/PZ)</option><option value="pallets">Solo numero pedane</option></select></label>', '<label>Conteggio<select id="mode"><option value="quantity">Quantità (KG/PZ)</option><option value="pallets">Solo pedane</option></select></label>', 'count label')
rep('<label>Unità di misura<select id="um" class="um-select">', '<label>UM<select id="um" class="um-select">', 'um label')
rep('<label>Q.tà per pedana<input id="per"', '<label>Q.tà/pedana<input id="per"', 'qty per pallet label')
rep('<label>Q.tà aggiuntiva<input id="additional"', '<label>Q.tà extra<input id="additional"', 'extra label')
rep('<div class="hint">KG/PZ in più rispetto alla quantità standard delle pedane complete. Non aggiunge una nuova pedana.</div>', '', 'extra hint')
rep('<div class="hint">Usalo solo quando una pedana ha una quantità diversa dalla quantità standard.</div>', '', 'different pallet hint')
rep('<div id="palletFields" hidden><label>Numero totale pedane<div class="stepper">', '<div id="palletFields" hidden><label>Pedane totali<div class="stepper">', 'pallet total label')
rep('</div></label><div class="hint">Per articoli dove vuoi registrare soltanto il numero delle pedane, senza calcolare KG o PZ.</div></div>\n<label><input id="verified"', '</div></label></div>\n<div class="pack-title">Imballi</div><div class="pack-grid"><label>Cartoni/ped.<input id="cartonsPerPallet" type="number" min="0" step="1"></label><label>Cartoni totali<input id="cartonsTotal" type="number" min="0" step="1"></label><label>Sacchi/ped.<input id="sacksPerPallet" type="number" min="0" step="1"></label><label>Sacchi totali<input id="sacksTotal" type="number" min="0" step="1"></label></div>\n<label><input id="verified"', 'insert packaging fields')

# Persist new fields, while old saved data simply gets zeros.
old_base = "const base={id:Number(x.id)||Date.now()+Math.random(),name:String(x.name||'').trim()||'Prodotto',brand:String(x.brand||''),verified:!!x.verified};"
new_base = "const base={id:Number(x.id)||Date.now()+Math.random(),name:String(x.name||'').trim()||'Prodotto',brand:String(x.brand||''),verified:!!x.verified,cartonsPerPallet:Math.floor(cleanNum(x.cartonsPerPallet)),cartonsTotal:Math.floor(cleanNum(x.cartonsTotal)),sacksPerPallet:Math.floor(cleanNum(x.sacksPerPallet)),sacksTotal:Math.floor(cleanNum(x.sacksTotal))};"
rep(old_base, new_base, 'migrate packaging')

rep("if(p.mode==='quantity'&&cleanNum(p.additional)>0)meta+=' · +'+fmt(p.additional)+' '+normalizeUm(p.um)+' aggiuntivi';left.querySelector('.meta').textContent=meta;", "if(p.mode==='quantity'&&cleanNum(p.additional)>0)meta+=' · +'+fmt(p.additional)+' '+normalizeUm(p.um)+' extra';const packs=[];if(cleanNum(p.cartonsTotal)>0)packs.push(fmt(p.cartonsTotal)+' cartoni');else if(cleanNum(p.cartonsPerPallet)>0)packs.push(fmt(p.cartonsPerPallet)+' cart./ped.');if(cleanNum(p.sacksTotal)>0)packs.push(fmt(p.sacksTotal)+' sacchi');else if(cleanNum(p.sacksPerPallet)>0)packs.push(fmt(p.sacksPerPallet)+' sac./ped.');if(packs.length)meta+=' · '+packs.join(' · ');left.querySelector('.meta').textContent=meta;", 'list packaging')
rep("$('#modeHelp').textContent=m==='quantity'?'Per prodotti su pedana conteggiati in KG o PZ. Inserisci la quantità standard, le pedane complete, la quantità aggiuntiva eventuale e, solo se serve, le pedane con quantità diversa.':'Per articoli dove interessa soltanto il numero delle pedane.';", "$('#modeHelp').textContent=m==='quantity'?'Conteggio in KG/PZ.':'Solo numero di pedane.';", 'short help')
rep("$('#qtyPallet').value=p.palletCount||0;$('#verified').checked=false;", "$('#qtyPallet').value=p.palletCount||0;$('#cartonsPerPallet').value=p.cartonsPerPallet||0;$('#cartonsTotal').value=p.cartonsTotal||0;$('#sacksPerPallet').value=p.sacksPerPallet||0;$('#sacksTotal').value=p.sacksTotal||0;$('#verified').checked=false;", 'open edit packaging')
rep("p.palletCount=Math.floor(cleanNum($('#qtyPallet').value));p.verified=$('#verified').checked;", "p.palletCount=Math.floor(cleanNum($('#qtyPallet').value));p.cartonsPerPallet=Math.floor(cleanNum($('#cartonsPerPallet').value));p.cartonsTotal=Math.floor(cleanNum($('#cartonsTotal').value));p.sacksPerPallet=Math.floor(cleanNum($('#sacksPerPallet').value));p.sacksTotal=Math.floor(cleanNum($('#sacksTotal').value));p.verified=$('#verified').checked;", 'save packaging')
rep("editingPartials=[];$('#qtyPallet').value=0;$('#verified').checked=false;", "editingPartials=[];$('#qtyPallet').value=0;$('#cartonsPerPallet').value=0;$('#cartonsTotal').value=0;$('#sacksPerPallet').value=0;$('#sacksTotal').value=0;$('#verified').checked=false;", 'new product packaging')
rep("version:5,exportedAt", "version:6,exportedAt", 'json version')

p.write_text(s, encoding='utf-8')

sw = Path('service-worker.js')
t = sw.read_text(encoding='utf-8')
if 'magazzino-fb-pwa-v9' not in t:
    raise SystemExit('service worker cache v9 not found')
sw.write_text(t.replace('magazzino-fb-pwa-v9', 'magazzino-fb-pwa-v10', 1), encoding='utf-8')

print('Packaging fields v10 patch completed')
