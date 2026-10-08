/**
 * Vault — pages/insights
 * Insights: charts, forecasts, rankings and generated commentary.
 */
(()=>{
let period='MTD',tip=0;
const f=n=>fmt(Math.round(n)),nice=v=>{if(v<=0)return 10;const p=10**Math.floor(Math.log10(v));return Math.ceil(v/p*2)/2*p};
function bars(list,id){const top=nice(Math.max(...list.map(b=>b.v))),hi=list.reduce((a,b,i)=>b.v>list[a].v?i:a,0);
 $(id).innerHTML=`<div class="y-labels">${[1,.75,.5,.25,0].map(k=>`<span>${f(top*k)}</span>`).join('')}</div>`+list.map((b,i)=>`<div class="bar-col"><div class="bar${i==hi&&b.v>0?' highlight':''}" style="--h:${Math.max(b.v/top*100,1)}%;background:${PAL[i%7]}" data-val="${f(b.v)}${i==hi&&b.v>0?' 🔥':''}"></div><span class="bar-xlabel">${b.l}</span></div>`).join('')}
const lv=(v,m)=>{const r=m?v/m:0;return r>.75?'hm-extreme':r>.5?'hm-high':r>.25?'hm-mid':'hm-low'};
function render(){
 const s=V.get(),st=V.stats(s),x=V.insights(st),a=st.wkStart,b=st.T;
 $('#hy').textContent=('📊 WEEK-OVER-WEEK · '+MON[a.getMonth()]+' '+a.getDate()+'–'+(a.getMonth()==b.getMonth()?'':MON[b.getMonth()]+' ')+b.getDate()).toUpperCase();
 const ch=st.chg.filter(c=>c.c!='bills'&&(c.a>0||c.b>0)).sort((p,q)=>Math.abs(q.d)-Math.abs(p.d)),t=ch[0];
 $('#hh').innerHTML=t?(t.pct!==null?`YOU SPENT <mark class="${t.d>0?'pink':'green'}">${Math.abs(t.pct)}% ${t.d>0?'MORE':'LESS'}</mark><br>`:`YOU SPENT <mark class="pink">${f(t.a)}</mark><br>`)+`ON <mark>${t.c.toUpperCase()}</mark><br>THIS WEEK.<br><span style="font-size:0.7em; opacity:0.65;">That's <mark class="cyan">${f(Math.abs(t.d))}</mark> ${t.d>0?'extra':'less'} than last week.</span>`:'NO SPENDING<br>LOGGED YET.';
 $('#hp').innerHTML=ch.filter(c=>c.pct!==null).slice(0,3).map(c=>`<span class="hero-pill ${c.d>0?'p-pink':'p-green'}">${c.d>0?'▲':'▼'} ${cap(c.c)} ${c.d>0?'+':''}${c.pct}%</span>`).join('')||'<span class="hero-pill p-cyan">Need 2 weeks of data</span>';
 const sr={'7D':['Daily Spend — Last 7 Days',st.daily7],MTD:['Daily Spend — '+MON[b.getMonth()]+' So Far',st.daily],'3M':['Monthly Spend — Last 3 Months',st.mons.slice(-3)],YTD:['Monthly Spend — This Year',st.mons.filter(m=>m.y==b.getFullYear())]}[period];
 $('#hct').textContent=sr[0]+' (₹)';bars(sr[1],'#hero-chart');
 const L=st.cats.filter(c=>c.sp>0).sort((p,q)=>q.sp-p.sp),tot=st.tsp||1;
 $('#scsub').textContent=mlabel()+' · Total '+f(st.tsp)+' spent';
 $('#sb').innerHTML=L.map((c,i)=>{const p=Math.round(c.sp/tot*100);return `<div class="seg" style="width:${c.sp/tot*100}%;background:${colorOf(c.c,i)}"><span class="seg-inner-label" style="${p<9?'display:none':''}">${c.c.toUpperCase()}</span><div class="seg-leader"><div class="leader-line"></div><div class="leader-dot"></div><div class="leader-tag">${c.e} ${cap(c.c)} · ${p}%</div></div></div>`}).join('');
 $('#lg').innerHTML=L.map((c,i)=>`<div class="legend-item"><div class="legend-dot" style="background:${colorOf(c.c,i)}"></div>${cap(c.c)}</div>`).join('');
 const d=st.spent-st.lastMTD,p=st.lastMTD?Math.round(Math.abs(d)/st.lastMTD*100):0,sub="margin-top:10px;font-style:italic;font-size:.75rem;font-family:'DM Mono',monospace;";
 $('#vibe').innerHTML=`<div class="vibe-card last-month"><div class="vibe-label">Last Month — ${MON[st.prev.getMonth()]} ${st.prev.getFullYear()}</div><div class="vibe-amount">${f(st.lastTotal)}</div><div class="vibe-sub">total spent</div><div class="vibe-arrow ${d>=0?'down':'up'}">${d>=0?'▼':'▲'}</div><div class="vibe-badge ${d>=0?'badge-down':'badge-up'}">${d>=0?'▼ DOWN':'▲ UP'} ${f(Math.abs(d))} vs NOW</div><div style="${sub}opacity:.6">By this date last month was ${p}% ${d>=0?'cheaper':'pricier'}.</div></div><div class="vibe-card this-month"><div class="vibe-label">This Month — ${mlabel()}</div><div class="vibe-amount">${f(st.spent)}</div><div class="vibe-sub" style="color:rgba(255,255,255,.45)">total spent so far</div><div class="vibe-arrow ${d>0?'up':'down'}">${d>0?'▲':'▼'}</div><div class="vibe-badge ${d>0?'badge-up':'badge-down'}">${d>0?'▲ UP':'▼ DOWN'} ${f(Math.abs(d))} vs LAST MO.</div><div style="${sub}color:rgba(255,255,255,.55)">${st.left} days left. Projected end: <mark class="pink">${f(st.fc)}</mark></div></div>`;
 $('#rl').innerHTML=[...st.cats].sort((p,q)=>q.sp-p.sp).slice(0,3).map((c,i)=>`<div class="rank-item" tabindex="0" data-m="${esc(c.e)} ${cap(c.c)}: ${f(c.sp)} of ${f(c.l)}${c.over>0?' — '+f(c.over)+' OVER! 🚨':''}"><div class="rank-num">${i+1}</div><div class="rank-icon-box">${c.e}</div><div class="rank-info"><div class="rank-pos">${['🥇','🥈','🥉'][i]} #${i+1}${c.over>0?' · OVER BUDGET 🔥':' Biggest Drain'}</div><div class="rank-name display">${c.c.toUpperCase()}</div><div class="rank-meta">${c.over>0?f(c.over)+' OVER your '+f(c.l)+' limit':c.pct+'% of '+f(c.l)+' budget used'}</div></div><div class="rank-amount">${f(c.sp)}</div><div class="rank-pct-bar"><div class="rank-pct-fill" style="width:${Math.min(c.pct,100)}%"></div></div></div>`).join('');
 $('.predict-num').textContent=f(st.fc);
 $('#pb').innerHTML=`Based on your last 7-day average of <strong>${f(st.avg7)}/day</strong>, you're on track to spend <mark>${f(st.avg7*st.left)} more</mark> by month-end.`;
 $('#sgt').textContent=MON[b.getMonth()]+' · Daily Log';
 let h='';for(let n=1;n<=st.dim;n++){const k=st.ym+'-'+String(n).padStart(2,'0'),v=st.day[k]||0;h+=`<div class="streak-day${n>st.dom?'':v?(v<=st.dl?' good':' bad'):' neutral'}" title="${k}">${n}</div>`}
 $('#sgrid').innerHTML=h;
 $('#tipt').innerHTML=x[tip%x.length].tip;
 $('#tsub').textContent='Comparing weekly totals · last 8 weeks';bars(st.weeks,'#trend');
 const w=st.weeks.map(k=>k.v),e=(w[0]+w[1]+w[2]+w[3])/4,r=(w[4]+w[5]+w[6]+w[7])/4,pc=e?Math.round((r-e)/e*100):0;
 $('#tfoot').innerHTML=`↑ Earlier avg ${f(e)}/wk &nbsp;·&nbsp; Recent avg ${f(r)}/wk &nbsp;·&nbsp; Trend: <mark class="${r>e?'pink':'green'}" style="font-style:italic">${pc>=0?'+':''}${pc}%</mark>`;
 const g1=[['🌅 Morning',st.tod[0]],['🍱 Lunch',st.tod[1]],['☀️ Arvo',st.tod[2]],['🌙 Evening',st.tod[3]]],g2=[['📅 Weekday',st.wd],['🎉 Friday',st.da[5]],['🎊 Saturday',st.da[6]],['😴 Sunday',st.da[0]]];
 $('#hm').innerHTML=[g1,g2].map(g=>{const m=Math.max(...g.map(c=>c[1]));return g.map(c=>`<div class="hm-cell ${lv(c[1],m)}"><span class="hm-val">${f(c[1])}</span>${c[0]}</div>`).join('')}).join('');
}
window.setPeriod=(b,p)=>{$$('.pt-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');period=p;render()};
window.nextTip=()=>{tip++;render()};
$('#rl').onclick=e=>{const r=e.target.closest('.rank-item');if(r)V.toast(r.dataset.m)};
addEventListener('vault',render);render();
})();
