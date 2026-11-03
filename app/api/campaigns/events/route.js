import { supabaseConfig, supabaseRest } from "../../../../lib/cashback-server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(request){
 let body;try{body=await request.json()}catch{return Response.json({error:"درخواست نامعتبر است."},{status:400})}
 if(!/^[0-9a-f-]{36}$/i.test(body?.campaign_id||"")||!["view","click"].includes(body?.event_type))return Response.json({error:"رویداد معتبر نیست."},{status:400});
 try{
  const cfg=supabaseConfig();
  const {response:check,data}=await supabaseRest(cfg,"campaigns?select=id& id=eq."+encodeURIComponent(body.campaign_id));
  if(!check.ok||!data?.length)return Response.json({ok:true});
  const {response}=await supabaseRest(cfg,"campaign_events",{method:"POST",body:JSON.stringify({campaign_id:body.campaign_id,event_type:body.event_type,session_key:typeof body.session_key==="string"?body.session_key.slice(0,80):null})});
  if(!response.ok)return Response.json({ok:false},{status:503});
  return Response.json({ok:true},{headers:{"Cache-Control":"no-store"}});
 }catch{return Response.json({ok:false},{status:503})}
}