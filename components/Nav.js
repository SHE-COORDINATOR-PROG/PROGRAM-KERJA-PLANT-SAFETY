"use client";import Link from "next/link";import {usePathname} from "next/navigation";
const I=[["/","Dashboard","Ringkasan & grafik"],["/riwayat","Riwayat JSA","Daftar & detail"],0,["/unggah","+ Input JSA","Isi data & simpan foto/PDF"]];
export default function Nav(){const p=usePathname();return <nav className="nav">{I.map((i,k)=>i?<Link key={k} href={i[0]} className={p===i[0]?"on":""}>{i[1]}<small>{i[2]}</small></Link>:<hr key={k}/>)}</nav>}
