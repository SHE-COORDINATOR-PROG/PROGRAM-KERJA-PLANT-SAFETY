import "./globals.css";import {IBM_Plex_Sans,Source_Serif_4} from "next/font/google";import Nav from "@/components/Nav";
const sans=IBM_Plex_Sans({subsets:["latin"],weight:["400","500"],variable:"--sans"});
const serif=Source_Serif_4({subsets:["latin"],weight:["600","700"],variable:"--serif"});
export const metadata={title:"Rekam JSA"};
export default function L({children}){return <html lang="id"><body className={sans.variable+" "+serif.variable}><aside><div className="brand">Rekam JSA</div><Nav/></aside><main>{children}</main></body></html>}
