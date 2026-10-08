/**
 * Vault — pages/budget
 * Budgets: per-category limits, global sliders, summary.
 */
(()=>{
let view='all',sort='',emoji='📺';
const stat=c=>c.pct>100?['danger','🔥 OVER LIMIT']:c.pct>=70?['caution','⚡ CAUTION']:c.pct>=40?['safe','✓ ON TRACK']:['healthy','● HEALTHY'];
const bcls=c=>c.pct>100?'warn':c.pct>=70?'pink':'green';
const rng=c=>`min="${Math.max(5,Math.round(c.l*.2))}" max="${Math.max(c.l*3,100)}" step="${c.l>=500?25:c.l>=100?10:5}" value="${c.l}"`;
const card=c=>{const[q,l]=stat(c);return `<div class="budget-card${c.pct>100?' over-budget':''}" id="card-${c.c}"><button class="bc-remove" data-remove="${c.c}" title="Remove this limit" aria-label="Remove ${cap(c.c)} budget">✕</button><div class="limit-sticker"><span class="sticker-lbl">Limit</span><span class="sticker-val">${fmt(c.l)}</span></div><div class="bc-header"><div class="bc-icon">${c.e}</div><div class="bc-info"><div class="bc-category">Monthly Budget</div><div class="bc-merchant">${esc(c.c.toUpperCase())}</div></div></div><span class="bc-status ${q}">${l}</span><div class="bc-numbers"><div class="bc-spent">${fmt(c.sp)}</div><div class="bc-of">of</div><div class="bc-limit-inline">${fmt(c.l)}</div></div><div class="bc-bar-wrap"><div class="bc-bar-fill ${bcls(c)}" style="width:${Math.min(c.pct,100)}%"><span class="bc-pct" style="${c.pct>=70?'color:#fff':''}">${c.pct}%</span></div></div><div class="bc-slider-wrap"><div class="bc-slider-label"><span>Adjust Limit</span><span class="bc-slider-val">${fmt(c.l)}</span></div><input type="range" class="brute-slider" data-cat="${c.c}" ${rng(c)}></div></div>`};
const grow=c=>{const mn=Math.max(5,Math.round(c.l*.2)),mx=Math.max(c.l*3,100);return `<div class="ga-row" id="g-${c.c}"><div class="ga-row-header"><span class="ga-row-name">${c.e} ${cap(c.c)}</span><span class="ga-row-amount">${fmt(c.l)}</span></div><div class="ga-track"><div class="ga-fill" style="width:${(c.l-mn)/(mx-mn)*100}%;background:${colorOf(c.c)}"></div><input type="range" class="ga-slider" data-cat="${c.c}" ${rng(c)}></div></div>`};
function summary(st){
 const al=st.alloc,sp=st.tsp,left=al-sp,pct=al?Math.round(sp/al*100):0,x=V.insights(st);
 $('#tstats').innerHTML=[[fmt(sp),'Spent','var(--hot-pink)'],[fmt(left),'Remaining',left<0?'var(--hot-pink)':'#16A34A'],[pct+'%','Used','var(--orange)'],[st.cats.length,'Categories','']].map(a=>`<div class="title-stat"><span class="sv" style="color:${a[2]}">${a[0]}</span><span class="sl">${a[1]}</span></div>`).join('');
 $('#ga-total').textContent=fmt(al);
 $('#aside').innerHTML=`<div class="sa-card black"><div class="sa-label">Total Allocated</div><div class="sa-val">${fmt(al)}</div><div class="sa-sub">across ${st.cats.length} categories</div></div><div class="sa-card pink"><div class="sa-label">Total Spent</div><div class="sa-val">${fmt(sp)}</div><div class="sa-sub">${pct}% of monthly allocation</div></div><div class="sa-card green"><div class="sa-label">Still Available</div><div class="sa-val">${fmt(Math.max(left,0))}</div><div class="sa-sub">${st.left} days left this month</div></div><div class="insight-blob"><h3 class="display">💡 VAULT SAYS</h3><p>${x.slice(0,2).map(i=>i.x).join(' ')}</p><button class="insight-cta" onclick="location.href='insights.html'">View Full Report →</button></div>`;
}
function build(){
 const st=V.stats(V.get());let L=st.cats.slice();
 if(view=='on')L=L.filter(c=>c.over<=0);if(view=='over')L=L.filter(c=>c.over>0);
 if(sort=='pct')L.sort((a,b)=>b.pct-a.pct);if(sort=='amt')L.sort((a,b)=>b.sp-a.sp);
 $('#budget-grid').innerHTML=L.map(card).join('')+`<div class="empty-card" role="button" tabindex="0" onclick="openModal()"><div class="empty-plus">＋</div><div class="empty-label">[+] ADD NEW LIMIT</div><div class="empty-sub">Click to set a budget category</div></div>`;
 $('#ga-sliders').innerHTML=st.cats.map(grow).join('');
 $('#page-super').textContent='💰 Monthly · '+mlabel();
 summary(st);
}
function upd(cat){
 const st=V.stats(V.get()),c=st.cats.find(x=>x.c==cat),el=$('#card-'+cat);
 if(el){const[q,l]=stat(c);el.classList.toggle('over-budget',c.pct>100);
  el.querySelector('.sticker-val').textContent=el.querySelector('.bc-slider-val').textContent=el.querySelector('.bc-limit-inline').textContent=fmt(c.l);
  const b=el.querySelector('.bc-bar-fill');b.style.width=Math.min(c.pct,100)+'%';b.className='bc-bar-fill '+bcls(c);
  const p=b.querySelector('.bc-pct');p.textContent=c.pct+'%';p.style.color=c.pct>=70?'#fff':'';
  const sb=el.querySelector('.bc-status');sb.className='bc-status '+q;sb.textContent=l}
 const g=$('#g-'+cat);if(g){const i=g.querySelector('input');g.querySelector('.ga-row-amount').textContent=fmt(c.l);g.querySelector('.ga-fill').style.width=(c.l-i.min)/(i.max-i.min)*100+'%'}
 $$('[data-cat="'+cat+'"]').forEach(i=>i.value=c.l);
 summary(st);
}
document.addEventListener('input',e=>{const c=e.target.dataset&&e.target.dataset.cat;if(c){V.limit(c,e.target.value,true);upd(c)}});
document.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.cat)build()});
const G=['All','On Track','⚠ Over Budget'];
window.setChip=b=>{const t=b.textContent.trim(),g=G.includes(t);$$('.tb-chip').forEach(c=>{if(G.includes(c.textContent.trim())==g)c.classList.remove('on')});b.classList.add('on');if(g)view=t=='All'?'all':t=='On Track'?'on':'over';else sort=t=='% Used'?'pct':'amt';build()};
window.openModal=()=>{$('#modal-overlay').classList.add('open');$('#m-name').focus()};
window.closeModal=()=>$('#modal-overlay').classList.remove('open');
window.closeModalOnBg=e=>{if(e.target.id=='modal-overlay')closeModal()};
window.pickEmoji=(b,e)=>{$$('.ep-btn').forEach(x=>x.classList.remove('chosen'));b.classList.add('chosen');emoji=e};
window.saveNewBudget=()=>{
 const key=$('#m-name').value.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),lim=+$('#m-limit').value;
 if(!key||!(lim>0))return V.toast('Enter a name and a limit');
 if(V.get().budgets[key])return V.toast('That category already exists');
 V.addCat(key,emoji,lim);$('#m-name').value=$('#m-limit').value='';closeModal();V.toast('✓ "'+key.toUpperCase()+'" budget created!');
};
window.saveBudgets=()=>V.toast('✅ Budgets saved on this device');
document.addEventListener('keydown',e=>{if(e.key=='Escape')closeModal()});
$('#budget-grid').addEventListener('click',async e=>{
 const b=e.target.closest('[data-remove]');if(!b)return;
 const k=b.dataset.remove;
 if(Object.keys(V.get().budgets).length<=1)return V.toast('Keep at least one budget');
 if(await confirmBox({title:'Remove '+cap(k)+' limit?',text:'The budget card is deleted. Your '+k+' transactions are kept and still count toward total spending.',ok:'Remove limit'})){V.removeBudget(k);V.toast(cap(k)+' limit removed')}
});
addEventListener('vault',build);build();
})();
