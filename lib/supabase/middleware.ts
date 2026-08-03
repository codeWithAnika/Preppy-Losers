import { createServerClient } from "@supabase/ssr";

import { NextResponse, type NextRequest } from "next/server";

import {

  isProfileComplete,

  isProfileCompletionExemptPath,

  PROFILE_COMPLETION_PATH,

} from "@/lib/auth/profile-completion";

import { isAdminPath } from "@/lib/auth/admin-allowlist";



const PROTECTED_PREFIXES = ["/account", "/admin", "/checkout"];



function isProtectedPath(pathname: string): boolean {

  return PROTECTED_PREFIXES.some(

    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)

  );

}



function copyCookies(from: NextResponse, to: NextResponse) {

  from.cookies.getAll().forEach((cookie) => {

    to.cookies.set(cookie);

  });

}



export async function updateSession(request: NextRequest) {

  const pathname = request.nextUrl.pathname;

  let supabaseResponse = NextResponse.next({ request });



  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;



  if (!url || !key) {

    return supabaseResponse;

  }



  const supabase = createServerClient(url, key, {

    cookies: {

      getAll() {

        return request.cookies.getAll();

      },

      setAll(cookiesToSet) {

        cookiesToSet.forEach(({ name, value }) => {

          request.cookies.set(name, value);

        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {

          supabaseResponse.cookies.set(name, value, options);

        });

      },

    },

  });



  const {

    data: { user },

  } = await supabase.auth.getUser();



  if (isProtectedPath(pathname) && !user) {

    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = "/login";

    redirectUrl.searchParams.set("next", pathname);



    const redirectResponse = NextResponse.redirect(redirectUrl);

    copyCookies(supabaseResponse, redirectResponse);

    return redirectResponse;

  }



  if (

    user &&

    !isProfileCompletionExemptPath(pathname) &&

    !isAdminPath(pathname)

  ) {

    const { data: profile } = await supabase

      .from("profiles")

      .select("full_name")

      .eq("id", user.id)

      .maybeSingle();



    if (!isProfileComplete(profile)) {

      const redirectUrl = request.nextUrl.clone();

      redirectUrl.pathname = PROFILE_COMPLETION_PATH;

      const returnPath = `${pathname}${request.nextUrl.search}`;

      redirectUrl.searchParams.set("next", returnPath);



      const redirectResponse = NextResponse.redirect(redirectUrl);

      copyCookies(supabaseResponse, redirectResponse);

      return redirectResponse;

    }

  }



  return supabaseResponse;

}

