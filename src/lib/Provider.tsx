import { useCallback, useEffect, useReducer, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { AppContext } from './context'
import { initialState, reducer, restoreState } from './model'

const storageKey = 'temu-kopling-demo-v1'

function load() {
  try {
    return restoreState(localStorage.getItem(storageKey))
  } catch {
    return { state: initialState(), recovered: true }
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(load)
  const [state, dispatch] = useReducer(reducer, loaded.state)
  const [message, setMessage] = useState('')
  const [storageWarning, setStorageWarning] = useState(loaded.recovered)
  const toast = useCallback((text: string) => setMessage(text), [])
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      setStorageWarning(true)
    }
  }, [state])
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(''), 4500)
    return () => window.clearTimeout(timer)
  }, [message])
  return (
    <AppContext.Provider value={{ state, dispatch, toast }}>
      {storageWarning && (
        <div className="storage-warning" role="alert">
          Penyimpanan browser tidak tersedia atau data demo perlu dipulihkan. Perubahan mungkin
          hanya tersimpan selama sesi ini.
          <button
            aria-label="Tutup pemberitahuan penyimpanan"
            onClick={() => setStorageWarning(false)}
          >
            <X size={18} />
          </button>
        </div>
      )}
      {children}
      {message && (
        <div className="toast" role="status">
          <CheckCircle2 size={20} />
          <span>{message}</span>
          <button onClick={() => setMessage('')} aria-label="Tutup pemberitahuan">
            <X size={18} />
          </button>
        </div>
      )}
    </AppContext.Provider>
  )
}
