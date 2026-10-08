/**
 * Vault — core/stats
 * Pure derivation: turns raw state into every figure the UI displays. No DOM access.
 */
V.stats=function(s,now=new Date()){
  const T=new Date(now.getFullYear(),now.getMonth(),now.getDate()),ym=dk(T).slice(0,7),dim=new Date(T.getFullYear(),T.getMonth()+1,0).getDate(),dom=T.getDate();
  const back=n=>new Date(T.getFullYear(),T.getMonth(),T.getDate()-n),ex=s.txns.filter(t=>t.type=='expense'),inc=s.txns.filter(t=>t.type=='income'),day={},dc={};
  ex.forEach(t=>{const k=t.date.slice(0,10);day[k]=(day[k]||0)+t.amt;dc[k+t.cat]=(dc[k+t.cat]||0)+t.amt});
  const sd=(i,j,c)=>{let a=0;for(let n=i;n<j;n++){const k=dk(back(n));a+=c?dc[k+c]||0:day[k]||0}return a};
  const mx=ex.filter(t=>t.date.startsWith(ym)),mi=inc.filter(t=>t.date.startsWith(ym)),by={};
  mx.forEach(t=>by[t.cat]=(by[t.cat]||0)+t.amt);
  const spent=mx.reduce((a,t)=>a+t.amt,0),income=mi.reduce((a,t)=>a+t.amt,0);
  const cats=Object.keys(s.budgets).map(c=>{const sp=by[c]||0,l=s.budgets[c];return{c,e:s.cats[c]||'📌',l,sp,pct:Math.round(sp/l*100),over:sp-l}});
  const pm=new Date(T.getFullYear(),T.getMonth()-1,1),pe=ex.filter(t=>t.date.startsWith(dk(pm).slice(0,7)));
  const lastTotal=pe.reduce((a,t)=>a+t.amt,0),lastMTD=pe.filter(t=>+t.date.slice(8,10)<=dom).reduce((a,t)=>a+t.amt,0);
  const dl=cats.filter(c=>c.c!='bills').reduce((a,c)=>a+c.l,0)/dim,good=n=>(day[dk(back(n))]||0)<=dl;
  let streak=0;while(streak<90&&good(streak))streak++;
  const last14=[];for(let n=13;n>=0;n--)last14.push({l:'SMTWTFS'[back(n).getDay()],good:good(n)});
  const dow=[0,0,0,0,0,0,0],cn=[0,0,0,0,0,0,0];for(let n=0;n<56;n++){const g=back(n).getDay();dow[g]+=day[dk(back(n))]||0;cn[g]++}
  const da=dow.map((v,i)=>v/Math.max(cn[i],1)),wd=(da[1]+da[2]+da[3]+da[4]+da[5])/5,we=(da[0]+da[6])/2;
  const weeks=[],daily7=[],daily=[],mons=[];
  for(let w=7;w>=0;w--)weeks.push({l:'W'+(8-w),v:sd(w*7,w*7+7)});
  for(let n=6;n>=0;n--)daily7.push({l:['SUN','MON','TUE','WED','THU','FRI','SAT'][back(n).getDay()],v:sd(n,n+1)});
  for(let d=1;d<=dom;d++)daily.push({l:String(d),v:day[ym+'-'+p2(d)]||0});
  for(let o=11;o>=0;o--){const m=new Date(T.getFullYear(),T.getMonth()-o,1),k=dk(m).slice(0,7);mons.push({l:MON[m.getMonth()].toUpperCase(),y:m.getFullYear(),v:ex.filter(t=>t.date.startsWith(k)).reduce((a,t)=>a+t.amt,0)})}
  const chg=cats.map(c=>{const a=sd(0,7,c.c),b=sd(7,14,c.c);return{c:c.c,a,b,d:a-b,pct:b?Math.round((a-b)/b*100):null}});
  const avg7=(sd(0,7)-sd(0,7,'bills'))/7,left=dim-dom,wk0=dk(back(6));
  const balance=s.opening+inc.reduce((a,t)=>a+t.amt,0)-ex.reduce((a,t)=>a+t.amt,0);
  const weekNet=s.txns.filter(t=>t.date.slice(0,10)>=wk0).reduce((a,t)=>a+(t.type=='income'?t.amt:-t.amt),0);
  const tod=[0,0,0,0];mx.forEach(t=>{const h=+t.date.slice(11,13);tod[h<11?0:h<14?1:h<18?2:3]+=t.amt});
  return{T,ym,dim,dom,left,cats,spent,income,mcount:mx.length+mi.length,deposits:mi.length,big:Math.max(0,...mx.map(t=>t.amt)),avg:(spent-(by.bills||0))/dom,dl,streak,last14,da,wd,we,weeks,daily7,daily,mons,chg,avg7,fc:spent+avg7*left,balance,weekNet,tod,lastTotal,lastMTD,prev:pm,delta:lastMTD?Math.round((spent-lastMTD)/lastMTD*100):0,alloc:cats.reduce((a,c)=>a+c.l,0),tsp:cats.reduce((a,c)=>a+c.sp,0),endLabel:MON[T.getMonth()]+' '+dim,day,wkStart:back(6)}
 };
