const $=id=>document.getElementById(id);
let taken={},chosen=null;
const pad=n=>String(n).padStart(2,"0");
const times=(()=>{const o=CONFIG.OPEN,t=[];
  for(let m=o.start*60;m<o.end*60;m+=o.stepMin)t.push(pad(Math.floor(m/60))+":"+pad(m%60));return t})();

$("services").innerHTML=CONFIG.SERVICES.map(s=>`<div class="card"><h3>${s[0]}</h3><div class="price">från ${s[1]} €</div><div class="sub">${s[2]}</div></div>`).join("");
$("svc").innerHTML=CONFIG.SERVICES.map(s=>`<option>${s[0]}</option>`).join("");
$("who").innerHTML=CONFIG.STAFF.map(s=>`<option>${s}</option>`).join("");
const today=new Date().toISOString().slice(0,10);
$("date").min=today;$("date").value=today;

function msg(t){const m=$("msg");m.textContent=t;m.hidden=false}
function render(){
  const d=$("date").value,w=$("who").value;
  const closed=CONFIG.OPEN.closedWeekdays.includes(new Date(d+"T12:00").getDay());
  $("slots").innerHTML=closed?'<span class="sub">Stängt den dagen.</span>':times.map(t=>
    `<button type="button" class="slot${chosen===t?" sel":""}" data-t="${t}" ${(taken[w]||[]).includes(t)?"disabled":""}>${t}</button>`).join("");
  $("go").disabled=!chosen;
}
async function load(){
  chosen=null;
  try{taken=await API.availability($("date").value)}catch{taken={};msg("Kunde inte hämta lediga tider. Ring 040 9382223.")}
  render();
}
$("slots").onclick=e=>{if(e.target.dataset.t){chosen=e.target.dataset.t;render()}};
$("date").onchange=load;
$("who").onchange=()=>{chosen=null;render()};

$("f").onsubmit=async e=>{
  e.preventDefault();$("go").disabled=true;
  const b={date:$("date").value,time:chosen,staff:$("who").value,service:$("svc").value,
           name:$("name").value.trim(),phone:$("tel").value.trim()};
  try{
    await API.book(b);
    msg(`Tack ${b.name}! Din tid ${b.date} kl ${b.time} hos ${b.staff} är bokad.`);
    $("name").value="";$("tel").value="";
  }catch(err){
    msg(err.status===409?"Tyvärr, tiden hann bli bokad. Välj en annan.":"Bokningen misslyckades. Ring 040 9382223.");
  }
  load();
};
load();
