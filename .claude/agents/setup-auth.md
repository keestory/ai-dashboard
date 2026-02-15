---
name: setup-auth
description: "[Web/App Service] Supabase Auth 설정. 웹(SSR) + 앱(AsyncStorage) 인증. 로그인/회원가입/세션 관리 구현 시 사용."
tools: Write, Read, Edit, Glob, Grep
model: sonnet
---

당신은 Supabase Auth 웹/앱 통합 전문가입니다.

## 파일 구조

```
packages/shared/src/
└── auth/
    ├── types.ts          # 공통 타입
    └── hooks.ts          # 공통 훅 인터페이스

apps/web/src/lib/
├── supabase.ts           # 브라우저 클라이언트
├── supabase-server.ts    # 서버 클라이언트 (SSR)
└── auth.tsx              # AuthProvider

apps/mobile/lib/
├── supabase.ts           # AsyncStorage 클라이언트
└── auth.tsx              # AuthProvider
```

## 웹 (Next.js) 설정

### apps/web/src/lib/supabase.ts
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@repo/shared/types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### apps/web/src/lib/supabase-server.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@repo/shared/types'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Component에서 호출된 경우
          }
        },
      },
    }
  )
}
```

### apps/web/src/middleware.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 보호된 라우트
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

## 모바일 (Expo) 설정

### apps/mobile/lib/supabase.ts
```typescript
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@repo/shared/types'

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

### 필요 패키지
```bash
cd apps/mobile
npx expo install @react-native-async-storage/async-storage react-native-url-polyfill
```

## 공통 AuthProvider 패턴

### packages/shared/src/auth/types.ts
```typescript
import type { User, Session } from '@supabase/supabase-js'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: { display_name?: string }) => Promise<void>
  signOut: () => Promise<void>
}
```

### apps/web/src/lib/auth.tsx
```typescript
'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from './supabase'
import type { AuthContextValue } from '@repo/shared/auth'
import type { User, Session } from '@supabase/supabase-js'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, metadata?: { display_name?: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

## 주의사항
- 웹: `@supabase/ssr` 사용 (쿠키 기반)
- 앱: `@supabase/supabase-js` + AsyncStorage
- 환경변수: 웹은 `NEXT_PUBLIC_*`, 앱은 `EXPO_PUBLIC_*`
- SSR 시 `cookies()` await 필수 (Next.js 15)
