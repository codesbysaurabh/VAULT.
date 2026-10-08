/**
 * Vault — core/utils
 * Globals shared by every page: DOM helpers, formatters, palette, date helpers.
 */
const W=window;
W.$=s=>document.querySelector(s);W.$$=s=>[...document.querySelectorAll(s)];
W.fmt=n=>'₹'+(+n).toLocaleString('en-IN',{maximumFractionDigits:2});
W.esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
W.cap=c=>c[0].toUpperCase()+c.slice(1);
const PAL=W.PAL=['#BAFF00','#FF2D78','#FFE500','#00D4FF','#FF6B00','#C084FC','#4ADE80'];
const COL={food:PAL[0],gaming:PAL[1],coffee:PAL[2],transport:PAL[3],bills:PAL[4],fashion:PAL[5],music:PAL[6]};
W.colorOf=(c,i=0)=>COL[c]||PAL[i%7];
const MON=W.MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const p2=n=>String(n).padStart(2,'0');
const dk=W.dk=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
W.nowIso=()=>dk(new Date())+'T'+new Date().toTimeString().slice(0,5);
W.mlabel=(d=new Date())=>MON[d.getMonth()]+' '+d.getFullYear();
W.dlabel=k=>{const d=new Date(k+'T00:00');return MON[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear()};
