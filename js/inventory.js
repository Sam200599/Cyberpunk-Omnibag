// js/inventory.js - Owlbear 2.0 simplified core
import * as Storage from './storage.js';
function uuidv4(){ if(window.crypto && crypto.randomUUID) return crypto.randomUUID(); return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){const r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8);return v.toString(16);}); }
let state=null, subs=new Set();
function defaultState(){ return {version:1,categories:[{id:'default',name:'Default',color:'#888888'}],backpacks:{}}; }
export async function init(){ const s = await Storage.loadState(); state = s? {...defaultState(), ...s} : defaultState(); notify(); return state; }
function notify(){ for(const s of subs) try{s(state);}catch(e){} }
export function subscribe(fn){ subs.add(fn); fn(state); }
export function getAllBags(){ return Object.values(state.backpacks); }
export function getBag(bid){ return state.backpacks[bid]||null; }
export function createBag({name='Mochila',owner=null,tokenId=null}={}){ const id=uuidv4(); state.backpacks[id]={id,name,owner,tokenId,createdAt:Date.now(),items:[]}; Storage.saveState(null,state); notify(); return state.backpacks[id]; }
export function addItemToBag(bagId,item,opts={}){ const bag=getBag(bagId); if(!bag) throw new Error('Bag not found'); const norm={name:String(item.name||'Unnamed'),description:String(item.description||''),category:item.category||'default',image:item.image||null,meta:item.meta||{},qty:Number(item.qty||1)}; if(!opts.forceNoStack){ for(const inst of bag.items){ if(inst.name===norm.name && (inst.image||'')===(norm.image||'') && JSON.stringify(inst.meta||{})===JSON.stringify(norm.meta||{})){ inst.qty=(inst.qty||1)+norm.qty; Storage.saveState(null,state); notify(); return inst; } } } const iid=uuidv4(); const inst={iid,...norm,createdAt:Date.now(),updatedAt:Date.now()}; bag.items.push(inst); Storage.saveState(null,state); notify(); return inst; }
export function updateItemInstance(bagId,iid,patch){ const bag=getBag(bagId); if(!bag) throw new Error('Bag not found'); const inst=bag.items.find(i=>i.iid===iid); if(!inst) throw new Error('item not found'); Object.assign(inst,patch); inst.updatedAt=Date.now(); Storage.saveState(null,state); notify(); return inst; }
export function exportData(){ return JSON.stringify(state); }
export function importData(json, {merge=false}={}){ const parsed = typeof json==='string'?JSON.parse(json):json; if(!merge){ state = parsed; } else { state.backpacks = Object.assign({}, state.backpacks||{}, parsed.backpacks||{}); } Storage.saveState(null,state); notify(); return true; }
export default { init, subscribe, getAllBags, getBag, createBag, addItemToBag, updateItemInstance, exportData, importData };