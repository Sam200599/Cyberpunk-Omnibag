// js/main.js - Owlbear 2.0 compatible orchestrator
import * as Inventory from './inventory.js';
import * as Equipped from './equipped.js';
import * as Loot from './loot.js';
import * as Tables from './tables.js';
import * as Storage from './storage.js';

function $qs(sel, root=document) { return root.querySelector(sel); }
function $qsa(sel, root=document) { return [...root.querySelectorAll(sel)]; }

function initTabs() {
  const tabs = $qsa('.omnibag-nav .tab');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      $qsa('.tab-panel').forEach(p => p.classList.add('hidden'));
      $qs('#tab-' + tab).classList.remove('hidden');
    });
  });
}

function initButtons() {
  $qs('#btn-new-bag').addEventListener('click', () => {
    const name = prompt('Nome da nova mochila:') || 'Mochila';
    Inventory.createBag({name});
    renderBags();
  });

  $qs('#btn-export-json').addEventListener('click', () => {
    const data = Inventory.exportData();
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'omnibag-export.json'; a.click();
  });

  $qs('#btn-export-zip').addEventListener('click', async () => {
    if (Storage && Storage.exportZIP) await Storage.exportZIP();
    else alert('ZIP export not available.');
  });

  $qs('#import-json-file').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const text = await f.text();
    Inventory.importData(text, {merge:true});
    alert('Importado');
    renderBags();
  });
}

function renderBags() {
  const list = $qs('#bags-list');
  list.innerHTML = '';
  const bags = Inventory.getAllBags();
  for (const b of bags) {
    const el = document.createElement('div');
    el.className = 'bag-entry';
    el.textContent = b.name + ' (' + (b.items.length||0) + ')';
    el.dataset.bid = b.id;
    el.addEventListener('click', () => {
      selectBag(b.id);
    });
    list.appendChild(el);
  }
}

let selectedBagId = null;
function selectBag(bid) {
  selectedBagId = bid;
  renderSelectedBag();
}

function renderSelectedBag() {
  const grid = $qs('#inventory-grid');
  grid.innerHTML = '';
  if (!selectedBagId) return;
  const bag = Inventory.getBag(selectedBagId);
  if (!bag) return;
  for (const item of bag.items) {
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = `<div class="item-img"><img src="${item.image||'/assets/icons/equip.svg'}" style="width:100%;height:100%;object-fit:contain"/></div><div class="item-name">${item.name}</div><div class="item-qty">${item.qty}</div>`;
    grid.appendChild(el);
    el.addEventListener('click', ()=>{
      $qs('#edit-name').value = item.name;
      $qs('#edit-desc').value = item.description;
      $qs('#edit-cat').value = item.category||'default';
      $qs('#item-editor').classList.remove('hidden');
      $qs('#save-item').onclick = ()=>{
        Inventory.updateItemInstance(selectedBagId, item.iid, {name:$qs('#edit-name').value, description:$qs('#edit-desc').value, category:$qs('#edit-cat').value});
        $qs('#item-editor').classList.add('hidden');
        renderSelectedBag();
      };
    });
  }
}

async function boot() {
  await Inventory.init();
  initTabs();
  initButtons();
  renderBags();
  Inventory.subscribe(() => { renderBags(); if (selectedBagId) renderSelectedBag(); });
  Equipped.init();
  Loot.init();
  Tables.init();
}

document.addEventListener('DOMContentLoaded', () => {
  boot();
});