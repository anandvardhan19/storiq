import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Owner-only routes
    const ownerOnlyPaths = ['/settings', '/staff']
    if (ownerOnlyPaths.some((p) => path.startsWith(p))) {
      if (token?.role !== 'OWNER' && token?.role !== 'MANAGER') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/inventory/:path*',
    '/orders/:path*',
    '/customers/:path*',
    '/analytics/:path*',
    '/staff/:path*',
    '/settings/:path*',
  ],
}
