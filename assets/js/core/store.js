/**
 * Vault — core/store
 * Single source of truth. State lives in localStorage; every write fires a "vault" event so pages re-render.
 */
const STORE_KEY='vault:v2';

const V={
 get(){try{const s=JSON.parse(localStorage.getItem(STORE_KEY));if(s&&s.txns)return s}catch(e){}return V.reset(true)},
 save(s,q){try{localStorage.setItem(STORE_KEY,JSON.stringify(s))}catch(e){}if(!q)dispatchEvent(new Event('vault'))},
 reset(q){const s=seed();V.save(s,q);return s},
 clear(){const s=V.get();s.txns=[];s.opening=0;V.save(s)},
 add(t){const s=V.get();s.txns.unshift({id:Date.now(),...t});s.txns.sort((a,b)=>b.date.localeCompare(a.date));V.save(s)},
 del(id){const s=V.get();s.txns=s.txns.filter(t=>t.id!=id);V.save(s)},
 limit(c,v,q){const s=V.get();s.budgets[c]=+v;V.save(s,q)},
 removeBudget(c){const s=V.get();delete s.budgets[c];V.save(s)},
 addCat(c,e,v){const s=V.get();s.cats[c]=e;s.budgets[c]=+v;V.save(s)}
};
W.V=V;

// Keep other tabs/windows in sync.
addEventListener('storage',e=>{if(e.key==STORE_KEY)dispatchEvent(new Event('vault'))});
