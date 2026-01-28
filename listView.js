let activeListPage = 0;
let touchStartX = null;
// js/listView.js
'use strict';

import { el, showNotification } from './ui.js';
import { products, saveProducts, saveToUndo, rebuildGridIndex } from './state.js';
import { getExpiryStatus, daysSinceProduction, daysSinceISO, giacenzaStatus } from './utils.js';

export function makeBtn(cls, text, action, id){
  const b = document.createElement('button');
  b.type = 'button';
  b.className = cls;
  b.textContent = text;
  b.dataset.action = action;
  b.dataset.id = id;
  return b;
}

export function renderList(){
  const q = (el.search.value || '').trim().toLowerCase();
  const unplaced = [];
  const placed = [];
  const prelievo = [];

  for (const p of products){
    if (q){
      const n = (p.name || '').toLowerCase();
      const l = (p.lot || '').toLowerCase();
      if (!n.includes(q) && !l.includes(q)) continue;
    }

    if (p.inPrelievo) {
      prelievo.push(p);
      continue; // non deve comparire anche in scaffale/terra
    }

    if (Number.isInteger(p.row) && Number.isInteger(p.col)) placed.push(p);
    else unplaced.push(p);
  }

  el.listUnplaced.textContent = '';
  el.listPlaced.textContent = '';
  if (el.listPrelievo) el.listPrelievo.textContent = '';

  const buildFrag = (arr, isPlaced) => {
    const frag = document.createDocumentFragment();
    for (const p of arr) frag.appendChild(buildItem(p, isPlaced));
    return frag;
  };

  if (!unplaced.length){
    const d = document.createElement('div');
    d.className='muted';
    d.style.padding='20px';
    d.style.textAlign='center';
    d.style.fontStyle='italic';
    d.textContent='Nessun prodotto su scaffale.';
    el.listUnplaced.appendChild(d);
  } else el.listUnplaced.appendChild(buildFrag(unplaced,false));

  if (!placed.length){
    const d = document.createElement('div');
    d.className='muted';
    d.style.padding='20px';
    d.style.textAlign='center';
    d.style.fontStyle='italic';
    d.textContent='Nessun prodotto a terra.';
    el.listPlaced.appendChild(d);
  } else el.listPlaced.appendChild(buildFrag(placed,true));

  if (el.listPrelievo){
    if (!prelievo.length){
      const d = document.createElement('div');
      d.className='muted';
      d.style.padding='20px';
      d.style.textAlign='center';
      d.style.fontStyle='italic';
      d.textContent='Nessun prodotto in prelievo.';
      el.listPrelievo.appendChild(d);
    } else {
      el.listPrelievo.appendChild(buildFrag(prelievo,false));
    }
  }
}

function buildItem(p, isPlaced){
  const node = el.tpl.content.firstElementChild.cloneNode(true);
  node.querySelector('.abbr').textContent = p.name || '(senza descrizione)';

  const detail = node.querySelector('[data-detail]');
  detail.textContent = '🏷️ ' + (p.lot || '—');
  if (isPlaced){
    detail.innerHTML = `🏷️ ${(p.lot||'—')} <span style="margin-left:8px; color:#667eea; font-weight:700">📍 R${p.row+1} C${p.col+1}</span>`;
  }
  if (p.inPrelievo){
    detail.innerHTML += ` <span class="pill-prel">IN PRELIEVO</span>`;
  }

  const meta = document.createElement('div');
  meta.className='smallmeta';
  meta.textContent = 'Inserito: ' + new Date(p.dateAdded).toLocaleDateString('it-IT');
  node.querySelector('div[style="min-width:0"]').appendChild(meta);

  const tagsWrap = document.createElement('div'); tagsWrap.className='tagline';
  const exp = getExpiryStatus(p.expiryText);
  if (p.expiryText && exp){
    const t=document.createElement('div'); t.className='tag '+exp.cls; t.textContent=exp.label; tagsWrap.appendChild(t);
  }
  const gDays = (daysSinceProduction(p) ?? daysSinceISO(p.dateAdded));
  const g = giacenzaStatus(gDays);
  if (g){
    const t2=document.createElement('div'); t2.className='tag '+g.cls; t2.textContent=g.label; tagsWrap.appendChild(t2);
  }
  if (tagsWrap.childNodes.length) node.querySelector('div[style="min-width:0"]').appendChild(tagsWrap);

  const btns = node.querySelector('[data-btns]');
  btns.appendChild(makeBtn('secondary','Modifica','edit',p.id));
  if (!p.inPrelievo) btns.appendChild(makeBtn('secondary','Metti in prelievo','prel',p.id));
  if (p.inPrelievo) btns.appendChild(makeBtn('remove-grid','Completa prelievo','prel_done',p.id));
  if (isPlaced){
    btns.appendChild(makeBtn('remove-grid','Metti a scaffale','unplace',p.id));
    btns.appendChild(makeBtn('go-to-map','Mappa','map',p.id));
  } else {
    btns.appendChild(makeBtn('add-grid','Posiziona a terra','place',p.id));
  }
  btns.appendChild(makeBtn('danger','Elimina','del',p.id));
  return node;
}

export function initListInteractions({switchTab, openEditDialog, chooseColumn, findFirstEmptyInColumn, compactColumn, scheduleRenderAll}){
  function onClick(e){
    const btn = e.target.closest('button'); if (!btn) return;
    const action = btn.dataset.action; const id = btn.dataset.id;
    const p = products.find(x => x.id === id); if (!p) return;

    if (action === 'map'){ switchTab('mappa'); return; }
    if (action === 'edit'){ openEditDialog(id); return; }

    if (action === 'prel'){
      const name = (p.name||'').trim();
      if (products.some(x => x!==p && (x.name||'').trim()===name && x.inPrelievo)){
        showNotification('Info','Prodotto già in prelievo',true); return;
      }
      saveToUndo();
      if (Number.isInteger(p.row) && Number.isInteger(p.col)){
        p._prevRow = p.row; p._prevCol = p.col;
        delete p.row; delete p.col;
      }
      p.inPrelievo = true;
      rebuildGridIndex();
      saveProducts();
      scheduleRenderAll();
      return;
    }

    if (action === 'prel_done'){
      saveToUndo();
      p.inPrelievo = false;
      if (Number.isInteger(p._prevRow) && Number.isInteger(p._prevCol)){
        p.row = p._prevRow; p.col = p._prevCol;
        delete p._prevRow; delete p._prevCol;
      }
      rebuildGridIndex();
      saveProducts();
      scheduleRenderAll();
      return;
    }

    if (action === 'unplace'){
      if (p.inPrelievo) return;
      saveToUndo();
      const oldCol = p.col;
      delete p.row; delete p.col;
      rebuildGridIndex();
      saveProducts();
      if (Number.isInteger(oldCol)) compactColumn(oldCol);
      scheduleRenderAll();
      return;
    }

    if (action === 'place'){
      if (p.inPrelievo) return;
      chooseColumn().then((col)=>{
        if (col==null) return;
        const spot = findFirstEmptyInColumn(col);
        if (!spot){ showNotification('Colonna Piena',"Scegli un'altra colonna.",false); return; }
        saveToUndo();
        p.row = spot.r; p.col = col;
        rebuildGridIndex();
        saveProducts();
        scheduleRenderAll();
      });
      return;
    }

    if (action === 'del'){
      showNotification('Conferma','Eliminare questo prodotto?',true,()=>{
        saveToUndo();
        const oldCol = p.col;
        const idx = products.findIndex(x => x.id === id);
        if (idx>=0) products.splice(idx,1);
        rebuildGridIndex();
        saveProducts();
        if (Number.isInteger(oldCol)) compactColumn(oldCol);
        scheduleRenderAll();
      });
      return;
    }
  }
  el.listUnplaced.addEventListener('click', onClick);
  el.listPlaced.addEventListener('click', onClick);
  if (el.listPrelievo) el.listPrelievo.addEventListener('click', onClick);
}

function updateListTabs(){
  document.querySelectorAll('.list-tabs button').forEach(btn=>{
    btn.classList.toggle('active', Number(btn.dataset.page)===activeListPage);
  });
}

function initListPager(){
  const pager=document.querySelector('.list-pager');
  const wrapper=document.querySelector('.list-pager-wrapper');
  if(!pager||!wrapper) return;

  document.querySelectorAll('.list-tabs button').forEach(btn=>{
    btn.onclick=()=>{
      activeListPage=Number(btn.dataset.page);
      pager.style.transform=`translateX(-${activeListPage*100}vw)`;
      updateListTabs();
    };
  });

  wrapper.addEventListener('touchstart',e=>{
    touchStartX=e.touches[0].clientX;
  },{passive:true});

  wrapper.addEventListener('touchend',e=>{
    if(touchStartX===null) return;
    const dx=e.changedTouches[0].clientX-touchStartX;
    if(Math.abs(dx)>40){
      if(dx<0&&activeListPage<2) activeListPage++;
      if(dx>0&&activeListPage>0) activeListPage--;
      pager.style.transform=`translateX(-${activeListPage*100}vw)`;
      updateListTabs();
    }
    touchStartX=null;
  });
}
initListPager();
