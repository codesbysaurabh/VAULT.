/**
 * Vault — core/seed
 * Deterministic demo data (≈75 days of transactions relative to today).
 */
function seed(){
 let r=7;const rnd=()=>(r=(r*16807)%2147483647)/2147483647,T=new Date(),t=[];let id=1;
 const add=(i,h,name,cat,amt,type='expense')=>{const d=new Date(T.getFullYear(),T.getMonth(),T.getDate()-i,h,Math.floor(rnd()*60));t.push({id:id++,name,cat,amt:Math.round(amt*100)/100,type,date:dk(d)+'T'+p2(d.getHours())+':'+p2(d.getMinutes())})};
 const M={food:[['Ramen & Co.',"Domino's Pizza",'Nobu Restaurant'],8,25],coffee:[['Blue Bottle Coffee','Third Wave Cafe'],4,9],transport:[['Metro Card Top-Up','Uber Ride'],6,32],gaming:[['Steam Store','PlayStation Store'],10,60],fashion:[['ASOS Haul','Zara'],20,75]};
 const WT=[['food',.35],['coffee',.5],['transport',.65],['gaming',.72],['fashion',.78]];
 for(let i=75;i>=0;i--){
  const dm=new Date(T.getFullYear(),T.getMonth(),T.getDate()-i).getDate();
  if(dm==1)add(i,9,'Rent','bills',1600);
  if(dm==2)add(i,10,'Paycheck Deposit','income',2480,'income');
  if(dm==5)add(i,11,'Spotify Premium','music',9.99);
  for(let n=0;n<2;n++){const x=rnd(),h=WT.find(w=>x<w[1]);if(h){const m=M[h[0]];add(i,8+Math.floor(rnd()*13),m[0][Math.floor(rnd()*m[0].length)],h[0],m[1]+rnd()*(m[2]-m[1]))}}
 }
 t.sort((a,b)=>b.date.localeCompare(a.date));
 return{opening:3000,budgets:{food:500,transport:200,fashion:300,gaming:150,coffee:100,bills:1800,music:30},cats:{food:'🍕',gaming:'🎮',transport:'🚇',coffee:'☕',fashion:'👟',bills:'🏠',music:'🎵',fitness:'🏋️'},txns:t};
}
