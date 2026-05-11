// ============================================================
//  CARRINHO — app.js
// ============================================================

// ── State ────────────────────────────────────────────────────
let items       = [];
let favorites   = [];   // starts empty; user builds it by starring items
let history     = [];
let compareData = [];
let activeTab   = 'all';
let darkMode    = false;

// ── Persistence ──────────────────────────────────────────────
function load() {
  try {
    const d = localStorage.getItem('carrinho_v4');
    if (d) {
      const p    = JSON.parse(d);
      items       = p.items       || [];
      favorites   = p.favorites   || [];
      history     = p.history     || [];
      compareData = p.compareData || [];
      darkMode    = p.darkMode    || false;
    }
  } catch(e) { console.warn('Erro ao carregar:', e); }
}
function save() {
  try {
    localStorage.setItem('carrinho_v4', JSON.stringify({ items, favorites, history, compareData, darkMode }));
  } catch(e) { console.warn('Erro ao salvar:', e); }
}

// ── Price for one item (unit price × qty count) ───────────────
function itemTotal(it) {
  return (it.price || 0) * (it.qtyCount || 1);
}

// ── Notify ───────────────────────────────────────────────────
function notify(msg) {
  const n = document.getElementById('notif');
  n.textContent = msg;
  n.classList.add('show');
  clearTimeout(n._t);
  n._t = setTimeout(() => n.classList.remove('show'), 2400);
}

// ── Theme ────────────────────────────────────────────────────
function toggleTheme() {
  darkMode = !darkMode;
  applyTheme();
  save();
}
function applyTheme() {
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : '');
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = darkMode ? '☀️' : '🌙';
}

// ── Add item ─────────────────────────────────────────────────
function addItem() {
  const name = document.getElementById('inp-name').value.trim();
  if (!name) { notify('⚠️ Digite o nome do produto'); return; }

  const cat      = document.getElementById('inp-cat').value;
  const qty      = document.getElementById('inp-qty').value.trim();
  const priceRaw = document.getElementById('inp-price').value;
  const price    = priceRaw ? parseFloat(priceRaw) : null;

  items.push({
    id: Date.now(),
    name,
    cat,
    qty,         // label string e.g. "2 kg"
    qtyCount: 1, // stepper count
    price,       // unit price
    bought: false,
    fav: false,
  });

  document.getElementById('inp-name').value  = '';
  document.getElementById('inp-qty').value   = '';
  document.getElementById('inp-price').value = '';
  document.getElementById('inp-name').focus();

  save();
  renderList();
  notify('✅ ' + name + ' adicionado!');
}

// ── Toggle bought ────────────────────────────────────────────
function toggleBought(id) {
  const it = items.find(i => i.id === id);
  if (it) { it.bought = !it.bought; save(); renderList(); }
}

// ── Delete item ──────────────────────────────────────────────
function deleteItem(id) {
  const it = items.find(i => i.id === id);
  items = items.filter(i => i.id !== id);
  save(); renderList();
  if (it) notify('🗑️ ' + it.name + ' removido');
}

// ── Toggle favourite ─────────────────────────────────────────
// Starring saves the item to favorites[]. Unstarring removes it.
function toggleFav(id) {
  const it = items.find(i => i.id === id);
  if (!it) return;
  it.fav = !it.fav;

  if (it.fav) {
    const already = favorites.find(f => f.name.toLowerCase() === it.name.toLowerCase());
    if (!already) favorites.push({ name: it.name, cat: it.cat, qty: it.qty, price: it.price });
    notify('⭐ ' + it.name + ' salvo nos favoritos!');
  } else {
    favorites = favorites.filter(f => f.name.toLowerCase() !== it.name.toLowerCase());
    notify('✕ ' + it.name + ' removido dos favoritos');
  }

  save(); renderList();
}

// ── Remove favourite from chip bar ──────────────────────────
function removeFav(idx, e) {
  e.stopPropagation();
  const fav = favorites[idx];
  if (!fav) return;
  items.forEach(i => { if (i.name.toLowerCase() === fav.name.toLowerCase()) i.fav = false; });
  favorites.splice(idx, 1);
  save(); renderList();
  notify('✕ ' + fav.name + ' removido dos favoritos');
}

// ── Quick-add from favourite chip ────────────────────────────
function quickAdd(idx) {
  const fav = favorites[idx];
  if (!fav) return;
  items.push({
    id: Date.now(),
    name: fav.name,
    cat: fav.cat || '🥫 Mercearia',
    qty: fav.qty || '',
    qtyCount: 1,
    price: fav.price || null,
    bought: false,
    fav: true,
  });
  save(); renderList();
  notify('⚡ ' + fav.name + ' adicionado!');
}

// ── Quantity stepper — patches DOM without full re-render ─────
function changeQty(id, delta) {
  const it = items.find(i => i.id === id);
  if (!it) return;
  it.qtyCount = Math.max(1, (it.qtyCount || 1) + delta);
  save();

  const countEl  = document.getElementById('qc-' + id);
  const priceEl  = document.getElementById('ip-' + id);
  const minusBtn = document.getElementById('qminus-' + id);
  if (countEl)  countEl.textContent = it.qtyCount;
  if (priceEl)  priceEl.textContent = 'R$\u00a0' + itemTotal(it).toFixed(2).replace('.', ',');
  if (minusBtn) minusBtn.disabled   = it.qtyCount <= 1;

  updateTotals();
}

// ── Recalculate totals ────────────────────────────────────────
function updateTotals() {
  const totalPrice  = items.reduce((s, i) => s + itemTotal(i), 0);
  const boughtPrice = items.filter(i => i.bought).reduce((s, i) => s + itemTotal(i), 0);

  document.getElementById('total-val').textContent = 'R$\u00a0' + totalPrice.toFixed(2).replace('.', ',');

  const ps = document.getElementById('price-summary');
  if (totalPrice > 0) {
    ps.innerHTML = `<div class="price-card">
      <div class="price-row"><span class="price-key">💰 Total estimado</span><span class="price-val green">R$&nbsp;${totalPrice.toFixed(2).replace('.',',')}</span></div>
      <div class="price-row"><span class="price-key">✅ Já comprado</span><span class="price-val">R$&nbsp;${boughtPrice.toFixed(2).replace('.',',')}</span></div>
      <div class="price-row"><span class="price-key">🛒 Restante</span><span class="price-val">R$&nbsp;${(totalPrice - boughtPrice).toFixed(2).replace('.',',')}</span></div>
    </div>`;
  } else {
    ps.innerHTML = '';
  }
}

// ── Clear bought ─────────────────────────────────────────────
function clearBought() {
  const count = items.filter(i => i.bought).length;
  if (!count) { notify('Nenhum item comprado ainda'); return; }
  items = items.filter(i => !i.bought);
  save(); renderList();
  notify('🗑️ ' + count + ' itens removidos');
}

// ── Tab filter ───────────────────────────────────────────────
function setTab(t, el) {
  activeTab = t;
  document.querySelectorAll('.tab').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  renderList();
}

// ── Main render ──────────────────────────────────────────────
function renderList() {
  const q = (document.getElementById('search').value || '').toLowerCase();
  let filtered = items.filter(i =>
    !q || i.name.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q)
  );
  if (activeTab !== 'all') filtered = filtered.filter(i => i.cat === activeTab);

  const all = [...filtered.filter(i => !i.bought), ...filtered.filter(i => i.bought)];

  // ── progress
  const totalCount = items.length;
  const boughtCnt  = items.filter(i => i.bought).length;
  const pct        = totalCount ? Math.round(boughtCnt / totalCount * 100) : 0;
  document.getElementById('prog-text').textContent = boughtCnt + '/' + totalCount + ' itens comprados';
  document.getElementById('prog-pct').textContent  = pct + '%';
  document.getElementById('prog-fill').style.width = pct + '%';

  updateTotals();

  // ── favourite chips
  const chipsEl = document.getElementById('quick-chips');
  if (favorites.length === 0) {
    chipsEl.innerHTML = '<span class="fav-hint">Toque ⭐ em um produto para salvá-lo aqui</span>';
  } else {
    chipsEl.innerHTML = favorites.map((f, idx) =>
      `<div class="chip-wrap">
        <button class="chip" onclick="quickAdd(${idx})">
          ${f.name}${f.price != null
            ? '<span class="chip-price">R$\u00a0' + f.price.toFixed(2).replace('.', ',') + '</span>'
            : ''}
        </button>
        <button class="chip-del" onclick="removeFav(${idx},event)" title="Remover dos favoritos">✕</button>
      </div>`
    ).join('');
  }

  // ── item list
  const container = document.getElementById('list-container');
  if (all.length === 0) {
    container.innerHTML = `<div class="empty">
      <span class="empty-emoji">🛒</span>
      <div class="empty-text">Nenhum item encontrado.<br>Adicione seu primeiro produto!</div>
    </div>`;
    return;
  }

  const groups = {};
  all.forEach(i => { if (!groups[i.cat]) groups[i.cat] = []; groups[i.cat].push(i); });

  let html = '';
  for (const [cat, its] of Object.entries(groups)) {
    const [em, ...rest] = cat.split(' ');
    const doneCount = its.filter(i => i.bought).length;
    html += `<div class="cat-group">
      <div class="cat-header">
        <span class="cat-emoji">${em}</span>
        <span class="cat-name">${rest.join(' ')}</span>
        <span class="cat-count">${doneCount}/${its.length}</span>
      </div>`;

    its.forEach(i => {
      const count = i.qtyCount || 1;
      const tot   = itemTotal(i);

      // meta: show qty label and/or stepper count
      let meta = '';
      if (i.qty && count > 1)  meta = i.qty + ' × ' + count;
      else if (i.qty)          meta = i.qty;
      else if (count > 1)      meta = count + ' unidades';

      html += `<div class="item ${i.bought ? 'bought' : ''}">
        <div class="item-check ${i.bought ? 'checked' : ''}" onclick="toggleBought(${i.id})"></div>
        <div class="item-body">
          <div class="item-name">${i.name}</div>
          ${meta ? `<div class="item-meta">${meta}</div>` : ''}
        </div>
        <div class="qty-stepper">
          <button class="qty-btn" id="qminus-${i.id}" onclick="changeQty(${i.id},-1)"${count <= 1 ? ' disabled' : ''}>−</button>
          <span class="qty-count" id="qc-${i.id}">${count}</span>
          <button class="qty-btn" onclick="changeQty(${i.id},1)">+</button>
        </div>
        ${i.price != null
          ? `<div class="item-price" id="ip-${i.id}">R$&nbsp;${tot.toFixed(2).replace('.', ',')}</div>`
          : ''}
        <div class="item-actions">
          <button class="item-fav ${i.fav ? 'active' : ''}" onclick="toggleFav(${i.id})" title="${i.fav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}">⭐</button>
          <button class="item-del" onclick="deleteItem(${i.id})" title="Remover item">🗑️</button>
        </div>
      </div>`;
    });
    html += '</div>';
  }
  container.innerHTML = html;
}

// ── Panels ───────────────────────────────────────────────────
function showPanel(name) {
  const el = document.getElementById('panel-' + name);
  if (el) { el.style.display = 'block'; document.body.style.overflow = 'hidden'; }
  if (name === 'history') renderHistory();
  if (name === 'compare') renderCompare();
}
function closePanel(name) {
  const el = document.getElementById('panel-' + name);
  if (el) { el.style.display = 'none'; document.body.style.overflow = ''; }
}

// ── History ──────────────────────────────────────────────────
function saveCurrentList() {
  if (items.length === 0) { notify('⚠️ Lista vazia!'); return; }
  const name = prompt('Nome desta lista (ex: Compra do mês, Churrasco):');
  if (!name) return;
  history.unshift({
    id: Date.now(), name,
    date: new Date().toLocaleDateString('pt-BR'),
    items: JSON.parse(JSON.stringify(items)),
    total: items.reduce((s, i) => s + itemTotal(i), 0),
  });
  if (history.length > 15) history.pop();
  save(); renderHistory();
  notify('💾 "' + name + '" salva!');
}
function loadHistory(id) {
  const h = history.find(h => h.id === id);
  if (!h) return;
  if (confirm('Carregar "' + h.name + '"?\nIsso substituirá a lista atual.')) {
    items = JSON.parse(JSON.stringify(h.items));
    save(); renderList(); closePanel('history');
    notify('📋 "' + h.name + '" carregada!');
  }
}
function deleteHistory(id) {
  history = history.filter(h => h.id !== id);
  save(); renderHistory();
  notify('🗑️ Lista removida');
}
function renderHistory() {
  const c = document.getElementById('hist-content');
  if (history.length === 0) {
    c.innerHTML = '<div class="empty"><span class="empty-emoji">📋</span><div class="empty-text">Nenhum histórico ainda.<br>Salve sua lista atual!</div></div>';
    return;
  }
  c.innerHTML = history.map(h => `
    <div class="hist-item">
      <div class="hist-icon">🛒</div>
      <div class="hist-body">
        <div class="hist-name">${h.name}</div>
        <div class="hist-meta">${h.date} · ${h.items.length} itens${h.total ? ' · R$\u00a0' + h.total.toFixed(2).replace('.', ',') : ''}</div>
      </div>
      <div class="hist-actions">
        <button class="hist-load" onclick="loadHistory(${h.id})">Carregar</button>
        <button class="hist-del" onclick="deleteHistory(${h.id})">✕</button>
      </div>
    </div>`).join('');
}

// ── Price comparison ─────────────────────────────────────────
function addCompare() {
  const prod  = document.getElementById('cmp-prod').value.trim();
  const mkt   = document.getElementById('cmp-mkt').value.trim();
  const price = parseFloat(document.getElementById('cmp-price').value);
  if (!prod || !mkt || !price) { notify('⚠️ Preencha todos os campos'); return; }
  compareData.push({ id: Date.now(), prod, mkt, price });
  document.getElementById('cmp-prod').value  = '';
  document.getElementById('cmp-mkt').value   = '';
  document.getElementById('cmp-price').value = '';
  save(); renderCompare();
}
function deleteCompare(id) {
  compareData = compareData.filter(d => d.id !== id);
  save(); renderCompare();
}
function renderCompare() {
  const c = document.getElementById('compare-content');
  if (compareData.length === 0) {
    c.innerHTML = '<div class="empty"><span class="empty-emoji">🏷️</span><div class="empty-text">Adicione preços de diferentes mercados!</div></div>';
    return;
  }
  const grouped = {};
  compareData.forEach(d => { if (!grouped[d.prod]) grouped[d.prod] = []; grouped[d.prod].push(d); });
  let html = '';
  for (const [prod, entries] of Object.entries(grouped)) {
    const sorted = [...entries].sort((a, b) => a.price - b.price);
    html += `<div class="mkt-row"><div class="section-label" style="padding:0 0 8px">${prod}</div>`;
    sorted.forEach((e, i) => {
      const medals = ['🏆','🥈','🥉'];
      html += `<div class="mkt-card">
        <span style="font-size:20px">${medals[i] || '▪'}</span>
        <span class="mkt-name">${e.mkt}</span>
        <span class="mkt-price">R$&nbsp;${e.price.toFixed(2).replace('.', ',')}</span>
        ${i === 0 ? '<span class="mkt-badge">Mais barato</span>' : ''}
        <button class="mkt-del" onclick="deleteCompare(${e.id})">✕</button>
      </div>`;
    });
    html += '</div>';
  }
  c.innerHTML = html;
}

// ── Share ────────────────────────────────────────────────────
function shareList() {
  const pending = items.filter(i => !i.bought);
  const bought  = items.filter(i => i.bought);
  let text = '🛒 Lista de Compras\n\n';
  if (pending.length) {
    text += '📝 Pendente:\n';
    pending.forEach(i => {
      const count = i.qtyCount || 1;
      const label = i.qty ? (count > 1 ? count + 'x ' + i.qty : i.qty) : (count > 1 ? count + 'x' : '');
      text += '  ' + i.name + (label ? ' (' + label + ')' : '') + (i.price ? ' — R$ ' + itemTotal(i).toFixed(2) : '') + '\n';
    });
  }
  if (bought.length) {
    text += '\n✅ Comprado:\n';
    bought.forEach(i => { text += '  ✓ ' + i.name + '\n'; });
  }
  const total = items.reduce((s, i) => s + itemTotal(i), 0);
  if (total > 0) text += '\n💰 Total: R$ ' + total.toFixed(2).replace('.', ',');

  if (navigator.share) {
    navigator.share({ title: 'Lista de Compras', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text)
      .then(() => notify('📋 Lista copiada!'))
      .catch(() => notify('❌ Erro ao compartilhar'));
  }
}

// ── PWA install ──────────────────────────────────────────────
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('install-banner').style.display = 'flex';
});
function installApp() {
  if (!deferredPrompt) { notify('💡 Use o menu do navegador para instalar'); return; }
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(() => {
    deferredPrompt = null;
    document.getElementById('install-banner').style.display = 'none';
  });
}
window.addEventListener('appinstalled', () => {
  notify('🎉 App instalado!');
  document.getElementById('install-banner').style.display = 'none';
});

// ── Keyboard shortcuts ───────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') ['history', 'compare'].forEach(p => closePanel(p));
});

// ── Init ─────────────────────────────────────────────────────
load();
applyTheme();
renderList();