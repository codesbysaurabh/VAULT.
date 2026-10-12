/**
 * Vault — core/utils
 * Globals shared by every page: DOM helpers, formatters, palette, date + month-cycle helpers.
 */
const W=window;
W.$=s=>document.querySelector(s);W.$$=s=>[...document.querySelectorAll(s)];
W.fmt=n=>'₹'+(+n).toLocaleString('en-IN',{maximumFractionDigits:2});
W.esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// "my-cat" -> "My Cat" (safe on empty strings)
W.cap=c=>String(c).split('-').map(w=>w?w[0].toUpperCase()+w.slice(1):'').join(' ');
const PAL=W.PAL=['#BAFF00','#FF2D78','#FFE500','#00D4FF','#FF6B00','#C084FC','#4ADE80'];
const COL={food:PAL[0],gaming:PAL[1],coffee:PAL[2],transport:PAL[3],bills:PAL[4],fashion:PAL[5],music:PAL[6]};
// Known categories have CSS classes (.pill-x / .tag-x); anything else gets a stable colour from its name.
const KNOWN=new Set(['food','gaming','transport','fashion','bills','coffee','music','fitness','income','health','travel','utilities','dining']);
W.colorOf=(c,i=0)=>COL[c]||PAL[([...String(c)].reduce((h,x)=>(h*31+x.charCodeAt(0))|0,7)>>>0)%7];
W.catStyle=c=>KNOWN.has(c)?'':` style="background:${colorOf(c)};color:#0A0A0A"`;
const MON=W.MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const p2=n=>String(n).padStart(2,'0');
const dk=W.dk=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
W.nowIso=()=>dk(new Date())+'T'+new Date().toTimeString().slice(0,5);
W.mlabel=(d=new Date())=>MON[d.getMonth()]+' '+d.getFullYear();
W.dlabel=k=>{const d=new Date(k+'T00:00');return MON[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear()};
W.addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
W.ord=n=>{const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0])};

/**
 * Month cycle ("your month"): starts on day `day` (1–31) of each calendar month.
 * In months shorter than `day` the cycle starts on the month's last day.
 * Returns { start, end (inclusive last day), next (start of the following cycle), days }.
 */
W.clampDay=d=>{const n=Math.round(+d);return n>=1&&n<=31?n:1};
const dmo=(y,m)=>new Date(y,m+1,0).getDate(),cstart=(y,m,d)=>new Date(y,m,Math.min(d,dmo(y,m)));
W.cycleOf=(date,day=1)=>{
 const D=clampDay(day),T=new Date(date.getFullYear(),date.getMonth(),date.getDate());
 let a=cstart(T.getFullYear(),T.getMonth(),D);
 if(a>T)a=cstart(T.getFullYear(),T.getMonth()-1,D);
 const n=cstart(a.getFullYear(),a.getMonth()+1,D);
 return{start:a,next:n,end:addDays(n,-1),days:Math.round((n-a)/864e5)};
};
/** "Oct 2026" for a calendar month, "Sep 15 – Oct 14, 2026" for a custom cycle. */
W.cycleLabel=(c,day=1)=>{
 const a=c.start,e=c.end,f=d=>MON[d.getMonth()]+' '+d.getDate();
 if(clampDay(day)==1)return MON[a.getMonth()]+' '+a.getFullYear();
 return a.getFullYear()==e.getFullYear()?f(a)+' – '+f(e)+', '+e.getFullYear():f(a)+', '+a.getFullYear()+' – '+f(e)+', '+e.getFullYear();
};
