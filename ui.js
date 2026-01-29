// js/ui.js
'use strict';

import { $ } from './utils.js';

function opt(id){
  const node = $(id);
  return node || null;
}

// Nota: tutti i riferimenti DOM possono essere null se l'HTML cambia.
// Il resto dell'app deve quindi controllare l'esistenza prima di usare gli elementi.
export const el = {
  undoBtn: opt('undoBtn'),

  tabLista: opt('tab-lista'),
  tabMappa: opt('tab-mappa'),
  tabStats: opt('tab-stats'),
  viewLista: opt('view-lista'),
  viewMappa: opt('view-mappa'),
  viewStats: opt('view-stats'),

  name: opt('name'),
  lot: opt('lot'),
  expiry: opt('expiry'),
  clearBtn: opt('clearBtn'),
  saveBtn: opt('saveBtn'),

  search: opt('search'),
  resetSearchBtn: opt('resetSearchBtn'),
  listEmptyState: opt('listEmptyState'),
  listUnplaced: opt('listUnplaced'),
  listPlaced: opt('listPlaced'),

  exportPdfBtn: opt('exportPdfBtn'),
  exportJsonBtn: opt('exportJsonBtn'),
  importJsonFile: opt('importJsonFile'),

  gridFrame: opt('gridFrame'),
  grid: opt('grid'),
  axisTop: opt('axisTop'),
  axisBottom: opt('axisBottom'),
  axisLeft: opt('axisLeft'),
  axisRight: opt('axisRight'),
  occupiedBadge: opt('occupiedBadge'),

  cellDialog: opt('cellDialog'),
  cellTitle: opt('cellTitle'),
  dName: opt('dName'),
  dLot: opt('dLot'),
  dExpiry: opt('dExpiry'),

  colDialog: opt('colDialog'),
  colSelect: opt('colSelect'),
  colCancel: opt('colCancel'),
  colOk: opt('colOk'),

  tpl: opt('list-item-tpl'),
  editDialog: opt('editDialog'),
  eName: opt('eName'),
  eLot: opt('eLot'),
  eExpiry: opt('eExpiry'),
  eCancel: opt('eCancel'),
  eSave: opt('eSave'),

  statsSummary: opt('statsSummary'),
  statsTopAdded: opt('statsTopAdded'),
  statsTopRemoved: opt('statsTopRemoved'),
  statsAvgDwell: opt('statsAvgDwell'),
  statsListSkull: opt('statsListSkull'),
  statsListRed: opt('statsListRed'),
  statsListYellow: opt('statsListYellow'),
  statsListGreen: opt('statsListGreen'),

  modal: opt('notification-modal'),
  modalTitle: opt('modalTitle'),
  modalMessage: opt('modalMessage'),
  modalConfirmBtn: opt('modalConfirmBtn'),
  modalCancelBtn: opt('modalCancelBtn'),

  installBar: opt('installBar'),
  installBtn: opt('installBtn'),
};

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
    // workaround Safari/iOS: forzare repaint per evitare dialog "bloccato"
    cd.style.display = 'none';
    setTimeout(() => { cd.style.display = ''; }, 0);
  }catch(e){}
}

export function showNotification(title, message, isConfirm, onConfirm){
  if (!el.modal || !el.modalTitle || !el.modalMessage || !el.modalConfirmBtn || !el.modalCancelBtn) return;

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
