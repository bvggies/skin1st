declare module 'react-router-dom' {
  import * as React from 'react'
  
  export interface RoutesProps {
    children?: React.ReactNode
    location?: any
  }
  
  export interface RouteProps {
    path?: string
    element?: React.ReactElement | null
    children?: React.ReactNode
  }
  
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    to: string
    replace?: boolean
    state?: any
    reloadDocument?: boolean
  }
  
  export const Routes: React.ComponentType<RoutesProps>
  export const Route: React.ComponentType<RouteProps>
  export const BrowserRouter: React.ComponentType<{ children?: React.ReactNode }>
  export const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>
  export const useNavigate: () => (to: string | number, options?: any) => void
  export const useParams: <T extends Record<string, string>>() => T
  export const useSearchParams: () => [URLSearchParams, (params: URLSearchParams) => void]
  export const useLocation: () => { pathname: string; search: string; hash: string; state: any }
}

