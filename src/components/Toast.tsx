// src/components/Toast.tsx – Toast notification system
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { ToastMessage } from '../types'

const CONFIG: Record<ToastMessage['type'], {
  icon: typeof CheckCircle
  bg: string
  border: string
  text: string
  iconColor: string
}> = {
  success: { icon: CheckCircle,    bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-800',  iconColor: 'text-green-500'  },
  error:   { icon: AlertCircle,    bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-800',    iconColor: 'text-red-500'    },
  info:    { icon: Info,           bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-800',   iconColor: 'text-blue-500'   },
  warning: { icon: AlertTriangle,  bg: 'bg-yellow-50', border: 'border-yellow-200',text: 'text-yellow-800', iconColor: 'text-yellow-500' },
}

function Toast({ toast }: { toast: ToastMessage }) {
  const { dismissToast } = useApp()
  const { icon: Icon, bg, border, text, iconColor } = CONFIG[toast.type]

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-slide-up
                  ${bg} ${border} ${text}`}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const { toasts } = useApp()

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-full max-w-sm"
      aria-label="Notifications"
    >
      {toasts.map(t => <Toast key={t.id} toast={t} />)}
    </div>
  )
}
