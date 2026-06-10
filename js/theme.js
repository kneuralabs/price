export function initTheme(){
  const tgl=document.getElementById('themeTgl'),root=document.documentElement;
  function apply(dark){
    root.classList.toggle('dark',dark);
    tgl.textContent=dark?'☀':'☾';
    tgl.setAttribute('aria-pressed',dark);
    try{localStorage.setItem('kp-theme',dark?'dark':'light')}catch(e){}
  }
  let saved=null;
  try{saved=localStorage.getItem('kp-theme')}catch(e){}
  const prefersDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches;
  apply(saved?saved==='dark':prefersDark);
  tgl.addEventListener('click',()=>apply(!root.classList.contains('dark')));
}
