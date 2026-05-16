import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Toaster } from '@/components/ui/sonner'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="linen-bg flex min-h-screen text-[#2D2D2D]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
        <Toaster />
      </main>
    </div>
  )
}
