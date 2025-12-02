// js/equipped.js simplified
import * as Inventory from './inventory.js';
export function init(){ Inventory.subscribe(state=>{ /* render if needed */ }); }