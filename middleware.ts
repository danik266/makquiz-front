import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Получаем роль из cookie
  const userRole = request.cookies.get('user_role')?.value;

  // Если пользователь заходит на /dashboard
  if (pathname === '/dashboard') {
    if (userRole === 'teacher') {
      // Teachers должны использовать teacher-dashboard
      return NextResponse.redirect(new URL('/teacher-dashboard', request.url));
    }
    // Студенты остаются на обычном дашборде
  }

  // Если пользователь заходит на /teacher-dashboard
  if (pathname === '/teacher-dashboard') {
    if (userRole !== 'teacher') {
      // Только teachers могут заходить на teacher-dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/teacher-dashboard'],
};