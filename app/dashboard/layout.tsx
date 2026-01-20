import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Calendar, Users, Briefcase, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { logoutUser } from "@/actions/auth"
import { MobileSidebar } from "@/components/layout/MobileSidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6 lg:p-8 border-b border-gray-200">
          <Link href="/dashboard" className="block mb-4">
            <Image
              src="/dentalize-logo.png"
              alt="Dentalize"
              width={200}
              height={70}
              className="w-full h-auto max-h-16"
              priority
            />
          </Link>
          <p className="text-sm text-gray-600 mt-3 truncate">{session.user.name}</p>
        </div>

        <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Agenda
            </Button>
          </Link>
          <Link href="/dashboard/clientes">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Clientes
            </Button>
          </Link>
          <Link href="/dashboard/servicos">
            <Button variant="ghost" className="w-full justify-start">
              <Briefcase className="mr-2 h-4 w-4" />
              Serviços
            </Button>
          </Link>
        </nav>

        <div className="p-3 lg:p-4 border-t border-gray-200">
          <form action={logoutUser}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar
        userName={session.user.name}
      />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
