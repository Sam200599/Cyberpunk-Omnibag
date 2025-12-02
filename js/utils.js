// js/utils.js simple helpers
export function randomRange(min,max){min=Math.floor(min);max=Math.floor(max);return Math.floor(Math.random()*(max-min+1))+min;}
export function rollXdY(spec){ if(!spec) return 0; const m=String(spec).match(/(\d+)d(\d+)/i); if(!m) return Number(spec)||0; let total=0; for(let i=0;i<Number(m[1]);i++) total+=randomRange(1,Number(m[2])); return total; }