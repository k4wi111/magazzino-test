// js/app.js
'use strict';

import { el, showNotification, updateUndoButton } from './ui.js';
import { debounce } from './utils.js';
import * as S from './state.js';
import { renderList, initListInteractions } from './listView.js';
import { renderAxis, renderGrid, initGridInteraction, initColumnDialog, chooseColumn } from './mapView.js';
import { renderStatsView } from './statsView.js';

let listQueued=false, gridQueued=false;

function isVisible(node){
  if (!node) return false;
  return node.style.display !== 'none';
}

function scheduleRenderList(){
  if (listQueued) return;
  listQueued=true;
  requestAnimationFrame(()=>{
    listQueued=false;
    renderList();
    updateUndoButton(S.undoStack.length>0);
  });
}

function scheduleRenderGrid(){
  if (gridQueued) return;
  gridQueued=true;
  requestAnimationFrame(()=>{ gridQueued=false; renderGrid(); });
}

function scheduleRenderAll(){
  // Evita ricalcoli inutili: renderizza solo la view attiva.
  if (isVisible(el.viewLista)) scheduleRenderList();
  if (isVisible(el.viewMappa)) scheduleRenderGrid();
  if (isVisible(el.viewStats)) renderStatsView();
  updateUndoButton(S.undoStack.length>0);
}

function switchTab(view){
  const L=view==='lista', M=view==='mappa', Sx=view==='stats';
  if (el.viewLista) el.viewLista.style.display = L?'':'none';
  if (el.viewMappa) el.viewMappa.style.display = M?'':'none';
  if (el.viewStats) el.viewStats.style.display = Sx?'':'none';

  if (el.tabLista) el.tabLista.classList.toggle('active',L);
  if (el.tabMappa) el.tabMappa.classList.toggle('active',M);
  if (el.tabStats) el.tabStats.classList.toggle('active',Sx);

  if (M) scheduleRenderGrid();
  if (Sx) renderStatsView();
  if (L) scheduleRenderList();
}

function clearForm(){
  if (el.name) el.name.value='';
  if (el.lot) el.lot.value='';
  if (el.expiry) el.expiry.value='';
}

function saveFromForm(){
  const name=(el.name?.value||'').trim();
  const lot=(el.lot?.value||'').trim();
  const expiryText=(el.expiry?.value||'').trim();
  if (!name && !lot && !expiryText) return;

  S.saveToUndo();
  const p = { id:S.uid(), name, lot, expiryText, dateAdded:new Date().toISOString(), inPrelievo:false };
  S.products.unshift(p);
  S.logEvent('add', p);
  S.commitProducts({saveEventsToo:true});

  clearForm();
  scheduleRenderAll();
}

let editTargetId=null;
function openEditDialog(id){
  if (!el.editDialog || !el.eName || !el.eLot || !el.eExpiry) return;
  const p = S.products.find(x=>x.id===id); if (!p) return;
  editTargetId=id;
  el.eName.value=p.name||'';
  el.eLot.value=p.lot||'';
  el.eExpiry.value=p.expiryText||'';
  try{ el.editDialog.showModal(); }catch(e){ el.editDialog.setAttribute('open',''); }
}

function initEditDialog(){
  if (!el.editDialog) return;

  el.eCancel?.addEventListener('click', ()=>{
    try{ el.editDialog.close(); }catch(e){}
    editTargetId=null;
  });

  el.eSave?.addEventListener('click', ()=>{
    if (!editTargetId) return;
    const p = S.products.find(x=>x.id===editTargetId); if (!p) return;
    if (p.inPrelievo){ showNotification('Info','Prodotto in prelievo',false); return; }

    S.saveToUndo();
    p.name=(el.eName?.value||'').trim();
    p.lot=(el.eLot?.value||'').trim();
    p.expiryText=(el.eExpiry?.value||'').trim();
    S.logEvent('edit', p);
    S.commitProducts({saveEventsToo:true});

    try{ el.editDialog.close(); }catch(e){}
    editTargetId=null;
    scheduleRenderAll();
  });
}

function findFirstEmptyInColumn(col){
  for(let r=0;r<S.rows;r++){
    if (!S.productAt(r,col)) return {r};
  }
  return null;
}

function compactColumn(col){
  // versione robusta: riallinea 0..rows-1 e “scompatta” gli extra
  const colItems = S.products
    .filter(p=>!p.inPrelievo && Number.isInteger(p.col) && p.col===col && Number.isInteger(p.row))
    .sort((a,b)=>a.row-b.row);

  for(let i=0;i<colItems.length;i++){
    if (i < S.rows){
      colItems[i].row=i;
      colItems[i].col=col;
    } else {
      delete colItems[i].row;
      delete colItems[i].col;
    }
  }
  S.commitProducts();
}

function exportJson(){
  const dataStr = JSON.stringify(S.products, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url;
  a.download=`magazzino-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 1500);
}

function initImport(){
  if (!el.importJsonFile) return;
  el.importJsonFile.addEventListener('change', (event)=>{
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    showNotification('Importazione','Sovrascrivere dati attuali?',true,()=>{
      const reader = new FileReader();
      reader.onload = (e)=>{
        try{
          const imported = JSON.parse(String(e.target.result||''));
          if (Array.isArray(imported)){
            S.saveToUndo();
            const normalized = S.normalizeProducts(imported);
            S.products.length = 0;
            for (const p of normalized) S.products.push(p);
            S.commitProducts();
            scheduleRenderAll();
            showNotification('Fatto','Dati importati.',false);
          } else {
            showNotification('Errore','Formato file non valido.',false);
          }
        }catch(err){
          showNotification('Errore','File JSON non valido.',false);
        }
      };
      reader.readAsText(file);
    });

    event.target.value='';
  });
}

function initFilterButtons(){
  const btns = document.querySelectorAll('[data-list-filter]');
  btns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      btns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      S.setListFilter(btn.dataset.listFilter);
      scheduleRenderList();
    });
  });
}

function main(){
  S.initState();
  initColumnDialog();
  renderAxis();
  initGridInteraction(scheduleRenderAll);
  initEditDialog();

  initListInteractions({
    switchTab,
    openEditDialog,
    chooseColumn,
    findFirstEmptyInColumn,
    compactColumn,
    scheduleRenderAll
  });

  el.tabLista?.addEventListener('click', ()=>switchTab('lista'));
  el.tabMappa?.addEventListener('click', ()=>switchTab('mappa'));
  el.tabStats?.addEventListener('click', ()=>switchTab('stats'));

  el.undoBtn?.addEventListener('click', ()=>{
    const ok = S.undoLastAction();
    if (ok) scheduleRenderAll();
    updateUndoButton(S.undoStack.length>0);
  });

  el.clearBtn?.addEventListener('click', clearForm);
  el.saveBtn?.addEventListener('click', saveFromForm);

  el.search?.addEventListener('input', debounce(()=>scheduleRenderList(),140));
  el.resetSearchBtn?.addEventListener('click', ()=>{
    if (el.search) el.search.value='';
    scheduleRenderList();
  });

  el.exportJsonBtn?.addEventListener('click', exportJson);
  initImport();
  initFilterButtons();

  // PDF button left as-is but optional: show notice if missing library
  el.exportPdfBtn?.addEventListener('click', ()=>
    showNotification('Info','PDF opzionale: aggiungi jspdf.umd.min.js nella root se lo vuoi.',false)
  );

  scheduleRenderAll();
}

main();
