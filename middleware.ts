import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exclude specific paths from middleware
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Regular expression to match '/desktop' or '/desktop/*' and same for '/mobile'
  const desktopPattern = /^\/desktop(\/.*)?$/;
  const mobilePattern = /^\/mobile(\/.*)?$/;

  // If already on /desktop or /mobile paths, don't redirect
  if (desktopPattern.test(pathname) || mobilePattern.test(pathname)) {
    return NextResponse.next();
  }

  // User Agent detection
  const userAgent = req.headers.get('user-agent') || '';
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);

  // Redirect accordingly
  if (isMobile) {
    return NextResponse.redirect(new URL('/mobile', req.url));
  } else {
    return NextResponse.redirect(new URL('/desktop', req.url));
  }
}

// Middleware configuration to apply middleware only to certain paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
