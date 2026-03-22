"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { CheckCircle, Lock, Play, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Video {
  id: string;
  title: string;
  duration_seconds: number;
  is_completed: boolean;
  locked: boolean;
}

interface Section {
  id: string;
  title: string;
  subject_id: string;
  videos: Video[];
}

interface LessonSidebarProps {
  subjectTitle: string;
  sections: Section[];
}

export function LessonSidebar({ subjectTitle, sections }: LessonSidebarProps) {
  const { videoId } = useParams();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    Object.fromEntries(sections.map(s => [s.id, true]))
  );

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-card flex flex-col h-full lg:h-full overflow-hidden shrink-0">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-bold text-sm line-clamp-2">{subjectTitle}</h3>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {sections.map((section, idx) => (
          <div key={section.id} className="border-b last:border-b-0">
            <button
              onClick={() => toggleSection(section.id)}
              className="group w-full flex items-center justify-between p-4 hover:bg-primary/5 hover:text-primary transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground group-hover:text-primary/70 transition-colors w-4 text-center">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold line-clamp-1">{section.title}</span>
              </div>
              {expandedSections[section.id] ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </button>
            
            {expandedSections[section.id] && (
              <div className="bg-muted/10 pb-2">
                {section.videos.map((video) => {
                  const isActive = video.id === videoId;
                  
                  return (
                    <Link
                      key={video.id}
                      href={video.locked ? "#" : `/subjects/${section.subject_id || '..'}/video/${video.id}`}
                      className={cn(
                        "group flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 border-l-2",
                        isActive ? "bg-primary/10 text-primary font-medium border-primary" : "border-transparent hover:bg-primary/5 hover:border-primary/50 text-muted-foreground hover:text-foreground",
                        video.locked && "cursor-not-allowed opacity-60 hover:bg-transparent hover:border-transparent hover:text-muted-foreground"
                      )}
                      onClick={(e) => video.locked && e.preventDefault()}
                    >
                      <div className="shrink-0 flex items-center justify-center w-5 h-5 transition-transform group-hover:scale-110">
                        {video.is_completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500 fill-green-500/10" />
                        ) : video.locked ? (
                          <Lock className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                         <span className={cn("line-clamp-1", isActive && "text-foreground")}>
                           {video.title}
                         </span>
                         <span className="text-[10px] opacity-70">
                           {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                         </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
