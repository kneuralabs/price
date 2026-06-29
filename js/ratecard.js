import {ROLES} from './data.js';
import {state,selCols} from './state.js';
import {blendedRate} from './calc.js';
import {$,esc} from './util.js';

/* Page 02: editable rate card (a CSS grid of rows).
   onValue — a number changed (rate/FTE): recalc only.
   onStructure — a role name or selection changed: matrix must rebuild. */
export function buildRateCard({onValue,onStructure}){
  const body=$('rateBody');
  ROLES.forEach((r,i)=>{
    const on=state.selRoles.has(i);
    const row=document.createElement('div');
    row.className='rc-row'+(on?'':' off');
    row.innerHTML=`
      <div class="rc-on"><button type="button" class="rc-check${on?' on':''}" id="rc${i}" aria-pressed="${on}" aria-label="Include ${esc(r.name)}"><span class="rc-check-dot"></span></button></div>
      <div class="rc-role"><input class="rc-name" type="text" id="rn${i}" value="${esc(r.name)}"><div class="rc-note">${esc(r.note)}</div></div>
      <div class="rc-fte"><input class="kp-num rc-num" type="number" id="ft${i}" value="${state.fte[i]}" min="0" step="0.5"></div>
      <div class="rc-rate"><span class="rc-pfx">$</span><input class="kp-num rc-rateinp" type="number" id="rt${i}" value="${state.rates[i]}" min="0" step="5"><span class="rc-sfx">/ hr</span></div>`;
    body.appendChild(row);

    $('rt'+i).addEventListener('input',function(){state.rates[i]=parseFloat(this.value)||0;onValue();});
    $('ft'+i).addEventListener('input',function(){state.fte[i]=parseFloat(this.value)||0;onValue();});
    $('rn'+i).addEventListener('input',function(){ROLES[i].name=this.value;onStructure();});
    $('rc'+i).addEventListener('click',function(){
      const sel=state.selRoles.has(i);
      sel?state.selRoles.delete(i):state.selRoles.add(i);
      const now=!sel;
      this.classList.toggle('on',now);
      this.setAttribute('aria-pressed',now);
      row.classList.toggle('off',!now);
      onStructure();
    });
  });
}

export function updateBlended(){
  $('blendedVal').textContent='$'+blendedRate(selCols()).toFixed(2)+' / hr';
}
