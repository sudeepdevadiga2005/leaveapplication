import { useEffect, useState } from 'react'

const LABELS = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' }
const COLORS  = {
  success: { bg:'#d1fae5', border:'#10b981', text:'#065f46' },
  error:   { bg:'#fee2e2', border:'#ef4444', text:'#991b1b' },
  warning: { bg:'#fef3c7', border:'#f59e0b', text:'#92400e' },
  info:    { bg:'#dbeafe', border:'#3b82f6', text:'#1e40af' },
}

function ToastItem({ toast }) {
  const [show, setShow] = useState(false)
  const c = COLORS[toast.type] || COLORS.info
  useEffect(() => { requestAnimationFrame(() => setShow(true)) }, [])

  return (
    <div className={`toast t-${toast.type} ${show ? 'show' : ''}`}
      style={{ background: c.bg, borderColor: c.border }}>
      <div>
        <div className="toast-title" style={{ color: c.text }}>{LABELS[toast.type]}</div>
        <div className="toast-msg">{toast.msg}</div>
      </div>
    </div>
  )
}

export default function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  )
}


