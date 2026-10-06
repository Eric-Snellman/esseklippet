// All kommunikation med backend. Tre lägen:
// 1) Supabase (CONFIG.SUPABASE_URL satt)  2) Egen backend (CONFIG.API_BASE, se API.md)  3) Demo (localStorage)
const API=(()=>{
  const sb=CONFIG.SUPABASE_URL&&window.supabase
    ?window.supabase.createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_ANON_KEY):null;
  const base=CONFIG.API_BASE,K="ek_demo_bookings";
  const demo=()=>JSON.parse(localStorage.getItem(K)||"[]");
  const save=l=>localStorage.setItem(K,JSON.stringify(l));
  const err=(status)=>{const e=new Error("HTTP "+status);e.status=status;return e};
  async function http(method,path,body){
    const r=await fetch(base+path,{method,credentials:"include",
      headers:body?{"Content-Type":"application/json"}:{},body:body?JSON.stringify(body):undefined});
    if(!r.ok)throw err(r.status);
    return r.status===204?null:r.json();
  }
  const empty=()=>{const o={};CONFIG.STAFF.forEach(s=>o[s]=[]);return o};
  return{
    async availability(date){
      if(sb){
        const{data,error}=await sb.rpc("taken_slots",{d:date});
        if(error)throw err(500);
        const o=empty();data.forEach(r=>(o[r.staff]=o[r.staff]||[]).push(r.time));return o;
      }
      if(base)return http("GET","/api/availability?date="+date);
      const o=empty();demo().filter(b=>b.date===date).forEach(b=>o[b.staff]&&o[b.staff].push(b.time));return o;
    },
    async book(b){
      if(sb){
        const{error}=await sb.from("bookings").insert(b);
        if(error)throw err(error.code==="23505"?409:400);
        return{};
      }
      if(base)return http("POST","/api/bookings",b);
      const l=demo();
      if(l.some(x=>x.date===b.date&&x.time===b.time&&x.staff===b.staff))throw err(409);
      const id=String(Date.now());l.push({id,...b});save(l);return{id};
    },
    async login(password){
      if(sb){
        const{error}=await sb.auth.signInWithPassword({email:CONFIG.ADMIN_EMAIL,password});
        if(error)throw err(401);return{};
      }
      return base?http("POST","/api/admin/login",{password}):{ok:true};
    },
    async list(from){
      if(sb){
        const{data:{session}}=await sb.auth.getSession();
        if(!session)throw err(401);
        const{data,error}=await sb.from("bookings").select("*").gte("date",from).order("date").order("time");
        if(error)throw err(401);return data;
      }
      if(base)return http("GET","/api/admin/bookings?from="+from);
      return demo().filter(b=>b.date>=from);
    },
    async remove(id){
      if(sb){const{error}=await sb.from("bookings").delete().eq("id",id);if(error)throw err(500);return}
      if(base)return http("DELETE","/api/admin/bookings/"+id);
      save(demo().filter(b=>b.id!==id));
    }
  };
})();
