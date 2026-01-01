declare module 'recharts' {
  import * as React from 'react'
  
  export interface ResponsiveContainerProps {
    width?: string | number
    height?: string | number
    aspect?: number
    minHeight?: string | number
    minWidth?: string | number
    children?: React.ReactNode
  }
  
  export const ResponsiveContainer: React.ComponentType<ResponsiveContainerProps>
  
  export interface BarChartProps {
    data?: any[]
    children?: React.ReactNode
    width?: number
    height?: number
    margin?: any
  }
  
  export const BarChart: React.ComponentType<BarChartProps>
  export const Bar: React.ComponentType<any>
  export const XAxis: React.ComponentType<any>
  export const YAxis: React.ComponentType<any>
  export const CartesianGrid: React.ComponentType<any>
  export const Tooltip: React.ComponentType<any>
  export const Legend: React.ComponentType<any>
  export const LineChart: React.ComponentType<any>
  export const Line: React.ComponentType<any>
  export const PieChart: React.ComponentType<any>
  export const Pie: React.ComponentType<any>
  export const Cell: React.ComponentType<any>
}


