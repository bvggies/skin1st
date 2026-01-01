declare module 'framer-motion' {
  import * as React from 'react'
  
  export interface MotionProps extends React.HTMLAttributes<HTMLElement> {
    initial?: any
    animate?: any
    exit?: any
    transition?: any
    whileHover?: any
    whileTap?: any
    variants?: any
    layout?: boolean | string
  }
  
  export interface HTMLMotionProps<T extends keyof React.JSX.IntrinsicElements> extends MotionProps {
    as?: T
  }
  
  export const motion: {
    div: React.ComponentType<HTMLMotionProps<'div'>>
    span: React.ComponentType<HTMLMotionProps<'span'>>
    button: React.ComponentType<HTMLMotionProps<'button'>>
    [key: string]: React.ComponentType<any>
  }
  
  export const AnimatePresence: React.ComponentType<{ children?: React.ReactNode; exitBeforeEnter?: boolean }>
}

