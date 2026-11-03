import { jsonError, requireUser, supabaseRest } from "../../../../lib/cashback-server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request){
 const auth=await requireUser(request);if(auth.error)return auth.error;
 const id=encodeURIComponent(auth.user.id);
 const [prefs,notifications]=await Promise.all([
  supabaseRest(auth.cfg,"campaign_subscriptions?select=audience&customer_id=eq."+id),
  supabaseRest(auth.cfg,"campaign_notifications?select=id,created_at,read_at,campaign:campaigns(id,title,description,campaign_type,ends_at)&customer_id=eq."+id+"&order=created_at.desc&limit=50")
 ]);
 if(!prefs.response.ok||!notifications.response.ok)return jsonError("دریافت تنظیمات اعلان‌ها ناموفق بود.",503);
 return Response.json({audiences:(prefs.data||[]).map(x=>x.audience),notifications:notifications.data||[]},{headers:{"Cache-Control":"no-store"}});
}
export async function PUT(request){
 const auth=await requireUser(request);if(auth.error)return auth.error;
 let body;try{body=await request.json()}catch{return jsonError("درخواست نامعتبر است.")};
 const allowed=new Set(["all","members","maxima","teana","murano"]);
 const audiences=Array.isArray(body?.audiences)?[...new Set(body.audiences.filter(x=>allowed.has(x)))]:null;
 if(!audiences)return jsonError("فهرست دنبال‌کردن معتبر نیست.");
 const id=encodeURIComponent(auth.user.id);
 const deleted=await supabaseRest(auth.cfg,"campaign_subscriptions?customer_id=eq."+id,{method:"DELETE"});
 if(!deleted.response.ok)return jsonError("به‌روزرسانی تنظیمات انجام نشد.",503);
 if(audiences.length){
  const rows=audiences.map(audience=>({customer_id:auth.user.id,audience}));
  const inserted=await supabaseRest(auth.cfg,"campaign_subscriptions",{method:"POST",body:JSON.stringify(rows)});
  if(!inserted.response.ok)return jsonError("ذخیره تنظیمات اعلان‌ها ناموفق بود.",503);
 }
 return Response.json({audiences});
}
export async function PATCH(request){
 const auth=await requireUser(request);if(auth.error)return auth.error;
 const updated=await supabaseRest(auth.cfg,"campaign_notifications?customer_id=eq."+encodeURIComponent(auth.user.id)+"&read_at=is.null",{method:"PATCH",body:JSON.stringify({read_at:new Date().toISOString()})});
 if(!updated.response.ok)return jsonError("ثبت وضعیت اعلان‌ها ناموفق بود.",503);
 return Response.json({ok:true});
}
