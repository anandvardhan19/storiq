import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { store: true },
        })

        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          storeId: user.storeId,
          storeName: user.store?.name ?? null,
          storeSlug: user.store?.slug ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth: auto-create user if first sign-in
      if (account?.provider === 'google' && user.email) {
        const existing = await db.user.findUnique({
          where: { email: user.email.toLowerCase() },
          include: { store: true },
        })

        if (!existing) {
          // Create a new store + owner for first-time Google sign-in
          const slugBase = user.name
            ? user.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
            : 'store'
          const storeSlug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`

          const created = await db.$transaction(async (tx) => {
            const store = await tx.store.create({
              data: { name: `${user.name}'s Store`, slug: storeSlug, settings: { create: {} } },
            })
            return tx.user.create({
              data: {
                name: user.name ?? user.email!,
                email: user.email!.toLowerCase(),
                passwordHash: '',
                avatar: user.image ?? undefined,
                role: 'OWNER',
                storeId: store.id,
              },
              include: { store: true },
            })
          })

          // Attach store info to user object for jwt callback
          ;(user as any).id = created.id
          ;(user as any).role = created.role
          ;(user as any).storeId = created.storeId
          ;(user as any).storeName = created.store?.name ?? null
          ;(user as any).storeSlug = created.store?.slug ?? null
        } else {
          ;(user as any).id = existing.id
          ;(user as any).role = existing.role
          ;(user as any).storeId = existing.storeId
          ;(user as any).storeName = existing.store?.name ?? null
          ;(user as any).storeSlug = existing.store?.slug ?? null
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id ?? user.id
        token.role = (user as any).role
        token.storeId = (user as any).storeId
        token.storeName = (user as any).storeName
        token.storeSlug = (user as any).storeSlug
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.storeId = token.storeId as string | null
        session.user.storeName = token.storeName as string | null
        session.user.storeSlug = token.storeSlug as string | null
      }
      return session
    },
  },
}
