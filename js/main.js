// js/main.js updated - Export/Import implemented per user choices
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

function downloadFile(filename, content){
  const blob = new Blob([content], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function exportChoice(){
  const bags = Inventory.getAllBags();
  if(!bags || bags.length===0){
    alert('Nenhuma mochila para exportar.');
    return;
  }
  const choose = prompt('Exportar (1) Mochila selecionada, (2) Todas as mochilas? Digite 1 ou 2','1');
  if(!choose) return;
  if(choose.trim()==='1'){
    const names = bags.map((b,i)=> (i+1)+': '+b.name).join('\n');
    const sel = prompt('Escolha a mochila para exportar (digite o número):\n'+names);
    const idx = Number(sel)-1;
    if(isNaN(idx) || idx<0 || idx>=bags.length){ alert('Seleção inválida'); return; }
    const bag = bags[idx];
    const payload = { exportedAt: new Date().toISOString(), type: 'single-bag', bagId: bag.id, bag: bag, meta: { exportedBy: 'Cyberpunk Omnibag' } };
    downloadFile('omnibag-export.json', JSON.stringify(payload, null, 2));
  } else {
    const payload = { exportedAt: new Date().toISOString(), type:'all-bags', backpacks: {} };
    for(const b of bags) payload.backpacks[b.id]=b;
    downloadFile('omnibag-export.json', JSON.stringify(payload, null, 2));
  }
}

async function importChoice(){
  const input = $qs('#import-file');
  if(!input) return;
  input.onchange = async (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    try{
      const text = await f.text();
      const parsed = JSON.parse(text);
      // validation per user's request
      const v = Inventory.validateImportStructure(parsed);
      if(!v.ok){ alert('Validação falhou: '+v.message); input.value=''; return; }
      const choice = prompt('Deseja (1) Substituir todo o inventário, (2) Mesclar com o atual? Digite 1 ou 2','2');
      if(!choice) { input.value=''; return; }
      if(choice.trim()==='1'){
        if(parsed.type==='single-bag'){
          const newState = {version:1,backpacks:{}};
          const bag = parsed.bag || parsed.backpack || parsed;
          newState.backpacks[bag.id || ('bag-'+Date.now())] = bag;
          Inventory.importData(JSON.stringify(newState), {merge:false});
        } else if(parsed.type==='all-bags'){
          const newState = {version:1,backpacks: parsed.backpacks || {}};
          Inventory.importData(JSON.stringify(newState), {merge:false});
        } else {
          alert('Tipo desconhecido.'); input.value=''; return;
        }
        alert('Importação concluída (substituído).');
      } else {
        if(parsed.type==='single-bag'){
          const bag = parsed.bag || parsed.backpack || parsed;
          const created = Inventory.createBag({name: bag.name||'Imported Bag'});
          for(const it of (bag.items||[])){
            Inventory.addItemToBag(created.id, it, {forceNoStack:true});
          }
        } else if(parsed.type==='all-bags'){
          for(const bid of Object.keys(parsed.backpacks||{})){
            const b = parsed.backpacks[bid];
            const created = Inventory.createBag({name: b.name||'Imported Bag'});
            for(const it of (b.items||[])){
              Inventory.addItemToBag(created.id, it, {forceNoStack:true});
            }
          }
        } else {
          alert('Formato não reconhecido para merge.'); input.value=''; return;
        }
        alert('Importação concluída (mesclado).');
      }
    }catch(err){
      console.error(err);
      alert('Erro ao ler o arquivo. Verifique se é um JSON válido.');
    } finally {
      input.value='';
    }
  };
  input.click();
}

function initExportImport(){
  $qs('#btn-export').addEventListener('click', exportChoice);
  $qs('#btn-import').addEventListener('click', importChoice);
}

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