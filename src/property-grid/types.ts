import type { CSSProperties, ReactNode } from 'react'
export interface AppPropertyGridItem { key:string; label:ReactNode; editor:ReactNode; description?:ReactNode; readOnly?:boolean; modified?:boolean; onReset?:()=>void }
export interface AppPropertyGridGroup { key:string; label:ReactNode; items:readonly AppPropertyGridItem[]; defaultCollapsed?:boolean }
export interface AppPropertyGridProps { groups:readonly AppPropertyGridGroup[]; ariaLabel?:string; nameColumnWidth?:number; minNameColumnWidth?:number; maxNameColumnWidth?:number; onNameColumnWidthChange?:(width:number)=>void; resetLabel?:string; className?:string; style?:CSSProperties }
