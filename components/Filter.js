"use client";
export default function F({children}){return <form className="card filters" onChange={e=>{if(e.target.type!=="search")e.currentTarget.requestSubmit()}}>{children}</form>}
