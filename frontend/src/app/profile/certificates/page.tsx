"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, ShieldCheck, ExternalLink, Calendar } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await api.get('/certificates/me/all');
        setCertificates(res.data.data);
      } catch (err) {
        console.error("Failed to fetch certificates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow container max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              My Certificates
            </h1>
            <p className="text-muted-foreground mt-2">
              View and showcase the certificates you've earned from completing courses.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl border border-dashed border-slate-300 text-center">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <ShieldCheck className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No certificates yet</h3>
            <p className="text-slate-500 max-w-sm mt-2 mb-6">
              Complete all lessons in a course to earn your first certificate!
            </p>
            <Button onClick={() => router.push('/dashboard')}>Browse Courses</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                <div className="aspect-video w-full bg-slate-900 relative border-b overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                  {cert.subject.thumbnail_url ? (
                    <img 
                      src={cert.subject.thumbnail_url} 
                      alt={cert.subject.title} 
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <Award className="h-16 w-16 text-yellow-500/50" />
                  )}
                  {/* Visual mini-certificate overlay */}
                  <div className="absolute inset-4 border border-white/20 bg-black/40 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center">
                    <ShieldCheck className="h-8 w-8 text-yellow-400 mb-2" />
                    <span className="text-white font-serif text-sm uppercase tracking-widest">Certificate of</span>
                    <span className="text-white font-bold tracking-wider">Completion</span>
                  </div>
                </div>
                
                <CardContent className="p-6 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">
                    {cert.subject.title}
                  </h3>
                  
                  <div className="flex items-center text-sm text-slate-500 gap-2 mt-auto pt-4 pb-6">
                    <Calendar className="h-4 w-4" />
                    <span>Issued: {new Date(cert.issued_at).toLocaleDateString()}</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors mt-auto"
                    onClick={() => window.open(`/certificate/${cert.id}`, '_blank')}
                  >
                    View Certificate
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
