// main.js for Omnibag iframe layout
import * as Inventory from './inventory.js';
import * as Storage from './storage.js';
import * as Loot from './loot.js';

function $qs(s, r=document){return r.querySelector(s)}
function $qsa(s, r=document){return [...r.querySelectorAll(s)]}

function initSideButtons(){
  const btns = $qsa('.side-btn');
  btns.forEach(b=>{
    b.addEventListener('click', ()=>{
      btns.forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const panel = b.dataset.panel;
      $qs('#panel-iframe').src = panel;
      $qs('#panel-title').textContent = b.textContent.trim();
    });
  });
}

function initExportImport(){
  $qs('#btn-export').addEventListener('click', ()=>{
    const data = Inventory.exportData();
    const blob = new Blob([data], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'omnibag-export.json'; a.click();
  });
  $qs('#btn-import').addEventListener('click', ()=> $qs('#import-file').click());
  $qs('#import-file').addEventListener('change', async (e)=>{
    const f = e.target.files[0]; if(!f) return;
    const text = await f.text(); Inventory.importData(text, {merge:true}); alert('Importado'); location.reload();
  });
}

// receive messages from iframes (panels)
window.addEventListener('message', async (evt)=>{
  try{
    const data = evt.data || {};
    if(data && data.omnibag==='generateLoot'){
      if(Loot && Loot.generateLootToScene) await Loot.generateLootToScene([], 1, {});
      alert('Solicitado gerar loot (simulação).');
    }
  }catch(e){ console.error(e) }
});

async function boot(){
  await Inventory.init();
  initSideButtons();
  initExportImport();
}

document.addEventListener('DOMContentLoaded', ()=> boot());