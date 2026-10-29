"use client";import {useState} from "react";import {useRouter} from "next/navigation";
const F=[["tugas","Nama tugas kerja"],["pembuat","Pembuat (JSEAO disusun oleh)"],["pengawas","Pengawas (Di Briefing oleh)"],["atasan","Atasan / Section Head"],["tanggal","Tanggal aktivitas","date"],["alat","No. alat"],["lokasi","Lokasi kerja"],["dept","Departemen"],["langkah","Jumlah langkah","number"],["crew","Crew terlibat"]];
const b64=f=>new Promise(ok=>{const R=new FileReader();R.onload=()=>ok(R.result.split(",")[1]);R.readAsDataURL(f)});
async function shrink(f){const im=await createImageBitmap(f),k=Math.min(1,1800/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);return c.toDataURL("image/jpeg",.85).split(",")[1]}
export default function U(){const r=useRouter(),[v,setV]=useState({klasifikasi:""}),[m,setM]=useState(""),[f,setF]=useState(null),[u,setU]=useState("");
function pick(e){const x=e.target.files[0];if(x&&x.type==="application/pdf"&&x.size>3e6){e.target.value="";return setM("PDF maksimal 3 MB.")}setM("");setF(x||null);setU(x?URL.createObjectURL(x):"")}
async function save(e){e.preventDefault();setM("Menyimpan…");let file=null;
if(f){const pdf=f.type==="application/pdf";file={mime:pdf?f.type:"image/jpeg",nama:f.name,data:pdf?await b64(f):await shrink(f)}}
const x=await fetch("/api/jsa",{method:"POST",body:JSON.stringify({...v,file})});x.ok?r.push("/riwayat"):setM("Gagal menyimpan.")}
return <><h1>Input JSA</h1><p className="sub">Pilih foto/PDF sebagai acuan, lalu isi datanya</p>
<div className="g2"><div className="card"><input type="file" accept="image/*,application/pdf" onChange={pick}/>
{f&&(f.type==="application/pdf"?<iframe src={u} style={{width:"100%",height:480,border:0,marginTop:12}}/>:<img src={u} style={{width:"100%",marginTop:12}}/>)}</div>
<form className="card" onSubmit={save}><div className="fm">{F.map(([k,l,t])=><div key={k}><label className="sm">{l}</label><br/><input type={t||"text"} value={v[k]??""} onChange={e=>setV({...v,[k]:e.target.value})}/></div>)}
<div><label className="sm">Klasifikasi pekerjaan</label><br/><select required value={v.klasifikasi} onChange={e=>setV({...v,klasifikasi:e.target.value})}><option value="">Pilih…</option><option>Rutin</option><option>Tidak Rutin</option></select></div></div>
<p className="sm">{m}</p><p><button className="p">Simpan ke riwayat</button></p></form></div></>}
