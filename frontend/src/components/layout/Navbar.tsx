"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { LogOut, User, BookOpen, GraduationCap, Users, LayoutDashboard } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">Antigravity LMS</span>
          </Link>
          <div className="hidden md:flex ml-8 gap-6">
            <Link 
              href="/subjects" 
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname.startsWith('/subjects') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Explore Courses
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant={pathname === '/dashboard' ? "secondary" : "ghost"} size="sm" className="gap-2 text-primary">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant={pathname === '/profile' ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
              </Link>
              {user?.role === "ADMIN" && (
                <div className="flex gap-2">
                  <Link href="/admin/courses">
                    <Button variant="ghost" size="sm" className="gap-2 text-primary">
                      <BookOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">Courses</span>
                    </Button>
                  </Link>
                  <Link href="/admin/progress">
                    <Button variant="ghost" size="sm" className="gap-2 text-primary">
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Progress</span>
                    </Button>
                  </Link>
                  <Link href="/admin/payments">
                    <Button variant="ghost" size="sm" className="gap-2 text-primary">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden sm:inline">Payments</span>
                    </Button>
                  </Link>
                </div>
              )}
              <Button variant="outline" size="sm" className="gap-2" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
