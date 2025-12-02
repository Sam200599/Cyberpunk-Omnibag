// simplified inventory core for package
function uuidv4(){ if(window.crypto && crypto.randomUUID) return crypto.randomUUID(); return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){const r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8);return v.toString(16);}); }
import * as Storage from "./storage.js";
let state=null, subs=new Set();
function defaultState(){ return {version:1,config:{defaultHands:2},categories:[{id:'default',name:'Default',color:'#888888'}],backpacks:{},tables:{},lootFolders:[]}; }
export async function init(){ try{ const s=await Storage.loadState(); state = s? {...defaultState(),...s} : defaultState(); }catch(e){ state=defaultState(); } notify(); return state; }
function notify(){ for(const s of subs) try{s(state);}catch(e){} }
export function subscribe(fn){ subs.add(fn); fn(state); }
export function getAllBags(){ return Object.values(state.backpacks); }
export function getBag(bid){ return state.backpacks[bid]||null; }
export function createBag(opts={}){ const id=uuidv4(); const bag={ id, name: opts.name||'Mochila', owner: opts.owner||null, tokenId: null, createdAt:Date.now(), items:[] }; state.backpacks[id]=bag; Storage.saveState(null,state); notify(); return bag; }
export function addItemToBag(bagId,item,opts={}){ const bag=getBag(bagId); if(!bag) throw new Error('bag not found'); const normalized={ name:String(item.name||'Unnamed'), description:String(item.description||''), category:item.category||'default', image:item.image||null, meta:item.meta||{}, qty:Number(item.qty||1) }; if(!opts.forceNoStack){ for(const inst of bag.items){ if(inst.name===normalized.name && (inst.image||'')===(normalized.image||'') && (inst.description||'')===(normalized.description||'') && (inst.category||'')===(normalized.category||'') && JSON.stringify(inst.meta||{})===JSON.stringify(normalized.meta||{})){ inst.qty=(inst.qty||1)+normalized.qty; Storage.saveState(null,state); notify(); return inst; } } } const iid=uuidv4(); const inst={ iid, ...normalized, createdAt:Date.now(), updatedAt:Date.now() }; bag.items.push(inst); Storage.saveState(null,state); notify(); return inst; }
export function updateItemInstance(bagId,iid,patch){ const bag=getBag(bagId); if(!bag) throw new Error('bag not found'); const inst=bag.items.find(x=>x.iid===iid); if(!inst) throw new Error('item not found'); Object.assign(inst,patch); inst.updatedAt=Date.now(); Storage.saveState(null,state); notify(); return inst; }
export default { init, subscribe, getAllBags, getBag, createBag, addItemToBag, updateItemInstance };