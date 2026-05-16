import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email    = credentials.email    as string
        const password = credentials.password as string
        if (email !== process.env.ADMIN_EMAIL) return null
        if (!process.env.ADMIN_PASSWORD_HASH) return null
        const valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
        if (!valid) return null
        return { id: '1', name: 'Amy', email }
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
})
