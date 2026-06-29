import {ROLES,MODS} from './data.js';
import {state,selCols} from './state.js';
import {moduleTotals,roleTotals} from './calc.js';
import {$,esc,money,moneyK,hours} from './util.js';

/* Page 03: effort matrix. Rebuilt whenever roles/names change. */
export function buildMatrix(onCell){
  const t=$('mxTable');
  const cols=selCols();
  let h=`<thead><tr><th class="th-mod">Module</th>`;
  cols.forEach(j=>h+=`<th title="${esc(ROLES[j].abbr)}">${esc(ROLES[j].name)}</th>`);
  h+=`<th class="th-sum">Hrs</th><th class="th-sum">Int. Cost</th><th class="th-sum">Fee</th></tr></thead><tbody>`;
  MODS.forEach((m,i)=>{
    h+=`<tr><td class="td-mod"><div class="mod-id">${m.id}</div><div class="mod-name">${m.name}</div><div class="mod-dur">${m.dur}</div></td>`;
    cols.forEach(j=>h+=`<td style="padding:0"><input type="number" class="hr-inp${state.hrs[i][j]===0?' zero':''}" id="h${i}_${j}" value="${state.hrs[i][j]}" min="0" step="4"></td>`);
    h+=`<td class="td-sum"><div class="s-hrs" id="mH${i}"></div></td><td class="td-sum"><div class="s-cost" id="mC${i}"></div></td><td class="td-sum"><div class="s-fee" id="mF${i}"></div></td></tr>`;
  });
  h+=`</tbody><tfoot><tr><td class="td-mod"><div class="gd-label">Grand Total</div></td>`;
  cols.forEach(j=>h+=`<td style="padding:0;background:var(--bg2)"><div class="ct-hrs" id="cH${j}"></div><div class="ct-cost" id="cC${j}"></div></td>`);
  h+=`<td class="td-sum"><div class="s-hrs" id="gH"></div></td><td class="td-sum"><div class="s-cost" id="gC"></div></td><td class="td-sum"><div class="s-fee" id="gF"></div></td></tr></tfoot>`;
  t.innerHTML=h;
  MODS.forEach((_,i)=>cols.forEach(j=>{
    $(`h${i}_${j}`).addEventListener('input',function(){
      state.hrs[i][j]=parseFloat(this.value)||0;
      this.classList.toggle('zero',state.hrs[i][j]===0);
      onCell();
    });
  }));
}

export function updateMatrix(mg){
  let gH=0,gC=0;
  MODS.forEach((_,i)=>{
    const {h:mH,c:mC}=moduleTotals(i);
    gH+=mH;gC+=mC;const fee=mC/(1-mg);
    $('mH'+i).textContent=hours(mH);
    $('mC'+i).textContent=money(mC);
    $('mF'+i).textContent=money(fee);
  });
  state.selRoles.forEach(j=>{
    const {h:cH,c:cC}=roleTotals(j);
    $('cH'+j).textContent=hours(cH);
    $('cC'+j).textContent=moneyK(cC);
  });
  $('gH').textContent=hours(gH);
  $('gC').textContent=money(gC);
  $('gF').textContent=money(gC/(1-mg));
}
