// js/loot.js - simplified bridge for scene token creation (uses OBR.scene if available)
export async function generateLootToScene(folderFiles, count=1, opts={}){
  if(window.OBR && OBR.scene && OBR.scene.items && OBR.scene.items.add){
    const view = await OBR.scene.getView();
    for(let i=0;i<count;i++){
      const token = { type:'IMAGE', visible:false, position:{x:view.position.x,y:view.position.y}, image:{url:folderFiles[0]?.url||'assets/icons/loot.svg', width:64, height:64}, metadata:{'cyberpunk-omnibag':{}} };
      await OBR.scene.items.add([token]);
    }
    return true;
  } else {
    console.warn('OBR.scene not available'); return false;
  }
}
export default { generateLootToScene }