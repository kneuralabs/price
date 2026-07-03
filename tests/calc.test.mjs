import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROLES,MODS} from '../js/data.js';
import {state,resetState,selCols,activeMods} from '../js/state.js';
import {moduleTotals,roleTotals,blendedRate,feeFromCost,quoteCalc} from '../js/calc.js';

/* The store is a module-level singleton shared with the UI layer,
   so every case starts from the pristine catalog. */
beforeEach(resetState);

const ZERO_CTL={mg:0,dc:0,cont:0,comm:0,vat:0,saas:0,trav:0};

test('moduleTotals sums hours and cost across selected roles',()=>{
  const {h,c}=moduleTotals(0);
  const expH=MODS[0].h.reduce((a,b)=>a+b,0);
  const expC=MODS[0].h.reduce((a,hh,j)=>a+hh*ROLES[j].rate,0);
  assert.equal(h,expH);
  assert.equal(c,expC);
});

test('moduleTotals scales hours and cost by FTE',()=>{
  state.fte=state.fte.map(()=>0.5);
  const {h,c}=moduleTotals(0);
  assert.equal(h,MODS[0].h.reduce((a,b)=>a+b,0)/2);
  assert.equal(c,MODS[0].h.reduce((a,hh,j)=>a+hh*ROLES[j].rate,0)/2);
});

test('moduleTotals excludes deselected roles',()=>{
  state.selRoles.delete(0);
  const {h,c}=moduleTotals(0);
  assert.equal(h,MODS[0].h.reduce((a,b)=>a+b,0)-MODS[0].h[0]);
  assert.equal(c,MODS[0].h.reduce((a,hh,j)=>a+hh*ROLES[j].rate,0)-MODS[0].h[0]*ROLES[0].rate);
});

test('roleTotals sums a role column across all modules',()=>{
  const {h,c}=roleTotals(2);
  const expH=MODS.reduce((a,m)=>a+m.h[2],0);
  assert.equal(h,expH);
  assert.equal(c,expH*ROLES[2].rate);
});

test('blendedRate averages the given role columns',()=>{
  assert.equal(blendedRate([]),0);
  assert.equal(blendedRate([0,1]),(ROLES[0].rate+ROLES[1].rate)/2);
  const all=ROLES.map((_,j)=>j);
  assert.equal(blendedRate(all),ROLES.reduce((a,r)=>a+r.rate,0)/ROLES.length);
});

test('feeFromCost treats margin as a share of the fee',()=>{
  assert.equal(feeFromCost(1000,0),1000);
  assert.equal(feeFromCost(750,0.25),1000);   // fee×(1−0.25)=750
  assert.ok(Math.abs(feeFromCost(600,0.4)-1000)<1e-9);
});

test('quoteCalc with all-zero controls returns bare cost',()=>{
  const q=quoteCalc(ZERO_CTL);
  let expH=0,expC=0;
  MODS.forEach(m=>m.h.forEach((hh,j)=>{expH+=hh;expC+=hh*ROLES[j].rate;}));
  assert.equal(q.tH,expH);
  assert.equal(q.tC,expC);
  assert.equal(q.fee,expC);
  assert.equal(q.adj,expC);
  assert.equal(q.mD,0);
  assert.equal(q.eff,expC/expH);
});

test('quoteCalc excludes inactive modules and deselected roles',()=>{
  state.active=new Set([0]);
  state.selRoles=new Set([1]);
  const q=quoteCalc(ZERO_CTL);
  assert.equal(q.tH,MODS[0].h[1]);
  assert.equal(q.tC,MODS[0].h[1]*ROLES[1].rate);
  assert.equal(q.rC[1],q.tC);
  assert.equal(q.rC[0],0);
});

test('quoteCalc applies the pricing pipeline in order',()=>{
  // Simple controlled scenario: one module, one role, 100h @ $100/hr.
  state.active=new Set([0]);
  state.selRoles=new Set([0]);
  state.hrs[0][0]=100;
  state.rates[0]=100;
  const ctl={mg:0.20,dc:0.10,cont:0.05,comm:0.02,vat:0.10,saas:1000,trav:500};
  const q=quoteCalc(ctl);
  const tC=10000;
  const fee=tC/(1-0.20);              // 12500 — margin share of fee
  const contAmt=fee*0.05;             // 625
  const sub=fee+contAmt+1000+500;     // 14625 — pass-throughs before discount
  const afterDisc=sub*(1-0.10);       // 13162.5
  const commAmt=afterDisc*0.02;       // 263.25 — commission on discounted price
  const net=afterDisc+commAmt;        // 13425.75
  const vatAmt=net*0.10;              // 1342.575 — VAT last, on everything
  const adj=net+vatAmt;               // 14768.325
  assert.equal(q.tC,tC);
  assert.equal(q.fee,fee);
  assert.equal(q.contAmt,contAmt);
  assert.equal(q.commAmt,commAmt);
  assert.equal(q.vatAmt,vatAmt);
  assert.equal(q.adj,adj);
  assert.equal(q.mD,fee-tC);
  assert.equal(q.eff,adj/100);
});

test('quoteCalc handles an empty scope without dividing by zero',()=>{
  state.active=new Set();
  const q=quoteCalc({...ZERO_CTL,saas:2000});
  assert.equal(q.tH,0);
  assert.equal(q.tC,0);
  assert.equal(q.eff,0);
  assert.equal(q.adj,2000); // pass-through costs still price
});

test('selCols and activeMods return catalog order after toggling',()=>{
  // Re-adding to a Set appends to iteration order; helpers must re-sort.
  state.selRoles.delete(0);state.selRoles.add(0);
  state.active.delete(2);state.active.add(2);
  assert.deepEqual(selCols(),ROLES.map((_,j)=>j));
  assert.deepEqual(activeMods(),MODS.map((_,i)=>i));
});
