import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { Action, AppState } from './model'

export const AppContext = createContext<{
  state: AppState
  dispatch: Dispatch<Action>
  toast: (message: string) => void
} | null>(null)

export function useApp() {
  const value = useContext(AppContext)
  if (!value) throw new Error('AppProvider is required')
  return value
}
