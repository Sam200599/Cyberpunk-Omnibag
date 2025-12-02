// js/inventory.js - simple persistent inventory using localStorage
import * as Storage from './storage.js';
function uuid(){ return 'id-'+Math.random().toString(36).slice(2,10) }
let state = null, subs=new Set();
function defaultState(){ return {version:1,backpacks:{}} }
export async function init(){ const s = await Storage.loadState(); state = s? {...defaultState(),...s} : defaultState(); notify(); return state; }
function notify(){ for(const s of subs) try{s(state)}catch(e){} }
export function subscribe(fn){ subs.add(fn); fn(state); }
export function getAllBags(){ return Object.values(state.backpacks) }
export function getBag(id){ return state.backpacks[id]||null }
export function createBag({name='Mochila'}={}){ const id=uuid(); state.backpacks[id]={id,name,items:[]}; Storage.saveState(null,state); notify(); return state.backpacks[id]; }
export function addItemToBag(bagId,item,opts={}){ const bag=getBag(bagId); if(!bag) throw new Error('bag not found'); const inst={iid:uuid(),name:item.name||'Unnamed',description:item.description||'',category:item.category||'default',image:item.image||null,qty:item.qty||1,meta:item.meta||{}}; bag.items.push(inst); Storage.saveState(null,state); notify(); return inst }
export function exportData(){ return JSON.stringify(state,null,2) }
export function importData(json,{merge=false}={}){ const parsed = typeof json==='string'?JSON.parse(json):json; if(!merge) state = parsed; else state.backpacks = Object.assign({}, state.backpacks||{}, parsed.backpacks||{}); Storage.saveState(null,state); notify(); return true }
export default { init, subscribe, getAllBags, getBag, createBag, addItemToBag, exportData, importData }