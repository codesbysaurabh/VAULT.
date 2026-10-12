/**
 * Vault — core/store
 * Single source of truth. State lives in localStorage; every write fires a "vault" event so pages re-render.
 * State: { opening, budgets, cats, txns, cycleStart }   (cycleStart = day of month your month begins, 1–31)
 */
const STORE_KEY='vault:v2';
let mem=null,broken=false; // in-memory copy, used only if localStorage is blocked / full

// Fill in anything an older or hand-edited save is missing instead of throwing the data away.
const norm=s=>{
 if(!s||typeof s!='object'||!Array.isArray(s.txns))return null;
 s.budgets=s.budgets&&typeof s.budgets=='object'?s.budgets:{};
 s.cats=s.cats&&typeof s.cats=='object'?s.cats:{};
 s.opening=+s.opening||0;
 s.cycleStart=clampDay(s.cycleStart);
 return s;
};

const V={
 get(){
  if(broken&&mem)return mem;
  let s=null;try{s=norm(JSON.parse(localStorage.getItem(STORE_KEY)))}catch(e){}
  return s||V.reset(true);
 },
 save(s,q){
  mem=s;
  try{localStorage.setItem(STORE_KEY,JSON.stringify(s));broken=false}
  catch(e){broken=true;if(V.toast)V.toast('Could not save — browser storage is full or blocked')}
  if(!q)dispatchEvent(new Event('vault'));
 },
 // Fresh demo data. Your month-start preference survives a reset.
 reset(q){
  const s=seed();let o=mem;
  try{o=JSON.parse(localStorage.getItem(STORE_KEY))||o}catch(e){}
  s.cycleStart=clampDay(o&&o.cycleStart);
  V.save(s,q);return s;
 },
 clear(){const s=V.get();s.txns=[];s.opening=0;V.save(s)},
 add(t){const s=V.get();s.txns.unshift({id:1+s.txns.reduce((m,x)=>Math.max(m,+x.id||0),0),...t});s.txns.sort((a,b)=>b.date.localeCompare(a.date));V.save(s)},
 del(id){const s=V.get();s.txns=s.txns.filter(t=>t.id!=id);V.save(s)},
 limit(c,v,q){const n=+v;if(!(n>0))return;const s=V.get();s.budgets[c]=n;V.save(s,q)},
 removeBudget(c){const s=V.get();delete s.budgets[c];V.save(s)},
 addCat(c,e,v){const s=V.get();s.cats[c]=s.cats[c]||e;s.budgets[c]=+v;V.save(s)},
 setCycle(d){const s=V.get();s.cycleStart=clampDay(d);V.save(s)}
};
W.V=V;

// Keep other tabs/windows in sync.
addEventListener('storage',e=>{if(e.key==STORE_KEY)dispatchEvent(new Event('vault'))});
