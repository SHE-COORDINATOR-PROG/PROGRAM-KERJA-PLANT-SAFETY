import {db} from "@/lib/db";import {jsaFile} from "@/lib/schema";import {eq} from "drizzle-orm";
export async function GET(_,{params}){const[f]=await db.select().from(jsaFile).where(eq(jsaFile.jsaId,+params.id));
if(!f)return new Response("Tidak ada file",{status:404});
return new Response(Buffer.from(f.data,"base64"),{headers:{"Content-Type":f.mime,"Content-Disposition":`inline; filename="${encodeURIComponent(f.nama||"jsa")}"`}})}
