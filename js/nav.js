/* Page switching: tabs, dot indicator, and any [data-goto] button.
   Only the active page is shown; the document scrolls naturally. */
let cur=0;

export function initNav(){
  const pages=document.querySelectorAll('.page');
  const tabs=document.querySelectorAll('.tab');
  const dots=document.querySelectorAll('.pagedot');
  function showPage(n){
    if(n===cur||!pages[n])return;
    pages[cur].classList.remove('active');
    cur=n;
    pages[cur].classList.add('active');
    tabs.forEach((t,i)=>t.classList.toggle('active',i===cur));
    dots.forEach((d,i)=>d.classList.toggle('active',i===cur));
    window.scrollTo(0,0);
  }
  tabs.forEach((t,i)=>t.addEventListener('click',()=>showPage(i)));
  dots.forEach((d,i)=>d.addEventListener('click',()=>showPage(i)));
  document.querySelectorAll('[data-goto]').forEach(b=>
    b.addEventListener('click',()=>showPage(parseInt(b.dataset.goto,10))));
}
