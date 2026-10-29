import {db,tgl} from "@/lib/db";import {jsa,jsaFile} from "@/lib/schema";import {and,gte,lte,eq,or,ilike,desc} from "drizzle-orm";import {revalidatePath} from "next/cache";import Filter from "@/components/Filter";
export const dynamic="force-dynamic";
async function del(fd){"use server";await db.delete(jsa).where(eq(jsa.id,+fd.get("id")));revalidatePath("/riwayat");revalidatePath("/")}
export default async function P({searchParams:s}){
const w=[];if(s.bulan){const[y,m]=s.bulan.split("-");w.push(gte(jsa.tanggal,s.bulan+"-01"),lte(jsa.tanggal,`${s.bulan}-${new Date(y,m,0).getDate()}`))}
if(s.klas)w.push(eq(jsa.klasifikasi,s.klas));
if(s.q){const q=`%${s.q}%`;w.push(or(ilike(jsa.tugas,q),ilike(jsa.pembuat,q),ilike(jsa.pengawas,q),ilike(jsa.atasan,q)))}
const rows=await db.select().from(jsa).where(and(...w)).orderBy(desc(jsa.tanggal),desc(jsa.id));
const fl=new Set((await db.select({i:jsaFile.jsaId}).from(jsaFile)).map(x=>x.i));
return <><h1>Riwayat JSA</h1><p className="sub">Daftar JSA tersimpan</p>
<Filter><div><label>Bulan</label><input type="month" name="bulan" defaultValue={s.bulan}/></div>
<div><label>Klasifikasi</label><select name="klas" defaultValue={s.klas||""}><option value="">Semua</option><option>Rutin</option><option>Tidak Rutin</option></select></div>
<div><label>Cari (tekan Enter)</label><input type="search" name="q" defaultValue={s.q} placeholder="Tugas, pembuat, pengawas…"/></div></Filter>
<div className="card tw"><table><thead><tr><th>Tanggal aktivitas</th><th>Nama tugas</th><th>Pembuat</th><th>Pengawas</th><th>Atasan</th><th>Klasifikasi</th><th></th></tr></thead><tbody>
{rows.map(r=><tr key={r.id}><td>{tgl(r.tanggal)}</td><td><b>{r.tugas}</b><br/><span className="sm">{r.alat}</span></td><td>{r.pembuat}</td><td>{r.pengawas}</td><td>{r.atasan}{r.atasan&&<><br/><span className="sm">Atasan</span></>}</td>
<td><span className={"tag"+(r.klasifikasi==="Tidak Rutin"?" t":"")}>{r.klasifikasi}</span></td>
<td style={{whiteSpace:"nowrap"}}>{fl.has(r.id)&&<a className="btn" href={`/api/jsa/${r.id}/file`} target="_blank" style={{textDecoration:"none",marginRight:6}}>Lihat</a>}<form action={del} style={{display:"inline"}}><input type="hidden" name="id" value={r.id}/><button>Hapus</button></form></td></tr>)}</tbody></table>
{!rows.length&&<p className="sm">Belum ada data. Mulai dari menu Input JSA.</p>}</div></>}
