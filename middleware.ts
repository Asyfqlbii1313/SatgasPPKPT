import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  const pathname = request.nextUrl.pathname
  const isLaporRoute = pathname.startsWith('/lapor')
  const isAdminRoute = pathname.startsWith('/admin')
  
  // Jika user mencoba mengakses /lapor tapi belum login
  if (isLaporRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', '/lapor') // Simpan tujuan asal
    return NextResponse.redirect(url)
  }

  // Handle Role-Based Access Control
  if (user) {
    // Ambil profile user untuk mengecek role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // Jika role adalah admin, batasi akses hanya ke /admin, /, dan /profile
    if (role === 'admin') {
      // Jika mencoba mengakses rute selain /admin, /, dan /profile
      if (!isAdminRoute && pathname !== '/' && !pathname.startsWith('/profile')) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
    } else {
      // Jika BUKAN admin, tapi mencoba mengakses rute /admin, kembalikan ke beranda
      if (isAdminRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }
  }
  
  return supabaseResponse
}

// Specify the paths that should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
