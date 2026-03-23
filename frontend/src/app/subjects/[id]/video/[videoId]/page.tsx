"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { LessonSidebar } from "@/components/video/LessonList";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import YouTube from "react-youtube";
import { ChevronLeft, ChevronRight, CheckCircle, RotateCcw, Monitor, MessageSquare, Info, Lock, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VideoPlayerPage() {
  const { id: subjectId, videoId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [data, setData] = useState<any>(null);
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const lastUpdateRef = useRef<number>(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [videoRes, treeRes] = await Promise.all([
        api.get(`/videos/${videoId}`),
        api.get(`/subjects/${subjectId}/tree`)
      ]);
      
      setData(videoRes.data.data);
      setTree(treeRes.data.data);
      
      if (videoRes.data.data.locked) {
        // Find first unlocked video if this one is locked
        console.warn("Video is locked:", videoRes.data.data.unlock_reason);
      }
    } catch (err) {
      console.error("Failed to fetch video data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [videoId]);

  const updateProgress = async (seconds: number, completed: boolean = false) => {
    if (syncing) return;
    
    try {
      setSyncing(true);
      await api.post(`/progress/videos/${videoId}`, {
        last_position_seconds: isNaN(seconds) || seconds === null ? 0 : Math.floor(seconds),
        is_completed: completed
      });
      
      if (completed) {
        // Refresh tree to update sidebar completion marks and locks
        const treeRes = await api.get(`/subjects/${subjectId}/tree`);
        setTree(treeRes.data.data);
      }
    } catch (err) {
      console.error("Failed to update progress", err);
    } finally {
      setSyncing(false);
    }
  };

  // Track progress every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (player && player.getPlayerState() === 1) { // 1 is Playing
        const currentTime = player.getCurrentTime();
        if (Math.abs(currentTime - lastUpdateRef.current) > 10) {
          updateProgress(currentTime);
          lastUpdateRef.current = currentTime;
        }
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [player, videoId]);

  const onPlayerReady = (event: any) => {
    setPlayer(event.target);
    if (data?.progress?.last_position_seconds) {
      event.target.seekTo(data.progress.last_position_seconds);
    }
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === 0) { // 0 is Ended
      handleVideoEnd();
    }
  };

  const handleVideoEnd = async () => {
    await updateProgress(player.getDuration(), true);
    
    if (data.next_video_id) {
      router.push(`/subjects/${subjectId}/video/${data.next_video_id}`);
    } else {
      try {
        const res = await api.post('/certificates', { subjectId });
        if (res.data?.data?.id) {
          router.push(`/certificate/${res.data.data.id}`);
        }
      } catch (err) {
        console.error("Certificate generation failed or already exists:", err);
      }
    }
  };

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  if (loading) return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    </div>
  );

  if (!data || !tree) return <div className="p-8">Error loading content</div>;

  const totalVideos = tree?.sections?.reduce((acc: number, s: any) => acc + s.videos?.length, 0) || 0;
  const completedVideos = tree?.sections?.reduce((acc: number, s: any) => acc + s.videos?.filter((v: any) => v.is_completed).length, 0) || 0;
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-col lg:flex-row flex-grow overflow-y-auto lg:overflow-hidden relative">
        {/* Main Content */}
        <div className="flex-grow flex flex-col lg:overflow-y-auto bg-slate-950 shrink-0">
          <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
            {data.locked ? (
              <div className="aspect-video bg-slate-900 flex flex-col items-center justify-center text-white rounded-xl border border-white/5 space-y-4">
                <Lock className="h-12 w-12 text-slate-500" />
                <h2 className="text-xl font-bold">This lesson is locked</h2>
                <p className="text-slate-400">{data.unlock_reason}</p>
                <Button variant="outline" className="border-slate-800" onClick={() => router.back()}>
                  Go Back
                </Button>
              </div>
            ) : (
              <div className="aspect-video relative w-full bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <YouTube
                  videoId={extractVideoId(data.youtube_url)}
                  opts={{
                    width: "100%",
                    height: "100%",
                    playerVars: {
                      autoplay: 1,
                      rel: 0,
                      modestbranding: 1,
                    },
                  }}
                  onReady={onPlayerReady}
                  onStateChange={onPlayerStateChange}
                  className="w-full h-full absolute top-0 left-0"
                  iframeClassName="w-full h-full"
                />
              </div>
            )}
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-2 border-b border-white/10">
               <div>
                  <h1 className="text-2xl font-bold text-white">{data.title}</h1>
                  <p className="text-slate-400 text-sm">{data.section_title} • {Math.floor(data.duration_seconds / 60)} mins</p>
               </div>
               <div className="flex items-center gap-3">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
                   disabled={!data.previous_video_id}
                   onClick={() => router.push(`/subjects/${subjectId}/video/${data.previous_video_id}`)}
                 >
                   <ChevronLeft className="h-4 w-4 mr-1" />
                   Previous
                 </Button>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="bg-primary/20 border-primary/30 text-primary-foreground hover:bg-primary/30"
                   disabled={!data.next_video_id}
                   onClick={() => router.push(`/subjects/${subjectId}/video/${data.next_video_id}`)}
                 >
                   Next
                   <ChevronRight className="h-4 w-4 ml-1" />
                 </Button>
                 
                 {/* Claim Certificate Button showing on last video */}
                 {!data.next_video_id && user?.role !== 'ADMIN' && (
                    <Button 
                      size="sm" 
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
                      onClick={handleVideoEnd}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Claim Certificate
                    </Button>
                 )}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
               <div className="md:col-span-2 space-y-4">
                  <div className="flex border-b border-white/5">
                    <button className="px-6 py-2 border-b-2 border-primary text-sm font-medium text-white">Description</button>
                    <button className="px-6 py-2 border-b-2 border-transparent text-sm font-medium text-slate-400 hover:text-white transition-colors">Resources</button>
                    <button className="px-6 py-2 border-b-2 border-transparent text-sm font-medium text-slate-400 hover:text-white transition-colors">Q&A</button>
                  </div>
                  <div className="text-slate-300 text-sm leading-relaxed min-h-[100px] whitespace-pre-line">
                    {data.description || "No description provided for this lesson."}
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-white/5 space-y-3">
                     <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject Overview</h4>
                     <p className="text-white font-medium text-sm">{tree.title}</p>
                     
                     <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                     </div>
                     <p className="text-[10px] text-slate-400 flex justify-between">
                        <span>Progress</span>
                        <span>{progressPercent}% Complete</span>
                     </p>
                  </div>
                  
                  {/* Certificate Status Tracker */}
                  {user?.role !== 'ADMIN' && (
                  <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${progressPercent === 100 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-slate-900 border-white/5 opacity-80'}`}>
                    <div className="flex items-center gap-3">
                       <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${progressPercent === 100 ? 'bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                          {progressPercent === 100 ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                       </div>
                       <div>
                         <h4 className={`text-sm font-bold ${progressPercent === 100 ? 'text-yellow-500' : 'text-slate-400'}`}>
                           Course Certificate
                         </h4>
                         <p className="text-[10px] text-slate-500">
                           {progressPercent === 100 ? 'Fully unlocked!' : `Complete ${totalVideos - completedVideos} more lessons`}
                         </p>
                       </div>
                    </div>
                    {progressPercent === 100 && (
                      <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 h-8 text-xs font-bold" onClick={handleVideoEnd}>
                        View
                      </Button>
                    )}
                  </div>
                  )}
                  
                  <div className="flex flex-col gap-2 pt-2">
                    <Button variant="ghost" size="sm" className="justify-start gap-3 text-slate-400 h-10 hover:text-white hover:bg-white/5">
                      <RotateCcw className="h-4 w-4" /> Reset Progress
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start gap-3 text-slate-400 h-10 hover:text-white hover:bg-white/5">
                      <Monitor className="h-4 w-4" /> Large Player
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start gap-3 text-slate-400 h-10 hover:text-white hover:bg-white/5">
                      <MessageSquare className="h-4 w-4" /> Ask a Question
                    </Button>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <LessonSidebar subjectTitle={tree.title} sections={tree.sections} />
      </div>
    </div>
  );
}
