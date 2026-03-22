"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { BookOpen, CheckCircle, Lock, Play, Clock, ArrowRight, Users, GraduationCap, AlertCircle, Award } from "lucide-react";
import { PaymentGateway } from "@/components/subjects/PaymentGateway";

export default function SubjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  
  const [subject, setSubject] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/subjects/${id}`);
      setSubject(data.data);
      
      if (isAuthenticated) {
        const enrollRes = await api.get(`/subjects/${id}/enrollment`);
        setEnrolled(enrollRes.data.data.enrolled);
        if (enrollRes.data.data.certificate_id) {
          setCertificateId(enrollRes.data.data.certificate_id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch subject", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [id, isAuthenticated, user, router]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // If subject has a price, open payment modal
    if (subject.price && parseFloat(subject.price) > 0) {
      setIsPaymentModalOpen(true);
      return;
    }

    setEnrollLoading(true);
    try {
      await api.post(`/subjects/${id}/enroll`);
      setEnrolled(true);
      handleStartLearning();
    } catch (err: any) {
      console.error("Enrollment failed", err);
      alert(err.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleStartLearning = () => {
    const firstSection = subject.sections[0];
    const firstVideo = firstSection?.videos[0];
    if (firstVideo) {
      router.push(`/subjects/${id}/video/${firstVideo.id}`);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </div>
  );

  if (!subject) return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Subject not found.</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-slate-900 text-white py-16 px-4">
          <div className="container max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-grow max-w-3xl space-y-6">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                {subject.title}
              </h1>
              <p className="text-slate-300 text-lg md:text-xl line-clamp-3">
                {subject.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{subject.sections.length} Sections</span>
                </div>
                <div className="flex items-center gap-1">
                  <Play className="h-4 w-4" />
                  <span>{subject.sections.reduce((acc: number, s: any) => acc + s.videos.length, 0)} Lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{subject._count.enrollments} Students enrolled</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {enrolled ? (
                  <>
                    <Button size="lg" className="gap-2 h-14 text-lg px-8" onClick={handleStartLearning}>
                      Continue Learning
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    {certificateId && user?.role !== 'ADMIN' && (
                      <Button 
                        size="lg" 
                        className="gap-2 h-14 text-lg px-8 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold" 
                        onClick={() => window.open(`/certificate/${certificateId}`, '_blank')}
                      >
                        <Award className="h-5 w-5" />
                        View Certificate
                      </Button>
                    )}
                  </>
                ) : (
                  <Button size="lg" className="gap-2 h-14 text-lg px-8" onClick={handleEnroll} disabled={enrollLoading}>
                    {enrollLoading ? "Processing..." : (subject.price && parseFloat(subject.price) > 0 ? `Enroll for ₹${subject.price}` : "Enroll for Free")}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                )}
                <Button variant="outline" size="lg" className="h-14 text-white hover:text-white border-slate-700 bg-transparent hover:bg-slate-800">
                  Wishlist
                </Button>
              </div>
            </div>
            
            <div className="w-full max-w-sm shrink-0">
               <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-video relative bg-slate-800">
                  {subject.thumbnail_url ? (
                    <img src={subject.thumbnail_url} alt={subject.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full opacity-20">
                      <GraduationCap className="h-20 w-20" />
                    </div>
                  )}
               </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container max-w-7xl mx-auto px-4 py-12 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-2xl font-bold mb-6">Course Content</h2>
                <div className="border rounded-xl divide-y overflow-hidden shadow-sm">
                  {subject.sections.map((section: any, idx: number) => (
                    <div key={section.id} className="bg-card">
                       <div className="bg-muted/30 px-6 py-4 font-semibold flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <span className="text-muted-foreground w-6">0{idx + 1}</span>
                           {section.title}
                         </div>
                         <span className="text-xs text-muted-foreground">{section.videos.length} Lectures</span>
                       </div>
                       <div className="divide-y">
                         {section.videos.map((video: any) => (
                           <div key={video.id} className="px-6 py-4 flex items-center justify-between group hover:bg-muted/20 transition-colors">
                              <div className="flex items-center gap-3">
                                {enrolled ? (
                                  <div className="flex items-center justify-center w-5 h-5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:scale-150 transition-transform" />
                                  </div>
                                ) : (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-sm">{video.title}</span>
                              </div>
                              <div className="text-xs text-muted-foreground tabular-nums">
                                {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-4">About this Course</h2>
                <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                  {subject.description}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
               <Card className="sticky top-24 border-none shadow-md bg-muted/30">
                 <CardContent className="p-6 space-y-6">
                   <h3 className="font-bold text-lg">Includes</h3>
                   <ul className="space-y-4">
                     <li className="flex items-center gap-3 text-sm">
                       <Play className="h-4 w-4 text-primary" />
                       {subject.sections.reduce((acc: number, s: any) => acc + s.videos.length, 0)} high-quality video lessons
                     </li>
                     <li className="flex items-center gap-3 text-sm">
                       <Clock className="h-4 w-4 text-primary" />
                       Total {Math.floor(subject.sections.reduce((acc: number, s: any) => 
                         acc + s.videos.reduce((vAcc: number, v: any) => vAcc + v.duration_seconds, 0), 0) / 3600)} hours of content
                     </li>
                     <li className="flex items-center gap-3 text-sm">
                       <CheckCircle className="h-4 w-4 text-primary" />
                       Certificate of completion
                     </li>
                   </ul>
                   <div className="pt-4 border-t">
                     <p className="text-xs text-muted-foreground text-center">
                       Lifetime access. Learn at your own pace.
                     </p>
                   </div>
                 </CardContent>
               </Card>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-12 px-4 mt-20 bg-slate-50">
        <div className="container max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Antigravity LMS</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Empowering learners worldwide through high-quality, accessible education.
            </p>
          </div>
          <div></div>
          <div className="text-sm text-muted-foreground flex flex-col items-center md:items-end md:justify-center">
            <p>© 2024 Antigravity LMS. Built for Excellence.</p>
          </div>
        </div>
      </footer>

      <PaymentGateway 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        subjectId={subject.id}
        subjectTitle={subject.title}
        amount={subject.price}
        onSuccess={() => {
          setEnrolled(true);
          handleStartLearning();
        }}
      />
    </div>
  );
}
