import {ROLES,MODS} from './data.js';
import {state} from './state.js';

/* Pure calculation layer: reads state + a controls snapshot, never the DOM. */

export function moduleTotals(i){
  let h=0,c=0;
  state.selRoles.forEach(j=>{
    const hh=state.hrs[i][j]*state.fte[j];
    h+=hh;c+=hh*state.rates[j];
  });
  return {h,c};
}

export function roleTotals(j){
  let h=0,c=0;
  MODS.forEach((_,i)=>{
    const hh=state.hrs[i][j]*state.fte[j];
    h+=hh;c+=hh*state.rates[j];
  });
  return {h,c};
}

export function blendedRate(cols){
  return cols.length?cols.reduce((a,j)=>a+state.rates[j],0)/cols.length:0;
}

/* Margin is a share of the fee, not a markup on cost: fee×(1−mg)=cost. */
export function feeFromCost(cost,mg){
  return cost/(1-mg);
}

export function quoteCalc(ctl){
  const {mg,dc,cont,comm,vat,saas,trav}=ctl;
  let tH=0,tC=0;
  const rC=new Array(ROLES.length).fill(0);
  state.active.forEach(i=>state.selRoles.forEach(j=>{
    const h=state.hrs[i][j]*state.fte[j],c=h*state.rates[j];
    tH+=h;tC+=c;rC[j]+=c;
  }));
  const fee=feeFromCost(tC,mg);
  const contAmt=fee*cont;
  const sub=fee+contAmt+saas+trav;
  const afterDisc=sub*(1-dc);
  const commAmt=afterDisc*comm;
  const net=afterDisc+commAmt;
  const vatAmt=net*vat;
  const adj=net+vatAmt;
  const mD=fee-tC,eff=tH?adj/tH:0;
  return {mg,dc,cont,comm,vat,saas,trav,tH,tC,rC,fee,contAmt,commAmt,vatAmt,adj,mD,eff};
}
