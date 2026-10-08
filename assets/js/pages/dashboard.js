/**
 * Vault — pages/dashboard
 * Dashboard: balance, stats, streak, quick-add, recent activity.
 */
(()=>{
const pills=()=>{$('.tag-pills').innerHTML=Object.keys(V.get().cats).concat('income').map(c=>`<input class="pill-input" type="radio" name="tag" id="tag-${c}" value="${c}"/><label class="pill-label" for="tag-${c}">#${c.toUpperCase()}</label>`).join('')};
function render(){
 const s=V.get(),st=V.stats(s),x=V.insights(st),b=st.balance;
 $('#bal').innerHTML=`<sup>₹</sup>${(b<0?'-':'')+Math.floor(Math.abs(b)).toLocaleString('en-IN')}<span style="color:var(--yellow)">.${Math.abs(b%1).toFixed(2).slice(2)}</span>`;
 const bc=$('#balance-change-indicator');bc.className='balance-change'+(st.weekNet<0?' negative':'');bc.textContent=(st.weekNet<0?'▼ −':'▲ +')+fmt(Math.abs(st.weekNet))+' this week';
 const top=[...st.cats].sort((a,c)=>c.sp-a.sp)[0],left=st.alloc-st.tsp;
 [[fmt(st.spent),(st.delta>=0?'↑ ':'↓ ')+Math.abs(st.delta)+'% vs last month'],['#'+top.c.toUpperCase(),fmt(top.sp)+' this month'],[fmt(st.avg),st.avg<=st.dl?'↓ '+fmt(st.dl-st.avg)+' under daily goal':'↑ '+fmt(st.avg-st.dl)+' over daily goal'],[fmt(Math.max(left,0)),'Budget left until '+st.endLabel]].forEach((a,i)=>{$('#s'+(i+1)+'v').textContent=a[0];$('#s'+(i+1)+'s').textContent=a[1]});
 $('#streak-n').textContent=st.streak;
 $('#streak-dots').innerHTML=st.last14.map(d=>`<div class="streak-dot" style="${d.good?'':'background:var(--hot-pink);color:#fff'}">${d.l}</div>`).join('');
 $('#transaction-list').innerHTML=s.txns.slice(0,7).map(t=>`<div class="transaction-item" tabindex="0"><div class="txn-icon">${s.cats[t.cat]||'💸'}</div><div class="txn-info"><div class="txn-name">${esc(t.name)}</div><div class="txn-meta"><span class="tag tag-${esc(t.cat)}">#${esc(t.cat.toUpperCase())}</span><span class="txn-date mono">${dlabel(t.date.slice(0,10))}</span></div></div><div class="txn-amount ${t.type=='income'?'income':'expense'}">${t.type=='income'?'+':'−'}${fmt(t.amt)}</div></div>`).join('')||'<p>No transactions yet.</p>';
 $('#mlabel').textContent=mlabel();
 $('#budget-bars').innerHTML=[...st.cats].sort((a,c)=>c.pct-a.pct).slice(0,4).map((c,i)=>`<div class="budget-row"><span class="budget-row-label">${c.e} ${cap(c.c)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(c.pct,100)}%;background:${c.over>0?'var(--hot-pink)':colorOf(c.c,i)}"><span class="bar-pct">${c.pct}%${c.over>0?' ⚠️':''}</span></div></div><span class="budget-row-amt mono">${fmt(c.sp)}</span></div>`).join('');
 $('#ins-title').textContent=x[0].t;$('#ins-text').innerHTML=x.slice(0,2).map(i=>i.x).join(' ');$('#ins-tip').textContent='💡 '+x[0].tip;
}
pills();$('#txn-date').value=dk(new Date());
$('#quick-add-form').onsubmit=e=>{e.preventDefault();const a=+$('#amount').value,tg=document.querySelector('[name=tag]:checked');
 if(!(a>0)||!tg)return V.toast('Enter an amount and pick a tag');
 const c=tg.value;V.add({name:$('#txn-note').value.trim()||cap(c),cat:c,amt:a,type:c=='income'?'income':'expense',date:($('#txn-date').value||dk(new Date()))+'T'+new Date().toTimeString().slice(0,5)});
 e.target.reset();$('#txn-date').value=dk(new Date());V.toast('Logged ✓')};
$('#btn-add').onclick=()=>openMoneyModal('add');
$('#btn-withdraw').onclick=()=>openMoneyModal('withdraw');
$('#btn-history').onclick=$('#btn-see-all').onclick=()=>location.href='transactions.html';
$('#btn-more-insights').onclick=()=>location.href='insights.html';
addEventListener('vault',render);render();
})();
