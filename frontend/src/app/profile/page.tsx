"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { User, Mail, Shield, BookOpen, Clock, Calendar, History as HistoryIcon } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/auth/profile");
      setProfile(data.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (loading) return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center space-y-4">
        <p className="text-xl text-muted-foreground">Please login to view your profile.</p>
        <Link href="/auth/login">
          <Button>Login Now</Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow container max-w-7xl mx-auto px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Info Sidebar */}
          <div className="space-y-6">
            <Card className="glass-card overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300">
              <div className="h-24 bg-primary/20" />
              <CardContent className="px-6 pb-6 -mt-12 text-center">
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-background border-4 border-muted shadow-sm mb-4">
                  <User className="h-12 w-12 text-primary/40" />
                </div>
                <h2 className="text-xl font-bold">{profile?.name || user?.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">{profile?.email || user?.email}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    <Shield className="h-3 w-3 mr-1" />
                    {profile?.role || user?.role}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {profile && new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
                <div className="pt-2">
                  <Link href="/profile/payments">
                    <Button variant="outline" size="sm" className="w-full gap-2 font-medium">
                      <HistoryIcon className="h-4 w-4" />
                      Payment History
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrolled Courses */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-3xl font-extrabold flex items-center gap-3 mb-8">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-gradient">My Enrolled Courses</span>
            </h2>

            {profile?.enrollments?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {profile.enrollments.map((enrollment: any) => (
                  <Card key={enrollment.id} className="overflow-hidden hover:shadow-md transition-shadow group border-none shadow-sm">
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      {enrollment.subject.thumbnail_url ? (
                        <img 
                          src={enrollment.subject.thumbnail_url} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full opacity-10">
                          <BookOpen className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base line-clamp-1">{enrollment.subject.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <Link href={`/subjects/${enrollment.subject.id}`}>
                        <Button variant="outline" className="w-full">Continue Learning</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                <p className="text-muted-foreground mb-4">You haven&apos;t enrolled in any courses yet.</p>
                <Link href="/subjects">
                  <Button>Browse Courses</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
