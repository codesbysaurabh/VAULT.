/**
 * Vault — core/ui
 * Shared UI behaviour: toast notifications, "clear all" action, header month badge.
 */
V.toast=function(m){let t=$('#vt');if(!t){t=document.createElement('div');t.id='vt';document.body.append(t)}t.textContent=m;t.className='show';clearTimeout(t._h);t._h=setTimeout(()=>t.className='',2400)};
W.showToast=m=>V.toast(m);
W.clearAll=async()=>{if(await confirmBox({title:'Clear all data?',text:'This deletes every transaction, including demo data, and starts fresh. It cannot be undone.',ok:'Delete everything'})){V.clear();V.toast('All data cleared — fresh start')}};
W.resetDemo=async()=>{if(await confirmBox({title:'Reset to demo data?',text:'Your current transactions will be replaced with sample data.',ok:'Reset',danger:false}))V.reset()};
document.addEventListener('DOMContentLoaded',()=>{const b=$('.header-badge');if(b&&/20\d\d/.test(b.textContent))b.textContent=(b.textContent[0]=='●'?'● ':'')+mlabel()});

/**
 * Money dialog used by the dashboard "Add Money" / "Withdraw" buttons.
 * @param {'add'|'withdraw'} mode
 */
W.openMoneyModal=(mode='add')=>{
 const add=mode=='add',old=$('#money-modal');if(old)old.remove();
 const o=document.createElement('div');o.id='money-modal';o.className='vm-overlay';
 o.innerHTML=`<div class="vm-box" role="dialog" aria-modal="true" aria-labelledby="vm-title">
  <h2 class="vm-title" id="vm-title">${add?'Add Money ＋':'Withdraw ↑'}</h2>
  <p class="vm-sub">${add?'Log money coming in':'Log cash going out'}</p>
  <label class="vm-label" for="vm-amt">Amount</label>
  <div class="vm-amt"><span>₹</span><input id="vm-amt" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00" autocomplete="off"></div>
  <div class="vm-quick">${[100,500,1000,5000].map(n=>`<button type="button" data-q="${n}">+${n.toLocaleString('en-IN')}</button>`).join('')}</div>
  <label class="vm-label" for="vm-note">Note (optional)</label>
  <input class="vm-note" id="vm-note" maxlength="60" autocomplete="off" placeholder="${add?'e.g. Pocket money':'e.g. ATM'}">
  <div class="vm-err" id="vm-err" role="alert"></div>
  <div class="vm-actions"><button type="button" class="vm-save${add?'':' out'}">${add?'ADD MONEY ✓':'WITHDRAW ✓'}</button><button type="button" class="vm-cancel">Cancel</button></div>
 </div>`;
 document.body.append(o);
 requestAnimationFrame(()=>o.classList.add('open'));
 const amt=$('#vm-amt'),err=$('#vm-err');
 const close=()=>{o.classList.remove('open');document.removeEventListener('keydown',key);setTimeout(()=>o.remove(),200)};
 const save=()=>{
  const a=Math.round(+amt.value*100)/100,bal=V.stats(V.get()).balance;
  if(!(a>0)){err.textContent='Enter an amount greater than 0';amt.focus();return}
  if(!add&&a>bal){err.textContent='That is more than your balance ('+fmt(bal)+')';amt.focus();return}
  V.add({name:$('#vm-note').value.trim()||(add?'Added Money':'Withdrawal'),cat:add?'income':'cash',amt:a,type:add?'income':'expense',date:nowIso()});
  close();V.toast(fmt(a)+(add?' added':' withdrawn'));
 };
 const key=e=>{if(e.key=='Escape')close();else if(e.key=='Enter'&&e.target.tagName=='INPUT')save()};
 o.addEventListener('click',e=>{
  const q=e.target.closest('[data-q]');
  if(q){amt.value=Math.round(((+amt.value||0)+ +q.dataset.q)*100)/100;err.textContent='';amt.focus();return}
  if(e.target===o||e.target.closest('.vm-cancel'))close();
  else if(e.target.closest('.vm-save'))save();
 });
 document.addEventListener('keydown',key);
 amt.focus();
};

/**
 * In-app confirmation dialog (replaces window.confirm).
 * @returns {Promise<boolean>} true if the user confirmed.
 */
W.confirmBox=({title,text,ok='Confirm',danger=true})=>new Promise(res=>{
 const o=document.createElement('div');o.className='vm-overlay';
 o.innerHTML=`<div class="vm-box" role="alertdialog" aria-modal="true"><h2 class="vm-title">${esc(title)}</h2><p class="vm-text">${esc(text)}</p><div class="vm-actions"><button type="button" class="vm-save${danger?' out':''}">${esc(ok)}</button><button type="button" class="vm-cancel">Cancel</button></div></div>`;
 document.body.append(o);
 requestAnimationFrame(()=>o.classList.add('open'));
 const done=v=>{o.classList.remove('open');document.removeEventListener('keydown',key);setTimeout(()=>o.remove(),200);res(v)};
 const key=e=>{if(e.key=='Escape')done(false)};
 o.addEventListener('click',e=>{if(e.target===o||e.target.closest('.vm-cancel'))done(false);else if(e.target.closest('.vm-save'))done(true)});
 document.addEventListener('keydown',key);
 o.querySelector('.vm-cancel').focus();
});
