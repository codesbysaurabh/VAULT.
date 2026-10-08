/**
 * Vault — core/insights
 * Rule engine that turns stats into human-readable commentary. Add a rule = push another object.
 */
V.insights=function(st){const o=[];
  st.cats.filter(c=>c.over>0).sort((a,b)=>b.over-a.over).forEach(c=>o.push({p:100,t:`${cap(c.c)} is ${fmt(c.over)} over limit`,x:`<strong>${cap(c.c)}</strong> blew past the ${fmt(c.l)} limit by <strong>${fmt(c.over)}</strong>. Raise it to ${fmt(Math.ceil((c.sp+25)/25)*25)} or cut back.`,tip:`Pause ${c.c} spending so the overage stops growing.`}));
  st.cats.filter(c=>c.pct>=80&&c.over<=0).sort((a,b)=>b.pct-a.pct).slice(0,1).forEach(c=>o.push({p:80,t:`${cap(c.c)} is at ${c.pct}%`,x:`<strong>${cap(c.c)}</strong> has only <strong>${fmt(-c.over)}</strong> left with ${st.left} days to go.`,tip:`Skip one ${c.c} purchase this week to stay under.`}));
  if(st.wd>0&&st.we/st.wd>=1.5)o.push({p:70,t:`You spend ${(st.we/st.wd).toFixed(1)}× more on weekends`,x:`Weekend spend averages <strong>${fmt(st.we)}/day</strong> vs <strong>${fmt(st.wd)}/day</strong> on weekdays.`,tip:`Cutting one weekend splurge saves about ${fmt(st.we-st.wd)}.`});
  const b=st.cats.filter(c=>c.sp>0&&c.over<=0).sort((a,b)=>a.pct-b.pct)[0];
  if(b)o.push({p:20,t:`${cap(b.c)} is under control`,x:`<strong>${cap(b.c)}</strong> is only at ${b.pct}% of its limit. Nice.`,tip:`Keep ${b.c} at this pace and you finish the month under budget.`});
  if(!o.length)o.push({p:1,t:'No spending yet',x:'Log a transaction to see insights.',tip:'Add your first transaction from the dashboard.'});
  return o.sort((a,b)=>b.p-a.p)};
