"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {House,Compass,FolderKanban,Wallet,UserRound} from "lucide-react";
const items=[
 {href:"/dashboard",label:"Home",icon:House},
 {href:"/projects",label:"Explore",icon:Compass},
 {href:"/active-projects",label:"Work",icon:FolderKanban},
 {href:"/earnings",label:"Earnings",icon:Wallet},
 {href:"/profile",label:"Profile",icon:UserRound},
];
export function MobileBottomNav({onMore:_onMore}:{onMore:()=>void}){
 const path=usePathname();
 return <nav className="plekxa-mobile-bottom-nav" aria-label="Mobile primary navigation">{items.map(({href,label,icon:Icon})=><Link key={href} href={href} aria-current={path===href||path.startsWith(href+"/")?"page":undefined}><Icon size={21}/><span>{label}</span></Link>)}</nav>;
}
