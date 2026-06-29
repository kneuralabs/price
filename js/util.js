export const $=id=>document.getElementById(id);
export function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
export const money=n=>'$'+Math.round(n).toLocaleString();
export const moneyK=n=>'$'+Math.round(n/1000)+'K';
export const hours=n=>Math.round(n).toLocaleString()+'h';
