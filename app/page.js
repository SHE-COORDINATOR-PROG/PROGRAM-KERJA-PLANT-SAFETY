import {db,BLN,tgl} from "@/lib/db";import {jsa} from "@/lib/schema";import {and,gte,lte,eq,desc} from "drizzle-orm";
import {Trend,Dist} from "@/components/Charts";import Filter from "@/components/Filter";
export const dynamic="force-dynamic";
export default async function P({searchParams:s}){
const w=[s.dari&&gte(jsa.tanggal,s.dari),s.sampai&&lte(jsa.tanggal,s.sampai),s.klas&&eq(jsa.klasifikasi,s.klas)].filter(Boolean);
const rows=await db.select().from(jsa).where(and(...w)).orderBy(desc(jsa.tanggal));
const all=(await db.select({id:jsa.id}).from(jsa)).length,ym=new Date().toISOString().slice(0,7);
const cnt=k=>rows.filter(r=>r.klasifikasi===k).length,by={},top={};
rows.forEach(r=>{const b=(r.tanggal||"").slice(0,7);if(b)by[b]=(by[b]||0)+1;const k=r.tugas.toLowerCase();top[k]=top[k]||{t:r.tugas,n:0};top[k].n++});
const trend=Object.keys(by).sort().map(b=>({l:BLN[+b.slice(5)-1]+" "+b.slice(2,4),n:by[b]}));
const dist=[{k:"Rutin",n:cnt("Rutin"),c:"#b8860b"},{k:"Tidak Rutin",n:cnt("Tidak Rutin"),c:"#7b2d2d"}];
return <><h1>Dashboard</h1><p className="sub">Ringkasan JSA dan klasifikasi pekerjaan</p>
<Filter><div><label>Dari tanggal</label><input type="date" name="dari" defaultValue={s.dari}/></div><div><label>Sampai tanggal</label><input type="date" name="sampai" defaultValue={s.sampai}/></div>
<div><label>Klasifikasi</label><select name="klas" defaultValue={s.klas||""}><option value="">Semua</option><option>Rutin</option><option>Tidak Rutin</option></select></div></Filter>
<div className="g4" style={{marginBottom:24}}>
<div className="card" style={{margin:0}}><div className="lbl">Total JSA</div><div className="big">{rows.length}</div><div className="sm">dari {all} total tersimpan</div></div>
<div className="card" style={{margin:0}}><div className="lbl">Bulan ini</div><div className="big">{rows.filter(r=>r.tanggal?.startsWith(ym)).length}</div><div className="sm">aktivitas bulan berjalan</div></div>
<div className="card" style={{margin:0}}><div className="lbl">Rutin</div><div className="big">{cnt("Rutin")}</div><div className="sm">pekerjaan rutin</div></div>
<div className="card" style={{margin:0}}><div className="lbl">Tidak rutin</div><div className="big r">{cnt("Tidak Rutin")}</div><div className="sm">perlu perhatian lebih</div></div></div>
<div className="g2"><div className="card"><h2>Tren JSA per bulan</h2><Trend data={trend}/></div><div className="card"><h2>Distribusi klasifikasi</h2><Dist data={dist}/></div></div>
<div className="g2"><div className="card"><h2>Tugas paling sering</h2>{Object.values(top).sort((a,b)=>b.n-a.n).slice(0,5).map(x=><p key={x.t}>{x.t} <span className="tag">{x.n}x</span></p>)}</div>
<div className="card"><h2>JSA terbaru</h2>{rows.slice(0,5).map(r=><p key={r.id}><b>{r.tugas}</b><br/><span className="sm">{tgl(r.tanggal)} · {r.pembuat||"-"}</span></p>)}</div></div></>}
