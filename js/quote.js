import {ROLES,MODS} from './data.js';
import {state,selCols} from './state.js';
import {moduleTotals} from './calc.js';
import {$,esc,money,moneyK,hours} from './util.js';

/* Page 04: quote builder rows, summary panel, breakdown, export. */

export function buildQuoteRows(onToggle){
  const body=$('qbBody');
  MODS.forEach((m,i)=>{
    const on=state.active.has(i);
    const {c}=moduleTotals(i);
    const row=document.createElement('div');
    row.className='qb-row'+(on?'':' off');
    row.innerHTML=`
      <span class="qb-switch"><span class="qb-knob"></span></span>
      <div>
        <div class="qb-name">${esc(m.name)}</div>
        <div class="qb-sub" id="qSub${i}">${esc(m.id)} · ${money(c)} cost</div>
      </div>
      <span class="qb-hrs" id="qH${i}">—</span>
      <span class="qb-fee" id="qF${i}">—</span>`;
    row.addEventListener('click',()=>{
      state.active.has(i)?state.active.delete(i):state.active.add(i);
      row.classList.toggle('off',!state.active.has(i));
      onToggle();
    });
    body.appendChild(row);
  });
}

export function updateQBRows(mg){
  MODS.forEach((m,i)=>{
    const {h:mH,c:mC}=moduleTotals(i);
    $('qSub'+i).textContent=`${m.id} · ${money(mC)} cost`;
    $('qH'+i).textContent=hours(mH);
    $('qF'+i).textContent=money(mC/(1-mg));
  });
}

export function updateQuote(q){
  $('qbSum').innerHTML=`
    <div class="sumcard"><div class="sumcard-val">${state.active.size}</div><div class="sumcard-lbl">Modules</div></div>
    <div class="sumcard"><div class="sumcard-val">${Math.round(q.tH).toLocaleString()}</div><div class="sumcard-lbl">Hours</div></div>
    <div class="sumcard"><div class="sumcard-val">${moneyK(q.tC)}</div><div class="sumcard-lbl">Int. Cost</div></div>
    <div class="sumcard"><div class="sumcard-val">$${q.eff.toFixed(0)}</div><div class="sumcard-lbl">Eff. $/hr</div></div>`;
  $('qbBreak').innerHTML=
    selCols().map(j=>q.rC[j]?`<div class="byrole-row"><span class="k">${esc(ROLES[j].abbr)} · $${state.rates[j]}/hr</span><span class="v">${money(q.rC[j])}</span></div>`:'').join('')+
    `<div class="byrole-sep"></div><div class="byrole-tot"><span>Internal cost</span><span>${money(q.tC)}</span></div>`+
    (q.contAmt?`<div class="byrole-extra"><span>Contingency</span><span>${money(q.contAmt)}</span></div>`:'')+
    (q.saas?`<div class="byrole-extra"><span>SaaS subs</span><span>${money(q.saas)}</span></div>`:'')+
    (q.trav?`<div class="byrole-extra"><span>Travel</span><span>${money(q.trav)}</span></div>`:'')+
    (q.commAmt?`<div class="byrole-extra"><span>Sales comm.</span><span>${money(q.commAmt)}</span></div>`:'')+
    (q.vatAmt?`<div class="byrole-extra"><span>VAT/GST</span><span>${money(q.vatAmt)}</span></div>`:'');
  $('finalPrice').textContent=money(q.adj);
  $('finalSub').innerHTML=`
    <span>Margin <strong>${(q.mg*100).toFixed(0)}%</strong></span>
    <span>Margin$ <strong>${money(q.mD)}</strong></span>
    <span>Disc <strong>${(q.dc*100).toFixed(0)}%</strong></span>
    <span>${Math.round(q.tH).toLocaleString()} hrs</span>`;
}

export function exportQuote(q){
  const lines=['KNEURAPRICE — Custom Quote','='.repeat(52),'','RATE CARD (selected roles)'];
  selCols().forEach(j=>lines.push(`  ${ROLES[j].abbr.padEnd(4)} ${ROLES[j].name.padEnd(34)} $${state.rates[j]}/hr  FTE ${state.fte[j]}`));
  lines.push('','SELECTED MODULES');
  state.active.forEach(i=>{
    const {h:mH,c:mC}=moduleTotals(i);
    lines.push(`  ${MODS[i].id.padEnd(5)} ${MODS[i].name.padEnd(44)} ${String(Math.round(mH)+'h').padStart(6)}  $${Math.round(mC).toLocaleString()}`);
  });
  lines.push('','='.repeat(52),
    `Hours:           ${Math.round(q.tH).toLocaleString()}`,
    `Internal Cost:   $${Math.round(q.tC).toLocaleString()}`,
    `Margin:          ${(q.mg*100).toFixed(0)}%`,
    `Contingency:     ${(q.cont*100).toFixed(0)}%  ($${Math.round(q.contAmt).toLocaleString()})`,
    `SaaS Subs:       $${Math.round(q.saas).toLocaleString()}`,
    `Travel:          $${Math.round(q.trav).toLocaleString()}`,
    `Discount:        ${(q.dc*100).toFixed(0)}%`,
    `Sales Comm:      ${(q.comm*100).toFixed(0)}%  ($${Math.round(q.commAmt).toLocaleString()})`,
    `VAT/GST:         ${(q.vat*100).toFixed(0)}%  ($${Math.round(q.vatAmt).toLocaleString()})`,
    `CLIENT PRICE:    $${Math.round(q.adj).toLocaleString()}`);
  const text=lines.join('\n');
  const b=$('expBtn'),o=b.textContent;
  function done(ok){b.textContent=ok?'Copied ✓':'Copy failed — see console';setTimeout(()=>b.textContent=o,2200);}
  function legacyCopy(){
    const ta=document.createElement('textarea');
    ta.value=text;ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.select();
    let ok=false;
    try{ok=document.execCommand('copy');}catch(e){}
    document.body.removeChild(ta);
    if(!ok)console.error('KNEURAPRICE export: clipboard unavailable. Quote text:\n'+text);
    done(ok);
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(()=>done(true)).catch(legacyCopy);
  }else{
    legacyCopy();
  }
}
