import {$} from './util.js';

/* Quote Builder control panel — declarative.

   Each control pairs a native range slider with an editable text twin.
   The slider's min/max/step live in the HTML and are the single source of
   truth for its range; the text twin reads them back so the two can never
   drift apart. Adding a control is one HTML <input> + one row below.

   key    — field name in the snapshot consumed by quoteCalc()
   sl/out — element ids of the slider and its editable text twin
   kind   — 'pct'   → snapshot value is slider/100, shown as "N%"
            'money' → snapshot value is the raw amount, shown as "$N"
   signed — discount-style display: a positive slider shows as "-N%"
            (a discount), a negative slider as "+N%" (a surcharge)
   wide   — true when a change must recalc the matrix & quote rows (margin
            feeds those); false when only the final quote panel is affected. */
const CONTROLS=[
  {key:'mg',  sl:'marginSl',out:'marginOut',kind:'pct',  wide:true},
  {key:'dc',  sl:'discSl',  out:'discOut',  kind:'pct',  signed:true},
  {key:'cont',sl:'contSl',  out:'contOut',  kind:'pct'},
  {key:'comm',sl:'commSl',  out:'commOut',  kind:'pct'},
  {key:'vat', sl:'vatSl',   out:'vatOut',   kind:'pct'},
  {key:'saas',sl:'saasSl',  out:'saasOut',  kind:'money'},
  {key:'trav',sl:'travSl',  out:'travOut',  kind:'money'},
];

const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const fmtPct=v=>v+'%';
const fmtSigned=v=>(v>0?'−':v<0?'+':'')+Math.abs(v)+'%';
const fmtMoney=v=>'$'+v.toLocaleString();
const fmtOf=c=>c.signed?fmtSigned:c.kind==='money'?fmtMoney:fmtPct;

/* Current slider position → snapshot value (percentages are fractions). */
const valueOf=c=>{
  const v=parseFloat($(c.sl).value)||0;
  return c.kind==='money'?v:v/100;
};

export const getMargin=()=>valueOf(CONTROLS[0]);

export function readControls(){
  const ctl={};
  for(const c of CONTROLS)ctl[c.key]=valueOf(c);
  return ctl;
}

/* Parse a typed value back to a slider position (clamped to the slider's
   own range), or null when the text isn't a number. */
function parseInput(c,text){
  const sl=$(c.sl),lo=parseFloat(sl.min),hi=parseFloat(sl.max);
  if(c.kind==='money'){
    const v=parseFloat(text.replace(/[$,\s]/g,''));
    if(isNaN(v))return null;
    const step=parseFloat(sl.step)||1;
    return clamp(Math.round(v/step)*step,lo,hi);
  }
  const n=parseFloat(text.replace(/[%+−\-\s]/g,''));
  if(isNaN(n))return null;
  // Signed: a leading "+" is a surcharge (negative slider); everything
  // else — including a "-" or no sign — is read as a discount.
  const v=c.signed?(text.trim()[0]==='+'?-Math.abs(n):Math.abs(n)):n;
  return clamp(v,lo,hi);
}

/* onRecalc refreshes everything; onQuote refreshes the quote panel only
   (the matrix & rate card depend on these controls only through margin). */
export function initControls({onRecalc,onQuote}){
  for(const c of CONTROLS){
    const sl=$(c.sl),out=$(c.out),fmt=fmtOf(c),commit=c.wide?onRecalc:onQuote;
    sl.addEventListener('input',()=>{out.value=fmt(parseFloat(sl.value)||0);commit();});
    out.addEventListener('change',()=>{
      const v=parseInput(c,out.value);
      if(v===null)return;
      sl.value=v;
      out.value=fmt(v);
      commit();
    });
    out.addEventListener('keydown',e=>{if(e.key==='Enter')out.blur();});
  }
}
