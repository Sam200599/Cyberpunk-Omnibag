// js/storage.js - minimal wrapper for extension
export async function loadState(){ try{ const raw = localStorage.getItem('CYBERPUNK_OMNIBAG_STATE'); return raw?JSON.parse(raw):null }catch(e){return null} }
export async function saveState(plugin,state){ try{ localStorage.setItem('CYBERPUNK_OMNIBAG_STATE', JSON.stringify(state)); }catch(e){} }
