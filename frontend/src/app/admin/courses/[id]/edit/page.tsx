"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft, Loader2, Save, Play, Pencil, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Navbar } from "@/components/layout/Navbar";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchCourseData = async () => {
    try {
      const [courseRes, sectionsRes] = await Promise.all([
        api.get(`/subjects/${id}`),
        api.get(`/sections/subject/${id}`)
      ]);
      setCourse(courseRes.data.data);
      setSections(sectionsRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch course data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setSaving(true);
    try {
      await api.put(`/subjects/${id}`, {
        title: course.title,
        description: course.description,
        price: parseFloat(course.price) || 0,
        is_published: course.is_published,
        thumbnail_url: course.thumbnail_url,
        preview_youtube_url: course.preview_youtube_url
      });
      alert("Course updated successfully");
    } catch (error) {
      alert("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const addSection = async () => {
    const title = prompt("Section Title:");
    if (!title) return;
    try {
      const { data } = await api.post(`/sections/subject/${id}`, {
        title,
        order_index: sections.length + 1
      });
      setSections([...sections, { ...data.data, videos: [] }]);
    } catch (error) {
      alert("Failed to add section");
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure? All videos in this section will be removed.")) return;
    try {
      await api.delete(`/sections/${sectionId}`);
      setSections(sections.filter(s => s.id !== sectionId));
    } catch (error) {
      alert("Failed to delete section");
    }
  };

  const addVideo = async (sectionId: string) => {
    const title = prompt("Video Title:");
    if (!title) return;
    const youtube_url = prompt("YouTube URL:");
    if (!youtube_url) return;

    try {
      const { data } = await api.post("/videos", {
        title,
        youtube_url,
        section_id: sectionId,
        order_index: 0
      });
      
      const updatedSections = sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, videos: [...(s.videos || []), data.data] };
        }
        return s;
      });
      setSections(updatedSections);
    } catch (error) {
      alert("Failed to add video");
    }
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/videos/${selectedVideo.id}`, {
        title: selectedVideo.title,
        youtube_url: selectedVideo.youtube_url,
        thumbnail_url: selectedVideo.thumbnail_url
      });
      
      setSections(sections.map(s => {
        if (s.id === selectedVideo.section_id) {
          return {
            ...s,
            videos: s.videos.map((v: any) => v.id === selectedVideo.id ? data.data : v)
          };
        }
        return s;
      }));
      setIsEditDialogOpen(false);
      alert("Video updated");
    } catch (error) {
      alert("Failed to update video");
    }
  };

  const deleteVideo = async (videoId: string, sectionId: string) => {
    if (!confirm("Delete this video?")) return;
    try {
      await api.delete(`/videos/${videoId}`);
      setSections(sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, videos: s.videos.filter((v: any) => v.id !== videoId) };
        }
        return s;
      }));
    } catch (error) {
      alert("Failed to delete video");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!course) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Course not found</h2>
        <Button asChild variant="outline">
          <Link href="/admin/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/courses"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Course</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCourse} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={course.title || ""} onChange={e => setCourse({...course, title: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (INR)</label>
                  <Input type="number" value={course.price || ""} onChange={e => setCourse({...course, price: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">YouTube URL (for auto-thumbnail)</label>
                  <Input value={course.preview_youtube_url || ""} onChange={e => setCourse({...course, preview_youtube_url: e.target.value})} placeholder="https://youtube.com/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Direct Thumbnail URL</label>
                  <Input value={course.thumbnail_url || ""} onChange={e => setCourse({...course, thumbnail_url: e.target.value})} />
                  {course.thumbnail_url && (
                    <img src={course.thumbnail_url} alt="Preview" className="mt-2 rounded-lg aspect-video object-cover w-full shadow-sm" />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={course.description || ""} rows={5} onChange={e => setCourse({...course, description: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="published" 
                    checked={course.is_published} 
                    onChange={e => setCourse({...course, is_published: e.target.checked})} 
                  />
                  <label htmlFor="published" className="text-sm font-medium">Published</label>
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sections & Videos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Course Content</h2>
            <Button onClick={addSection} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
          </div>

          {sections.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
              <p className="text-muted-foreground">No sections yet. Add your first section to start building the course.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section, sIdx) => (
                <Card key={section.id} className="overflow-hidden">
                  <div className="bg-muted/50 p-4 flex justify-between items-center border-b">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-muted-foreground">#{sIdx + 1}</span>
                      <h3 className="font-bold">{section.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => addVideo(section.id)} size="sm" variant="outline">
                        <Plus className="mr-2 h-3 w-3" /> Add Video
                      </Button>
                      <Button onClick={() => deleteSection(section.id)} size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {(section.videos || []).length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground italic">No videos in this section.</div>
                      ) : (
                        section.videos.map((video: any, vIdx: number) => (
                          <div key={video.id} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <Play className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">{video.title}</p>
                                <p className="text-[10px] text-muted-foreground">Video ID: {video.id}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                onClick={() => {
                                  setSelectedVideo(video);
                                  setIsEditDialogOpen(true);
                                }} 
                                size="sm" variant="ghost" className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button onClick={() => deleteVideo(video.id, section.id)} size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Video Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <form onSubmit={handleUpdateVideo} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input 
                  value={selectedVideo.title || ""} 
                  onChange={e => setSelectedVideo({...selectedVideo, title: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">YouTube URL</label>
                <Input 
                  value={selectedVideo.youtube_url || ""} 
                  onChange={e => setSelectedVideo({...selectedVideo, youtube_url: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Thumbnail URL (Optional)</label>
                <Input 
                  value={selectedVideo.thumbnail_url || ""} 
                  onChange={e => setSelectedVideo({...selectedVideo, thumbnail_url: e.target.value})} 
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
}
