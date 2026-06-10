import {ROLES} from './data.js';
import {state,selCols} from './state.js';
import {blendedRate} from './calc.js';
import {$,esc} from './util.js';

/* Page 02: editable rate card.
   onValue — a number changed (rate/FTE): recalc only.
   onStructure — a role name or selection changed: matrix must rebuild. */
export function buildRateCard({onValue,onStructure}){
  ROLES.forEach((r,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td style="text-align:center"><input type="checkbox" class="role-chk" id="rc${i}" checked style="accent-color:var(--text);cursor:pointer;width:15px;height:15px"></td>
      <td><input type="text" class="role-name-inp" id="rn${i}" value="${esc(r.name)}"><div class="role-note">${esc(r.note)}</div></td>
      <td style="text-align:right"><input type="number" class="rate-inp" id="ft${i}" value="1" min="0" step="0.5" style="width:46px"></td>
      <td style="text-align:right"><div class="rate-input-cell"><span class="rate-pfx">$</span><input type="number" class="rate-inp" id="rt${i}" value="${r.rate}" min="0" step="5"><span class="rate-sfx">/ hr</span></div></td>
      <td style="font-family:var(--mono);font-size:.58rem;color:var(--text3)">${esc(r.note)}</td>`;
    $('rateBody').appendChild(tr);
    $('rt'+i).addEventListener('input',function(){state.rates[i]=parseFloat(this.value)||0;onValue();});
    $('ft'+i).addEventListener('input',function(){state.fte[i]=parseFloat(this.value)||0;onValue();});
    $('rn'+i).addEventListener('input',function(){ROLES[i].name=this.value;onStructure();});
    $('rc'+i).addEventListener('change',function(){
      this.checked?state.selRoles.add(i):state.selRoles.delete(i);
      onStructure();
    });
  });
}

export function updateBlended(){
  $('blendedVal').textContent='$'+blendedRate(selCols()).toFixed(2)+' / hr';
}
