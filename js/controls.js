import {$} from './util.js';

/* Quote Builder control panel: sliders + their editable text twins. */

const num=id=>parseFloat($(id).value)||0;
export const getMargin=()=>parseInt($('marginSl').value)/100;
export const getDiscount=()=>parseInt($('discSl').value)/100;

export function readControls(){
  return {
    mg:getMargin(),dc:getDiscount(),
    cont:num('contSl')/100,comm:num('commSl')/100,vat:num('vatSl')/100,
    saas:num('saasSl'),trav:num('travSl'),
  };
}

const discFmt=v=>(v>0?'-':v<0?'+':'')+Math.abs(v)+'%';

function setupPctInp(inpId,slId,min,max,fmtFn,onCommit){
  const inp=$(inpId),sl=$(slId);
  function apply(){
    const raw=inp.value.replace(/[%+\-\s]/g,'');
    const parsed=parseFloat(raw);
    if(isNaN(parsed))return;
    // For discount, sign in display is inverted: "-5%" means slider=5
    let v;
    if(inpId==='discOut'){
      const sign=inp.value.trim()[0];
      if(sign==='-')v=Math.abs(parsed); // discount → positive slider
      else if(sign==='+')v=-Math.abs(parsed); // surcharge → negative slider
      else v=Math.abs(parsed); // no sign → treat as discount
    } else {
      v=parsed;
    }
    v=Math.max(min,Math.min(max,v));
    sl.value=v;
    inp.value=fmtFn(v);
    onCommit();
  }
  inp.addEventListener('change',apply);
  inp.addEventListener('keydown',function(e){if(e.key==='Enter')this.blur();});
}

function setupDollarInp(inpId,slId,min,max,step,onCommit){
  const inp=$(inpId),sl=$(slId);
  function apply(){
    const raw=inp.value.replace(/[$,\s]/g,'');
    let v=parseFloat(raw);
    if(isNaN(v))return;
    v=Math.max(min,Math.min(max,Math.round(v/step)*step));
    sl.value=v;
    inp.value='$'+v.toLocaleString();
    onCommit();
  }
  inp.addEventListener('change',apply);
  inp.addEventListener('keydown',function(e){if(e.key==='Enter')this.blur();});
}

/* onRecalc refreshes everything; onQuote refreshes the quote panel only
   (matrix/rate card don't depend on these controls except margin). */
export function initControls({onRecalc,onQuote}){
  $('marginSl').addEventListener('input',function(){$('marginOut').value=this.value+'%';onRecalc();});
  $('discSl').addEventListener('input',function(){$('discOut').value=discFmt(parseInt(this.value));onQuote();});
  [['contSl','contOut'],['commSl','commOut'],['vatSl','vatOut']].forEach(([s,o])=>
    $(s).addEventListener('input',function(){$(o).value=this.value+'%';onQuote();}));
  [['saasSl','saasOut'],['travSl','travOut']].forEach(([s,o])=>
    $(s).addEventListener('input',function(){$(o).value='$'+parseInt(this.value).toLocaleString();onQuote();}));
  setupPctInp('marginOut','marginSl',5,60,v=>v+'%',onRecalc);
  setupPctInp('discOut','discSl',-25,25,discFmt,onRecalc);
  setupPctInp('contOut','contSl',0,25,v=>v+'%',onRecalc);
  setupPctInp('commOut','commSl',0,20,v=>v+'%',onRecalc);
  setupPctInp('vatOut','vatSl',0,30,v=>v+'%',onRecalc);
  setupDollarInp('saasOut','saasSl',0,100000,1000,onRecalc);
  setupDollarInp('travOut','travSl',0,50000,500,onRecalc);
}
