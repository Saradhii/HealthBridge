'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { forwardRef } from 'react'

/**
 * Router Compatibility Layer
 * Makes Next.js router API compatible with TanStack Router
 * This allows copying components from shadcn-admin template with minimal changes
 */

// Link component compatible with TanStack Router API
type LinkProps = {
  to: string
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, children, ...props }, ref) => {
    return (
      <NextLink href={to} ref={ref} {...props}>
        {children}
      </NextLink>
    )
  }
)

Link.displayName = 'Link'

// useLocation hook compatible with TanStack Router API
export function useLocation<T = { href: string }>({
  select,
}: {
  select?: (location: { href: string; pathname: string }) => T
} = {}) {
  const pathname = usePathname()

  const location = {
    href: pathname,
    pathname: pathname,
  }

  if (select) {
    return select(location)
  }

  return location as unknown as T
}

// Outlet component for layout compatibility
// In Next.js, we just render children instead of <Outlet />
type OutletProps = {
  children?: React.ReactNode
}

export function Outlet({ children }: OutletProps) {
  return <>{children}</>
}
