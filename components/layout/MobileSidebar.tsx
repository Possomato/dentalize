"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, LogOut, Calendar, Users, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutUser } from "@/actions/auth"

interface MobileSidebarProps {
  userName: string
}

export function MobileSidebar({ userName }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)
  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* Mobile Header - visible only on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
        <Link href="/dashboard" onClick={closeSidebar} className="flex items-center py-2">
          <Image
            src="/dentalize-logo.png"
            alt="Dentalize"
            width={140}
            height={48}
            className="w-auto h-10"
            priority
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          className="flex-shrink-0"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 mt-16"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`md:hidden fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600 truncate">{userName}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link href="/dashboard" onClick={closeSidebar}>
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Agenda
            </Button>
          </Link>
          <Link href="/dashboard/clientes" onClick={closeSidebar}>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Clientes
            </Button>
          </Link>
          <Link href="/dashboard/servicos" onClick={closeSidebar}>
            <Button variant="ghost" className="w-full justify-start">
              <Briefcase className="mr-2 h-4 w-4" />
              Serviços
            </Button>
          </Link>
        </nav>

        <div className="p-3 border-t border-gray-200">
          <form action={logoutUser}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={closeSidebar}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* Spacer for mobile header */}
      <div className="md:hidden h-16" />
    </>
  )
}
