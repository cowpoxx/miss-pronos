import type { NextAuthConfig } from 'next-auth'

const isPublicPage = (pathname: string) =>
  pathname === '/' ||
  pathname === '/editions' ||
  pathname.startsWith('/editions/') ||
  pathname.startsWith('/connexion') ||
  pathname.startsWith('/inscription') ||
  pathname.startsWith('/rejoindre/') ||
  (pathname.startsWith('/groupe/') &&
    !pathname.includes('/admin') &&
    !pathname.includes('/pronostics') &&
    !pathname.includes('/classement'))

export const authConfig = {
  providers: [],
  trustHost: true,
  pages: {
    signIn: '/connexion',
    verifyRequest: '/connexion?verify=true',
    error: '/connexion?error=true',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    authorized({ auth, request }) {
      return isPublicPage(request.nextUrl.pathname) || !!auth
    },
  },
} satisfies NextAuthConfig
