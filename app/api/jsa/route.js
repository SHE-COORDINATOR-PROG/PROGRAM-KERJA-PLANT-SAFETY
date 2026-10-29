import {db} from "@/lib/db";import {jsa,jsaFile} from "@/lib/schema";
export async function POST(req){const b=await req.json(),n=k=>(b[k]||"").toString().trim()||null;
if(!n("tugas")||!["Rutin","Tidak Rutin"].includes(b.klasifikasi))return Response.json({error:"Data tidak lengkap"},{status:400});
const[row]=await db.insert(jsa).values({tugas:n("tugas"),pembuat:n("pembuat"),pengawas:n("pengawas"),atasan:n("atasan"),klasifikasi:b.klasifikasi,tanggal:/^\d{4}-\d{2}-\d{2}$/.test(b.tanggal)?b.tanggal:null,alat:n("alat"),lokasi:n("lokasi"),dept:n("dept"),langkah:parseInt(b.langkah)||null,crew:n("crew")}).returning({id:jsa.id});
if(b.file?.data)await db.insert(jsaFile).values({jsaId:row.id,mime:b.file.mime,nama:b.file.nama,data:b.file.data});
return Response.json({ok:true})}
