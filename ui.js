// ui.js
'use strict';

import { $ } from './utils.js';

// Keep the same object reference across imports.
export const el = Object.create(null);

function setEl(key, id){
  el[key] = $(id) || null;
}

export function refreshUI(){
  // Core navigation
  setEl('undoBtn','undoBtn');

  setEl('tabLista','tab-lista');
  setEl('tabMappa','tab-mappa');
  setEl('tabStats','tab-stats');
  setEl('viewLista','view-lista');
  setEl('viewMappa','view-mappa');
  setEl('viewStats','view-stats');

  // Add form
  setEl('name','name');
  setEl('lot','lot');
  setEl('expiry','expiry');
  setEl('clearBtn','clearBtn');
  setEl('saveBtn','saveBtn');

  // List
  setEl('search','search');
  setEl('resetSearchBtn','resetSearchBtn');
  setEl('listEmptyState','listEmptyState');
  setEl('listUnplaced','listUnplaced');
  setEl('listPlaced','listPlaced');

  // Import/export
  setEl('exportPdfBtn','exportPdfBtn');
  setEl('exportJsonBtn','exportJsonBtn');
  setEl('importJsonFile','importJsonFile');

  // Map
  setEl('gridFrame','gridFrame');
  setEl('grid','grid');
  setEl('axisTop','axisTop');
  setEl('axisBottom','axisBottom');
  setEl('axisLeft','axisLeft');
  setEl('axisRight','axisRight');
  setEl('occupiedBadge','occupiedBadge');

  // Dialogs
  setEl('cellDialog','cellDialog');
  setEl('cellTitle','cellTitle');
  setEl('dName','dName');
  setEl('dLot','dLot');
  setEl('dExpiry','dExpiry');

  setEl('colDialog','colDialog');
  setEl('colSelect','colSelect');
  setEl('colCancel','colCancel');
  setEl('colOk','colOk');

  setEl('tpl','list-item-tpl');
  setEl('editDialog','editDialog');
  setEl('eName','eName');
  setEl('eLot','eLot');
  setEl('eExpiry','eExpiry');
  setEl('eCancel','eCancel');
  setEl('eSave','eSave');

  // Stats
  setEl('statsSummary','statsSummary');
  setEl('statsTopAdded','statsTopAdded');
  setEl('statsTopRemoved','statsTopRemoved');
  setEl('statsAvgDwell','statsAvgDwell');
  setEl('statsListSkull','statsListSkull');
  setEl('statsListRed','statsListRed');
  setEl('statsListYellow','statsListYellow');
  setEl('statsListGreen','statsListGreen');

  // Modal
  setEl('modal','notification-modal');
  setEl('modalTitle','modalTitle');
  setEl('modalMessage','modalMessage');
  setEl('modalConfirmBtn','modalConfirmBtn');
  setEl('modalCancelBtn','modalCancelBtn');

  // Install
  setEl('installBar','installBar');
  setEl('installBtn','installBtn');

  return el;
}

export function checkUI(){
  const required = ['tabLista','tabMappa','tabStats','viewLista','viewMappa','viewStats','grid','axisTop','axisLeft'];
  const missing = required.filter(k => !el[k]);
  if (missing.length){
    console.warn('[IO Sano][UI] Missing DOM elements:', missing);
  } else {
    console.log('[IO Sano][UI] Core DOM OK');
  }
  return missing;
}

export function updateUndoButton(hasUndo){
  if (!el.undoBtn) return;
  el.undoBtn.style.display = hasUndo ? 'inline-flex' : 'none';
}

export function closeCellDialogSafely(){
  try{
    const cd = el.cellDialog;
    if(!cd) return;
    try { cd.close(); } catch(e) {}
    try { cd.open = false; } catch(e) {}
    cd.removeAttribute('open');
    cd.style.display = 'none';
    setTimeout(() => { cd.style.display = ''; }, 0);
  }catch(e){}
}

export function showNotification(title, message, isConfirm, onConfirm){
  if (!el.modal || !el.modalTitle || !el.modalMessage || !el.modalConfirmBtn || !el.modalCancelBtn){
    console.warn('[IO Sano] Modal missing:', title, message);
    return;
  }

  el.modalTitle.textContent = String(title ?? '');
  el.modalMessage.textContent = String(message ?? '');

  if (isConfirm) {
    el.modalConfirmBtn.style.display = 'inline-flex';
    el.modalCancelBtn.style.display = 'inline-flex';
    el.modalConfirmBtn.textContent = 'OK';

    el.modalConfirmBtn.onclick = () => {
      el.modal.classList.remove('show');
      if (onConfirm) onConfirm();
      closeCellDialogSafely();
    };
    el.modalCancelBtn.onclick = () => { el.modal.classList.remove('show'); };
  } else {
    el.modalConfirmBtn.style.display = 'inline-flex';
    el.modalCancelBtn.style.display = 'none';
    el.modalConfirmBtn.textContent = 'Chiudi';
    el.modalConfirmBtn.onclick = () => { el.modal.classList.remove('show'); };
  }

  el.modal.classList.add('show');
}
