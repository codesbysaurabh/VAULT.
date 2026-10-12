/**
 * Vault — pages/transactions
 * Transactions: filter, search, paginate, delete, export.
 */
(()=>{
let F={type:'',tag:'',q:'',n:12},csig='';
const tm=d=>new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}).toUpperCase();
// Category filter chips are built from the store and rebuilt whenever the category set changes.
const chips=()=>{
 const cats=V.get().cats,sig=Object.entries(cats).join('|');if(sig==csig)return;csig=sig;
 $$('.filter-chip[data-c]').forEach(x=>x.remove());
 $('.search-box').insertAdjacentHTML('beforebegin',Object.entries(cats).map(([c,e])=>`<button class="filter-chip${F.tag==c?' active blue':''}" data-c="${esc(c)}" onclick="filterTag(this,'${esc(c)}')">${esc(e)} ${esc(cap(c))}</button>`).join(''));
};
function render(){
 chips();
 const s=V.get(),st=V.stats(s),L=s.txns.filter(t=>(!F.type||t.type==F.type)&&(!F.tag||t.cat==F.tag)&&(t.name+' '+t.cat).toLowerCase().includes(F.q));
 let last='',h='';
 L.slice(0,F.n).forEach(t=>{const k=t.date.slice(0,10);if(k!=last){last=k;h+=`<div class="date-group-label">${k==dk(new Date())?'Today — ':''}${dlabel(k)}</div>`}
  h+=`<div class="txn-card" tabindex="0" data-type="${t.type}" data-tag="${esc(t.cat)}"><div class="txn-icon-box">${esc(s.cats[t.cat]||'💸')}</div><div class="txn-body"><div class="txn-merchant">${esc(t.name)}</div><div class="txn-meta"><span class="pill pill-${esc(t.cat)}"${catStyle(t.cat)}>#${esc(t.cat.toUpperCase())}</span><span class="txn-date mono">${dlabel(k)} · ${tm(t.date)}</span><button class="del" data-id="${t.id}" title="Delete" aria-label="Delete transaction">✕</button></div></div><div class="txn-amount-box ${t.type}">${t.type=='income'?'+':'−'}${fmt(t.amt)}</div></div>`});
 if(!L.length)h='<p style="padding:20px;font-weight:700">No transactions match.</p>';
 if(L.length>F.n)h+='<div class="load-more-bar"><button class="btn-load">Load More Transactions ↓</button></div>';
 $('#txn-list').innerHTML=h;$('#txn-count').textContent=L.length+' ENTRIES';
 $('#eyebrow').textContent='📋 '+st.label+' · All Accounts';
 $('.summary-card .card-label').textContent='📅 '+st.label+' Summary';
 $('#hstats').innerHTML=[['red','−'+fmt(st.spent),'Total Spent',''],['green','+'+fmt(st.income),'Total Income',''],['blue',st.mcount,'Transactions',''],['',fmt(st.avg),'Avg. Per Day','color:var(--orange)']].map(a=>`<div class="hero-stat-pill"><span class="pill-val ${a[0]}" style="${a[3]}">${a[1]}</span><span class="pill-label">${a[2]}</span></div>`).join('');
 const net=st.income-st.spent;
 $('#sum-net').textContent=(net<0?'−':'')+fmt(Math.abs(net));
 $('#sum-split').innerHTML=`<div class="split-item"><div class="split-label">Spent</div><div class="split-val red mono">−${fmt(st.spent)}</div></div><div class="split-item"><div class="split-label">Earned</div><div class="split-val green mono">+${fmt(st.income)}</div></div>`;
 $('#bd').innerHTML=[...st.cats].sort((a,b)=>b.pct-a.pct).slice(0,5).map((c,i)=>`<div class="breakdown-row"><span class="breakdown-emoji">${esc(c.e)}</span><div class="breakdown-bar-wrap"><div class="breakdown-bar-fill" style="width:${Math.min(c.pct,100)}%;background:${colorOf(c.c,i)}"></div></div><span class="breakdown-pct mono">${c.pct}%</span></div>`).join('');
 $('#qs').innerHTML=[[fmt(st.big),'Biggest Spend',''],[st.mcount,'Total Txns',''],[fmt(st.avg),'Daily Avg','color:var(--hot-pink)'],[st.deposits,'Deposits','color:#16A34A']].map(a=>`<div class="qs-item"><div class="qs-val display" style="${a[2]}">${a[0]}</div><div class="qs-lbl">${a[1]}</div></div>`).join('');
}
const mark=(b,c)=>{$$('.filter-chip').forEach(x=>x.classList.remove('active','pink','green','blue'));b.classList.add('active',c)};
window.filterAll=b=>{mark(b,'pink');F.type=F.tag='';F.n=12;render()};
window.filterBy=(b,t)=>{mark(b,t=='income'?'green':'pink');F.type=t;F.tag='';F.n=12;render()};
window.filterTag=(b,t)=>{mark(b,'blue');F.tag=t;F.type='';F.n=12;render()};
window.searchTxns=q=>{F.q=q.trim().toLowerCase();F.n=12;render()};
$$('.filter-chip[onclick^=filterTag]').forEach(x=>x.remove()); // static placeholders from the HTML
$('#txn-list').onclick=e=>{if(e.target.closest('.del')){V.del(e.target.closest('.del').dataset.id);return}if(e.target.closest('.btn-load')){F.n+=12;render()}};
// CSV: quote text cells and neutralise spreadsheet formulas (=, +, -, @) so imported names can't execute.
window.exportCSV=()=>{
 const q=v=>{v=String(v);if(/^[=+\-@\t\r]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
 const csv='\ufeff'+[['Date','Name','Category','Type','Amount'].join(','),...V.get().txns.map(t=>[q(t.date),q(t.name),q(t.cat),q(t.type),t.amt].join(','))].join('\n');
 const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');
 a.href=u;a.download='vault-transactions.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
 V.toast('CSV downloaded! 📄');
};
window.exportPDF=()=>print();
window.copySheet=()=>{const c=v=>String(v).replace(/[\t\r\n]+/g,' ');return navigator.clipboard.writeText(V.get().txns.map(t=>[t.date,t.name,t.cat,t.type,t.amt].map(c).join('\t')).join('\n')).then(()=>V.toast('Copied to clipboard! 📋'),()=>V.toast('Clipboard blocked by browser'))};
addEventListener('vault',render);render();
})();
