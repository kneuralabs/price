/* Page switching: tabs, dot indicator, and any [data-goto] button. */
let cur=0;
const exitTimers=new Map();

export function initNav(){
  const pages=document.querySelectorAll('.pg');
  const tabs=document.querySelectorAll('.nav-tab');
  const dots=document.querySelectorAll('.pg-dot');
  function showPage(n){
    if(n===cur)return;
    pages[cur].classList.remove('active');
    pages[cur].classList.add('exit');
    const prev=cur;
    cur=n;
    clearTimeout(exitTimers.get(prev));
    exitTimers.set(prev,setTimeout(()=>pages[prev].classList.remove('exit'),320));
    clearTimeout(exitTimers.get(cur));
    pages[cur].classList.remove('exit');
    pages[cur].classList.add('active');
    pages[cur].scrollTop=0;
    tabs.forEach((t,i)=>t.classList.toggle('active',i===cur));
    dots.forEach((d,i)=>d.classList.toggle('active',i===cur));
  }
  tabs.forEach((t,i)=>t.addEventListener('click',()=>showPage(i)));
  dots.forEach((d,i)=>d.addEventListener('click',()=>showPage(i)));
  document.querySelectorAll('[data-goto]').forEach(b=>
    b.addEventListener('click',()=>showPage(parseInt(b.dataset.goto,10))));
}
