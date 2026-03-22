"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { Input } from "@/components/ui/input";
import { Search, Info } from "lucide-react";

export default function SubjectsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get(`/subjects?search=${search}`);
      setSubjects(data.data.subjects);
    } catch (err) {
      console.error("Failed to fetch subjects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      router.push("/dashboard");
      return;
    }
    const timer = setTimeout(() => {
      fetchSubjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-primary/5 py-12 px-4 border-b">
          <div className="container max-w-7xl mx-auto flex flex-col items-center text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Master New Skills with Antigravity
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Clean, minimalist, and powerful learning experience designed for modern students.
            </p>
            <div className="relative w-full max-w-md mt-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search for courses..." 
                className="pl-10 h-12 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="container max-w-7xl mx-auto px-4 py-12 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Courses</h2>
            <div className="text-sm text-muted-foreground">
              Showing {subjects.length} results
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-[350px] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : subjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subjects.map((subject: any) => (
                <SubjectCard key={subject.id} {...subject} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-dashed">
              <Info className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No courses found</p>
              <p className="text-muted-foreground">Try a different search term or check back later.</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="border-t py-8 px-4 bg-muted/10">
        <div className="container max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          © 2024 Learn n Earn. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
