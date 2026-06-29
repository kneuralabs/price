import {ROLES,MODS} from './data.js';
import {state,selCols} from './state.js';
import {moduleTotals} from './calc.js';
import {$,money,moneyK,hours} from './util.js';

/* Page 04: quote builder rows, summary panel, breakdown, export. */

export function buildQuoteRows(onToggle){
  const tb=$('qbBody');
  MODS.forEach((m,i)=>{
    const tr=document.createElement('tr');
    tr.className='qr'+(state.active.has(i)?'':' off');
    tr.innerHTML=`<td class="qm-check-cell"><div class="toggle${state.active.has(i)?' on':''}"></div></td>
      <td><div class="qm-id">${m.id}</div></td>
      <td><div class="qm-name">${m.name}</div></td>
      <td class="qm-r qm-hrs hs" id="qH${i}">—</td>
      <td class="qm-r qm-cost hs" id="qC${i}">—</td>
      <td class="qm-r qm-fee" id="qF${i}">—</td>`;
    tr.addEventListener('click',()=>{
      state.active.has(i)?state.active.delete(i):state.active.add(i);
      tr.classList.toggle('off',!state.active.has(i));
      tr.querySelector('.toggle').classList.toggle('on',state.active.has(i));
      onToggle();
    });
    tb.appendChild(tr);
  });
}

export function updateQBRows(mg){
  MODS.forEach((_,i)=>{
    const {h:mH,c:mC}=moduleTotals(i);
    $('qH'+i).textContent=hours(mH);
    $('qC'+i).textContent=money(mC);
    $('qF'+i).textContent=money(mC/(1-mg));
  });
}

export function updateQuote(q){
  $('qbSum').innerHTML=`
    <div class="sum-card"><span class="sum-val">${state.active.size}</span><div class="sum-lbl">Modules</div></div>
    <div class="sum-card"><span class="sum-val">${Math.round(q.tH).toLocaleString()}</span><div class="sum-lbl">Hours</div></div>
    <div class="sum-card"><span class="sum-val">${moneyK(q.tC)}</span><div class="sum-lbl">Int. Cost</div></div>
    <div class="sum-card"><span class="sum-val">$${q.eff.toFixed(0)}</span><div class="sum-lbl">Eff. $/hr</div></div>`;
  $('qbBreak').innerHTML=
    selCols().map(j=>q.rC[j]?`<div class="br-row"><span class="br-role">${ROLES[j].abbr} · $${state.rates[j]}/hr</span><span class="br-val">${money(q.rC[j])}</span></div>`:'').join('')+
    `<div class="br-sep"></div><div class="br-tot"><span class="br-tot-lbl">Internal cost</span><span class="br-tot-val">${money(q.tC)}</span></div>`+
    (q.contAmt?`<div class="br-row"><span class="br-role">Contingency</span><span class="br-val">${money(q.contAmt)}</span></div>`:'')+
    (q.saas?`<div class="br-row"><span class="br-role">SaaS subs</span><span class="br-val">${money(q.saas)}</span></div>`:'')+
    (q.trav?`<div class="br-row"><span class="br-role">Travel</span><span class="br-val">${money(q.trav)}</span></div>`:'')+
    (q.commAmt?`<div class="br-row"><span class="br-role">Sales comm.</span><span class="br-val">${money(q.commAmt)}</span></div>`:'')+
    (q.vatAmt?`<div class="br-row"><span class="br-role">VAT/GST</span><span class="br-val">${money(q.vatAmt)}</span></div>`:'');
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
