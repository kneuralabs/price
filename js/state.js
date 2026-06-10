import {ROLES,MODS} from './data.js';

/* Single mutable store. UI modules write here; calc.js only reads. */
export const state={
  rates:ROLES.map(r=>r.rate),
  hrs:MODS.map(m=>[...m.h]),
  fte:ROLES.map(()=>1),
  active:new Set(MODS.map((_,i)=>i)),
  selRoles:new Set(ROLES.map((_,i)=>i)),
};

export function selCols(){return [...state.selRoles].sort((a,b)=>a-b);}
