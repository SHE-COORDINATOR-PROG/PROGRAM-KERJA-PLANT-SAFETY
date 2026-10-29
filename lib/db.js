import {neon} from "@neondatabase/serverless";import {drizzle} from "drizzle-orm/neon-http";
export const db=drizzle(neon(process.env.DATABASE_URL));
export const BLN=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
export const tgl=d=>{if(!d)return"-";const[y,m,x]=d.split("-");return `${+x} ${BLN[m-1]} ${y}`};
