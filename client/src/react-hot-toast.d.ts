declare module 'react-hot-toast' {
  import * as React from 'react'
  
  export interface ToasterProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
    reverseOrder?: boolean
    gutter?: number
    containerClassName?: string
    containerStyle?: React.CSSProperties
    toastOptions?: any
  }
  
  export const Toaster: React.ComponentType<ToasterProps>
  
  interface ToastFunction {
    (message: string, options?: any): string
    success: (message: string, options?: any) => string
    error: (message: string, options?: any) => string
    loading: (message: string, options?: any) => string
    promise: <T,>(promise: Promise<T>, msgs: { loading: string; success: string; error: string }) => Promise<T>
    dismiss: (toastId?: string) => void
  }
  
  const toast: ToastFunction
  export default toast
}

