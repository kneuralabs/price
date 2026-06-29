import {ROLES,MODS} from './data.js';
import {state,selCols} from './state.js';
import {moduleTotals,roleTotals} from './calc.js';
import {$,esc,money,moneyK,hours} from './util.js';

/* Page 03: effort matrix. Rebuilt whenever roles/names change so the
   visible columns track the currently selected roles. */
export function buildMatrix(onCell){
  const t=$('mxTable');
  const cols=selCols();
  let h=`<thead><tr><th class="mx-th-mod">Module</th>`;
  cols.forEach(j=>h+=`<th class="mx-th-role" title="${esc(ROLES[j].name)}">${esc(ROLES[j].abbr)}</th>`);
  h+=`<th class="mx-th-sum">Hrs</th><th class="mx-th-sum">Int. Cost</th><th class="mx-th-sum">Fee</th></tr></thead><tbody>`;
  MODS.forEach((m,i)=>{
    h+=`<tr><td class="mx-td-mod"><div class="mx-mod-head"><span class="mx-mod-id">${esc(m.id)}</span><span class="mx-mod-name">${esc(m.name)}</span></div><div class="mx-mod-dur">${esc(m.dur)}</div></td>`;
    cols.forEach(j=>h+=`<td class="mx-cell"><input class="kp-num mx-input${state.hrs[i][j]===0?' zero':''}" type="number" id="h${i}_${j}" value="${state.hrs[i][j]}" min="0" step="4"></td>`);
    h+=`<td class="mx-hrs" id="mH${i}"></td><td class="mx-cost" id="mC${i}"></td><td class="mx-fee" id="mF${i}"></td></tr>`;
  });
  h+=`</tbody><tfoot><tr><td class="mx-foot-mod">Grand Total</td>`;
  cols.forEach(j=>h+=`<td class="mx-foot-col"><div class="h" id="cH${j}"></div><div class="c" id="cC${j}"></div></td>`);
  h+=`<td class="mx-foot-sum" id="gH"></td><td class="mx-foot-sum" id="gC"></td><td class="mx-foot-fee" id="gF"></td></tr></tfoot>`;
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
    gH+=mH;gC+=mC;
    $('mH'+i).textContent=hours(mH);
    $('mC'+i).textContent=money(mC);
    $('mF'+i).textContent=money(mC/(1-mg));
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
