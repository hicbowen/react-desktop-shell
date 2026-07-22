import type { CSSProperties, ReactNode } from 'react'
export type AppTaskState='queued'|'running'|'paused'|'success'|'error'|'canceled'
export interface AppTask { id:string; title:ReactNode; description?:ReactNode; state:AppTaskState; progress?:number; cancellable?:boolean; retryable?:boolean; dismissible?:boolean }
export interface AppTaskCenterProps { tasks:readonly AppTask[]; onCancel?:(id:string)=>void; onRetry?:(id:string)=>void; onDismiss?:(id:string)=>void; ariaLabel?:string; emptyContent?:ReactNode; className?:string; style?:CSSProperties }
export interface AppTaskIndicatorProps { tasks:readonly AppTask[]; className?:string }
