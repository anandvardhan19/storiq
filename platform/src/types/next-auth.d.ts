import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    storeId: string | null
    storeName: string | null
    storeSlug: string | null
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      storeId: string | null
      storeName: string | null
      storeSlug: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    storeId: string | null
    storeName: string | null
    storeSlug: string | null
  }
}
