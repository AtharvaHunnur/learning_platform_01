"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { extractYouTubeId } from "@/lib/utils";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    preview_youtube_url: "",
    price: "",
    is_published: false,
  });

  const extractedThumbnail = formData.preview_youtube_url 
    ? extractYouTubeId(formData.preview_youtube_url) 
      ? `https://img.youtube.com/vi/${extractYouTubeId(formData.preview_youtube_url)}/mqdefault.jpg` 
      : null
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/subjects", {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0,
      });
      alert("🎉 Course created successfully! It is now visible to " + (formData.is_published ? "everyone." : "admins only."));
      router.push(`/admin/courses`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto py-8 px-4">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/admin/courses">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Link>
      </Button>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Course</CardTitle>
            <CardDescription>
              Set up the basics for your new subject. You can add sections and videos later.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Title</label>
                <Input 
                  placeholder="e.g. Master Next.js 15" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  placeholder="What will students learn?" 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview YouTube URL (Optional)</label>
                <Input 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  value={formData.preview_youtube_url}
                  onChange={e => setFormData({...formData, preview_youtube_url: e.target.value})}
                />
                {extractedThumbnail ? (
                  <div className="mt-2 relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-md border text-muted-foreground">
                    <img src={extractedThumbnail} alt="Extracted Thumbnail Preview" className="object-cover w-full h-full" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-center text-[10px] text-white">Live Thumbnail Preview</div>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    A thumbnail will be automatically generated from this video.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (INR)</label>
                <Input 
                  type="number" 
                  placeholder="0 for free" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="published" 
                  checked={formData.is_published} 
                  onChange={e => setFormData({...formData, is_published: e.target.checked})} 
                />
                <label htmlFor="published" className="text-sm font-medium cursor-pointer">
                  Publish Immediately
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Course
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      </main>
    </div>
  );
}
