/* Dark / light toggle. The saved preference is applied before paint by the
   inline boot script in index.html (no flash); this only wires the button
   and keeps the glyph + persisted choice in sync. */
export function initTheme(){
  const tgl=document.getElementById('themeTgl'),root=document.documentElement;
  if(!tgl)return;
  function sync(){
    const dark=root.classList.contains('dark');
    tgl.textContent=dark?'☀':'☾';
    tgl.setAttribute('aria-pressed',dark);
  }
  sync();
  tgl.addEventListener('click',()=>{
    const dark=!root.classList.contains('dark');
    root.classList.toggle('dark',dark);
    try{localStorage.setItem('kp-theme',dark?'dark':'light')}catch(e){}
    sync();
  });
}
