import {ROLES,MODS} from './data.js';

function initialState(){
  return {
    rates:ROLES.map(r=>r.rate),
    hrs:MODS.map(m=>[...m.h]),
    fte:ROLES.map(()=>1),
    active:new Set(MODS.map((_,i)=>i)),
    selRoles:new Set(ROLES.map((_,i)=>i)),
  };
}

/* Single mutable store. UI modules write here; calc.js only reads. */
export const state=initialState();

/* Restore the pristine catalog values (used by tests between cases). */
export function resetState(){Object.assign(state,initialState());}

/* Selected role / active module indices in stable catalog order —
   Sets iterate in insertion order, which scrambles after toggling. */
export function selCols(){return [...state.selRoles].sort((a,b)=>a-b);}
export function activeMods(){return [...state.active].sort((a,b)=>a-b);}
