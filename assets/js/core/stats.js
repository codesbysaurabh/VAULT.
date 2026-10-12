/**
 * Vault — core/stats
 * Pure derivation: turns raw state into every figure the UI displays. No DOM access.
 * "This month" is the user's month cycle (state.cycleStart), not necessarily the calendar month.
 */
V.stats=function(s,now=new Date()){
  const T=new Date(now.getFullYear(),now.getMonth(),now.getDate()),D=clampDay(s.cycleStart);
  const cy=cycleOf(T,D),pc=cycleOf(addDays(cy.start,-1),D);
  const sk=dk(cy.start),ek=dk(cy.end),dim=cy.days,dom=Math.round((T-cy.start)/864e5)+1;
  const back=n=>addDays(T,-n),kd=t=>t.date.slice(0,10),within=(t,a,b)=>{const k=kd(t);return k>=a&&k<=b};
  const ex=s.txns.filter(t=>t.type=='expense'),inc=s.txns.filter(t=>t.type=='income'),day={},dc={};
  ex.forEach(t=>{const k=kd(t);day[k]=(day[k]||0)+t.amt;dc[k+t.cat]=(dc[k+t.cat]||0)+t.amt});
  const sd=(i,j,c)=>{let a=0;for(let n=i;n<j;n++){const k=dk(back(n));a+=c?dc[k+c]||0:day[k]||0}return a};
  const sum=l=>l.reduce((a,t)=>a+t.amt,0);
  // current cycle
  const mx=ex.filter(t=>within(t,sk,ek)),mi=inc.filter(t=>within(t,sk,ek)),by={};
  mx.forEach(t=>by[t.cat]=(by[t.cat]||0)+t.amt);
  const spent=sum(mx),income=sum(mi);
  const cats=Object.keys(s.budgets).map(c=>{const sp=by[c]||0,l=s.budgets[c];return{c,e:s.cats[c]||'📌',l,sp,pct:l>0?Math.round(sp/l*100):(sp>0?100:0),over:sp-l}});
  // previous cycle, and the same point in it (day `dom`) for a fair month-to-date comparison
  const psk=dk(pc.start),pek=dk(pc.end),lim=dk(addDays(pc.start,dom-1)),pe=ex.filter(t=>within(t,psk,pek));
  const lastTotal=sum(pe),lastMTD=sum(pe.filter(t=>kd(t)<=lim));
  // streak: consecutive days (ending today) at or under the daily limit; days before the first transaction don't count
  const dl=cats.filter(c=>c.c!='bills').reduce((a,c)=>a+c.l,0)/dim,good=n=>(day[dk(back(n))]||0)<=dl;
  const first=s.txns.reduce((m,t)=>{const k=kd(t);return !m||k<m?k:m},''),has=n=>!!first&&dk(back(n))>=first;
  let streak=0;while(streak<90&&has(streak)&&good(streak))streak++;
  const last14=[];for(let n=13;n>=0;n--)last14.push({l:'SMTWTFS'[back(n).getDay()],good:good(n),none:!has(n)});
  const dow=[0,0,0,0,0,0,0],cn=[0,0,0,0,0,0,0];for(let n=0;n<56;n++){const g=back(n).getDay();dow[g]+=day[dk(back(n))]||0;cn[g]++}
  const da=dow.map((v,i)=>v/Math.max(cn[i],1)),wd=(da[1]+da[2]+da[3]+da[4]+da[5])/5,we=(da[0]+da[6])/2;
  const weeks=[],daily7=[],daily=[],days=[],mons=[];
  for(let w=7;w>=0;w--)weeks.push({l:'W'+(8-w),v:sd(w*7,w*7+7)});
  for(let n=6;n>=0;n--)daily7.push({l:['SUN','MON','TUE','WED','THU','FRI','SAT'][back(n).getDay()],v:sd(n,n+1)});
  for(let i=0;i<dim;i++){const d=addDays(cy.start,i),k=dk(d),v=day[k]||0;days.push({k,n:d.getDate(),v,future:i>=dom});if(i<dom)daily.push({l:String(d.getDate()),v})}
  // last 12 cycles, oldest first (y = year the cycle starts, cur = the current cycle)
  for(let o=0,c=cy;o<12;o++,c=cycleOf(addDays(c.start,-1),D)){const a=dk(c.start),b=dk(c.end);mons.unshift({l:MON[c.start.getMonth()].toUpperCase()+(D>1?' '+c.start.getDate():''),y:c.start.getFullYear(),cur:o==0,v:sum(ex.filter(t=>within(t,a,b)))})}
  const chg=cats.map(c=>{const a=sd(0,7,c.c),b=sd(7,14,c.c);return{c:c.c,a,b,d:a-b,pct:b?Math.round((a-b)/b*100):null}});
  const avg7=(sd(0,7)-sd(0,7,'bills'))/7,left=dim-dom,wk0=dk(back(6));
  const balance=s.opening+sum(inc)-sum(ex);
  const weekNet=s.txns.filter(t=>kd(t)>=wk0).reduce((a,t)=>a+(t.type=='income'?t.amt:-t.amt),0);
  const tod=[0,0,0,0];mx.forEach(t=>{const h=+t.date.slice(11,13);tod[h<11?0:h<14?1:h<18?2:3]+=t.amt});
  return{T,sd:D,start:cy.start,end:cy.end,label:cycleLabel(cy,D),prevLabel:cycleLabel(pc,D),dim,dom,left,cats,spent,income,mcount:mx.length+mi.length,deposits:mi.length,big:Math.max(0,...mx.map(t=>t.amt)),avg:(spent-(by.bills||0))/dom,dl,streak,last14,da,wd,we,weeks,daily7,daily,days,mons,chg,avg7,fc:spent+avg7*left,balance,weekNet,tod,lastTotal,lastMTD,prev:pc.start,delta:lastMTD?Math.round((spent-lastMTD)/lastMTD*100):0,alloc:cats.reduce((a,c)=>a+c.l,0),tsp:cats.reduce((a,c)=>a+c.sp,0),endLabel:MON[cy.end.getMonth()]+' '+cy.end.getDate(),day,wkStart:back(6)}
};
