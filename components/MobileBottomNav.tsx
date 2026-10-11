"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {House,Compass,FolderKanban,Bell,Wallet,Menu} from "lucide-react";
const items=[{href:"/dashboard",label:"Home",icon:House},{href:"/creative-commissions",label:"Explore",icon:Compass},{href:"/active-projects",label:"Work",icon:FolderKanban},{href:"/notifications",label:"Inbox",icon:Bell},{href:"/earnings",label:"Earnings",icon:Wallet}];
export function MobileBottomNav({onMore}:{onMore:()=>void}){
 const path=usePathname();return <nav className="plekxa-mobile-bottom-nav" aria-label="Mobile primary navigation">{items.map(({href,label,icon:Icon})=><Link key={href} href={href} aria-current={path===href||path.startsWith(href+"/")?"page":undefined}><Icon size={21}/><span>{label}</span></Link>)}<button type="button" onClick={onMore} aria-label="Open full menu"><Menu size={21}/><span>More</span></button></nav>;
}
