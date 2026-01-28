const S = {
  products: [
    { id: 1, name: "Prodotto A", col: null, inPrelievo: false },
    { id: 2, name: "Prodotto B", col: 1, inPrelievo: true },
    { id: 3, name: "Prodotto C", col: 2, inPrelievo: false }
  ]
};

let listQueued = false;

function scheduleRenderList() {
  if (listQueued) return;
  listQueued = true;
  requestAnimationFrame(() => {
    listQueued = false;
    renderList();
  });
}

document.addEventListener("DOMContentLoaded", scheduleRenderList);
