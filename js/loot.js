// js/loot.js - Owlbear 2.0 simplified loot module
import * as Inventory from './inventory.js';
import * as Utils from './utils.js';
export function init(){ console.log('[Loot] init'); }
export async function generateLootToScene(folderFiles, count=1, options={}){
  if (window.OBR && OBR.scene && OBR.scene.items && OBR.scene.items.add){
    const scene = await OBR.scene.getView();
    for(let i=0;i<count;i++){
      const f = folderFiles[Math.floor(Math.random()*folderFiles.length)];
      const token = { type:'IMAGE', visible:false, position:{x:scene.position.x,y:scene.position.y}, image:{url:f.url,width:64,height:64}, metadata:{'cyberpunk-omnibag':{name:f.name}} };
      await OBR.scene.items.add([token]);
    }
    return true;
  } else {
    console.warn('OBR scene API not available in this environment.');
    return false;
  }
}