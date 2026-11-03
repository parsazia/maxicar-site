"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
const labels={story:"استوری",flash_sale:"فروش برق‌آسا",limited_deal:"فرصت محدود",member_offer:"پیشنهاد اعضا",bundle:"بسته پیشنهادی"};
export default function CampaignStories(){
 const [items,setItems]=useState([]);
 useEffect(()=>{let active=true;fetch("/api/campaigns",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(active)setItems(d.campaigns||[])}).catch(()=>{});return()=>{active=false}},[]);
 if(!items.length)return null;
 const track=(id,type)=>fetch("/api/campaigns/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({campaign_id:id,event_type:type})}).catch(()=>{});
 return <section dir="rtl" className="container" style={{padding:"18px 0 8px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div><small style={{color:"#64748b"}}>پیشنهادهای زمان‌دار</small><h2 style={{margin:"3px 0",fontSize:20}}>ویترین داغ ماکسیکار</h2></div><Link href="/special-offers" style={{color:"#174b78",fontWeight:700,textDecoration:"none",fontSize:13}}>همه پیشنهادها ←</Link></div><div style={{display:"flex",gap:13,overflowX:"auto",padding:"5px 2px 13px"}}>{items.map(c=><Link key={c.id} href={"/special-offers#campaign-"+c.id} onClick={()=>track(c.id,"click")} style={{flex:"0 0 94px",textAlign:"center",textDecoration:"none",color:"#172033"}}><span style={{display:"block",width:76,height:76,padding:3,margin:"0 auto 7px",borderRadius:"50%",background:"linear-gradient(135deg,#e4b75e,#173d70)"}}><span style={{display:"grid",placeItems:"center",width:"100%",height:"100%",borderRadius:"50%",background:"#fff",overflow:"hidden"}}>{c.media_type==="video"?<span style={{fontSize:24}}>▶</span>:c.media_url?<img src={c.media_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:25,color:"#173d70"}}>%</span>}</span></span><b style={{fontSize:12,display:"block",lineHeight:1.6}}>{c.title}</b><small style={{fontSize:10,color:"#64748b"}}>{labels[c.campaign_type]||"پیشنهاد ویژه"}</small></Link>)}</div></section>
}
