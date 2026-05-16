'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email:    form.get('email'),
      password: form.get('password'),
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password.')
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">
      <div className="w-full max-w-sm rounded-2xl border border-[#E8E2DA] bg-white p-8 shadow-sm">
        <h1 className="mb-1 font-serif text-2xl text-[#2D2D2D]">BeautyByAmy</h1>
        <p className="mb-8 text-sm text-[#6B6B6B]">Admin sign in</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="rounded-lg border border-[#E8E2DA] bg-[#FAF8F5] px-4 py-3 text-sm text-[#2D2D2D] placeholder:text-[#6B6B6B] outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="rounded-lg border border-[#E8E2DA] bg-[#FAF8F5] px-4 py-3 text-sm text-[#2D2D2D] placeholder:text-[#6B6B6B] outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-[#C9A96E] py-3 text-sm font-semibold text-white transition hover:bg-[#A68B4E] disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
