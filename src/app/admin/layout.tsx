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
    <div className="linen-bg flex h-screen overflow-hidden text-[#2D2D2D]">
      <AdminSidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Spacer so mobile fixed top bar doesn't overlap content */}
        <div className="h-14 shrink-0 md:hidden" />
        <div className="flex-1 overflow-y-auto">
          {children}
          <Toaster />
        </div>
      </main>
    </div>
  )
}
