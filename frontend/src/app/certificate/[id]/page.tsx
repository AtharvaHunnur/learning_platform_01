"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { ArrowLeft, Download, Award, ShieldCheck, Share2 } from "lucide-react";

export default function CertificatePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await api.get(`/certificates/${id}`);
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to load certificate", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 space-y-4">
      <ShieldCheck className="h-16 w-16 text-slate-300" />
      <h2 className="text-2xl font-bold text-slate-700">Certificate not found</h2>
      <Button variant="outline" onClick={() => router.push('/dashboard')}>Return Home</Button>
    </div>
  );

  const issueDate = new Date(data.issued_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans print:bg-white print:block">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: 1056px 816px; margin: 0; }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            background: white !important;
          }
        }
      `}} />
      {/* Top Navigation / Controls */}
      <div className="bg-white border-b px-4 py-4 md:px-8 flex items-center justify-between shadow-sm print:hidden">
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 text-slate-600">
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button onClick={handlePrint} className="gap-2 bg-primary">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Certificate Viewer */}
      <div className="flex-grow flex items-center justify-center p-4 md:p-12 overflow-x-auto print:block print:p-0 print:m-0 print:overflow-visible">
        
        {/* The Certificate Border/Layout Wrapper */}
        <div 
          ref={printRef}
          className="relative bg-white shadow-2xl w-[1056px] h-[816px] shrink-0 border-[16px] border-slate-900 overflow-hidden flex flex-col print:shadow-none print:border-[16px] print:m-0"
        >
          {/* Inner Decorative Border */}
          <div className="absolute inset-3 border-2 border-slate-300 pointer-events-none"></div>
          <div className="absolute inset-4 border border-slate-200 pointer-events-none"></div>

          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-20 text-center">
            
            {/* Header */}
            <div className="mb-10 flex flex-col items-center">
              <div className="bg-slate-900 text-white p-3 rounded-full mb-6 relative">
                 <Award className="h-10 w-10 text-yellow-400 relative z-10" />
                 <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md animate-pulse"></div>
              </div>
              <h1 className="text-5xl md:text-6xl font-serif text-slate-900 tracking-widest uppercase">
                Certificate
              </h1>
              <p className="text-2xl mt-2 tracking-[0.2em] text-slate-500 uppercase font-light">
                Of Completion
              </p>
            </div>

            {/* Content Body */}
            <div className="space-y-6 max-w-3xl">
              <p className="text-lg text-slate-500 italic font-serif">
                This is to certify that
              </p>
              
              <h2 className="text-5xl md:text-6xl font-bold text-slate-800 tracking-tight font-serif pb-2 border-b-2 border-slate-200 mx-12">
                {data.user.name}
              </h2>
              
              <p className="text-lg text-slate-500 font-serif max-w-2xl mx-auto pt-4 leading-relaxed">
                has successfully completed all requirements and coursework for the program
              </p>

              <h3 className="text-3xl font-bold text-primary mt-4 font-sans px-8">
                {data.subject.title}
              </h3>

            </div>

            {/* Footer / Signatures */}
            <div className="w-full flex justify-between items-end mt-24 px-12">
              <div className="flex flex-col items-center border-t-2 border-slate-300 pt-3 w-48 shrink-0">
                <span className="text-xl font-[signature] text-slate-800 -mt-16 mb-6 inline-block transform -rotate-2">
                  SkillForge
                </span>
                <span className="font-bold text-slate-700 uppercase tracking-wider text-sm">Instructor</span>
              </div>
              
               <div className="flex flex-col items-center pb-4">
                  <div className="h-24 w-24 rounded-full border-4 border-yellow-400 bg-white flex items-center justify-center shadow-lg relative z-20">
                     <div className="h-20 w-20 rounded-full border border-yellow-200 bg-yellow-50 flex items-center justify-center">
                       <ShieldCheck className="h-10 w-10 text-yellow-500" />
                     </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
                    ID: {data.id.split('-')[0]}
                  </span>
              </div>

              <div className="flex flex-col items-center border-t-2 border-slate-300 pt-3 w-48 shrink-0">
                <span className="text-lg font-medium text-slate-800 -mt-10 mb-4 inline-block">
                  {issueDate}
                </span>
                <span className="font-bold text-slate-700 uppercase tracking-wider text-sm">Date Issued</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
