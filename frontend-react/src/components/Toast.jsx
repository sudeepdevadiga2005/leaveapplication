import { useEffect, useState } from 'react'

function ToastItem({ toast }) {
  const [show, setShow] = useState(false)
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }
  useEffect(() => { requestAnimationFrame(() => setShow(true)) }, [])
  return (
    <div className={`toast t-${toast.type} ${show ? 'show' : ''}`}>
      <span className="toast-icon">{icons[toast.type]}</span>
      <div>
        <div className="toast-title">{toast.title}</div>
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
