import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Verificar si el usuario ya está en una ruta específica
  if (url.pathname.startsWith('/mobile') || url.pathname.startsWith('/desktop')) {
    return NextResponse.next();
  }

  const userAgent = req.headers.get('user-agent') || '';
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);

  // Redirigir según el dispositivo detectado
  if (isMobile) {
    url.pathname = '/mobile';
  } else {
    url.pathname = '/desktop';
  }

  return NextResponse.redirect(url);
}
