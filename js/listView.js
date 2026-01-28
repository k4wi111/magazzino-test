let prelievoMode = false;

const el = {
  listUnplaced: document.getElementById("listUnplaced"),
  listPlaced: document.getElementById("listPlaced"),
  listPrelievo: document.getElementById("listPrelievo"),
  prelievoCard: document.getElementById("prelievoCard"),
  cardScaffale: document.getElementById("cardScaffale"),
  cardTerra: document.getElementById("cardTerra"),
};

function initPrelievoToggle() {
  const t = document.getElementById("togglePrelievo");
  if (!t) return;
  t.onchange = () => {
    prelievoMode = t.checked;
    scheduleRenderList();
  };
}

function createListItem(p) {
  const div = document.createElement("div");
  div.className = "product";
  div.textContent = p.name + (p.inPrelievo ? " (PRELIEVO)" : "");
  return div;
}

function renderList() {
  el.listUnplaced.innerHTML = "";
  el.listPlaced.innerHTML = "";
  el.listPrelievo.innerHTML = "";

  if (prelievoMode) {
    el.prelievoCard.style.display = "block";
    el.cardScaffale.style.display = "none";
    el.cardTerra.style.display = "none";

    S.products.forEach(p => {
      if (p.inPrelievo) {
        el.listPrelievo.appendChild(createListItem(p));
      }
    });
    return;
  }

  el.prelievoCard.style.display = "none";
  el.cardScaffale.style.display = "";
  el.cardTerra.style.display = "";

  S.products.forEach(p => {
    if (p.col == null) el.listUnplaced.appendChild(createListItem(p));
    else el.listPlaced.appendChild(createListItem(p));
  });
}

document.addEventListener("DOMContentLoaded", initPrelievoToggle);
