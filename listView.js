/* ================================
   LIST VIEW – MODALITÀ PRELIEVO A PULSANTE
   ================================ */

let listMode = 'normal'; // 'normal' | 'prelievo'

function renderList() {
  const container = document.getElementById('listView');
  if (!container) return;

  container.innerHTML = '';

  // PULSANTE MODALITÀ PRELIEVO
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'prelievoToggleBtn';
  toggleBtn.style.margin = '10px 0';
  toggleBtn.style.padding = '8px 12px';
  toggleBtn.style.fontWeight = 'bold';
  toggleBtn.textContent =
    listMode === 'prelievo' ? 'Torna alla Lista' : 'Vai in Prelievo';

  toggleBtn.onclick = () => {
    listMode = listMode === 'normal' ? 'prelievo' : 'normal';
    renderList();
  };

  container.appendChild(toggleBtn);

  // ===== MODALITÀ PRELIEVO =====
  if (listMode === 'prelievo') {
    const section = document.createElement('div');
    section.className = 'list-section';

    const title = document.createElement('h3');
    title.textContent = 'Prodotti in Prelievo';
    section.appendChild(title);

    const prelievo = state.products.filter(p => p.inPrelievo);

    if (prelievo.length === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'Nessun prodotto in prelievo';
      empty.style.opacity = '0.7';
      section.appendChild(empty);
    } else {
      prelievo.forEach(p => {
        section.appendChild(renderProductRow(p));
      });
    }

    container.appendChild(section);
    return;
  }

  // ===== RENDER NORMALE (INVARIATO) =====
  const scaffaleSection = document.createElement('div');
  scaffaleSection.className = 'list-section';
  const st = document.createElement('h3');
  st.textContent = 'Prodotti su Scaffale';
  scaffaleSection.appendChild(st);

  const terraSection = document.createElement('div');
  terraSection.className = 'list-section';
  const tt = document.createElement('h3');
  tt.textContent = 'Prodotti a Terra';
  terraSection.appendChild(tt);

  state.products.forEach(p => {
    if (p.col == null) scaffaleSection.appendChild(renderProductRow(p));
    else terraSection.appendChild(renderProductRow(p));
  });

  container.appendChild(scaffaleSection);
  container.appendChild(terraSection);
}
