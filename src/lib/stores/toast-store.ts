import { create } from 'zustand'

export type ToastJenis = 'success' | 'error' | 'info' | 'warning'

export type ToastItem = {
  id: string
  jenis: ToastJenis
  mesej: string
}

type ToastStore = {
  toasts: ToastItem[]
  tambah: (jenis: ToastJenis, mesej: string) => void
  buang: (id: string) => void
}

const TEMPOH_MS = 4000

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  tambah: (jenis, mesej) => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { id, jenis, mesej }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, TEMPOH_MS)
  },
  buang: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (mesej: string) => useToastStore.getState().tambah('success', mesej),
  error: (mesej: string) => useToastStore.getState().tambah('error', mesej),
  info: (mesej: string) => useToastStore.getState().tambah('info', mesej),
  warning: (mesej: string) => useToastStore.getState().tambah('warning', mesej),
}
