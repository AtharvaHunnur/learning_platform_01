"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, LayoutDashboard, User as UserIcon, History, IndianRupee } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState({ users: 0, courses: 0, revenue: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      api.get("/admin/stats")
        .then((res) => setStats(res.data.data))
        .catch((err) => console.error("Failed to load admin stats", err));
    }
  }, [user]);

  if (!isMounted || !user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow container max-w-7xl mx-auto px-4 py-12 md:px-8">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            Welcome back, <span className="text-gradient">{user.name}</span>
          </h1>
          <p className="text-muted-foreground text-lg">Here is an overview of your account and learning progress.</p>
        </div>

        {user.role === "ADMIN" ? (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card bg-primary/5 border-primary/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.users}</div>
                  <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
                </CardContent>
              </Card>
              <Card className="glass-card bg-primary/5 border-primary/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.courses}</div>
                  <p className="text-xs text-muted-foreground mt-1">Published and draft</p>
                </CardContent>
              </Card>
              <Card className="glass-card bg-primary/5 border-primary/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  <IndianRupee className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₹{stats.revenue}</div>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </CardContent>
              </Card>
            </div>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-primary/10 hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Manage Courses</CardTitle>
                <BookOpen className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Create, edit, and organize all courses, sections, and videos.</p>
                <Link href="/admin/courses">
                  <Button className="w-full">Go to Courses</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="glass-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-primary/10 hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Student Progress</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Track enrollments and learning progress across all users.</p>
                <Link href="/admin/progress">
                  <Button className="w-full">View Progress</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="glass-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-primary/10 hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Payments</CardTitle>
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Review transaction history and financial records.</p>
                <Link href="/admin/payments">
                  <Button className="w-full">Manage Payments</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-primary/10 hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Explore Courses</CardTitle>
                <BookOpen className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Browse and enroll in new courses to expand your skills.</p>
                <Link href="/subjects">
                  <Button className="w-full">Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="glass-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-primary/10 hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">My Profile & Enrolled</CardTitle>
                <UserIcon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">View your account details and continue learning your enrolled courses.</p>
                <Link href="/profile">
                  <Button className="w-full">View Profile</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="glass-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-primary/10 hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Payment History</CardTitle>
                <History className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Review your past transactions and receipts.</p>
                <Link href="/profile/payments">
                  <Button className="w-full">View Receipts</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
