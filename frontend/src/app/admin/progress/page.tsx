"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Loader2, Users, BookOpen, Clock } from "lucide-react";
import { format } from "date-fns";
import { Navbar } from "@/components/layout/Navbar";

export default function AdminProgressPage() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    try {
      const { data } = await api.get("/admin/progress");
      setProgressData(data.data);
    } catch (error) {
      console.error("Failed to fetch progress", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Learner Progress</h1>
        <p className="text-muted-foreground">Track how your students are moving through the courses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(progressData.map((p: any) => p.subject.id)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressData.length > 0 
                ? Math.round(progressData.reduce((acc: number, p: any) => acc + p.progress_percentage, 0) / progressData.length) 
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learner Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Joined At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {progressData.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.user.name}</div>
                    <div className="text-xs text-muted-foreground">{item.user.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.subject.title}</div>
                  </TableCell>
                  <TableCell className="w-[200px]">
                    <div className="space-y-1">
                      <Progress value={item.progress_percentage} className="h-2" />
                      <div className="text-[10px] flex justify-between text-muted-foreground mt-1">
                        <span>{item.progress_percentage === 100 ? (
                          <span className="text-green-600 font-bold">Completed</span>
                        ) : 'In Progress'}</span>
                        <span>{item.progress_percentage}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {item.completed_videos} / {item.subject.total_videos} videos
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(item.enrolled_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
              {progressData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No learner activity found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </main>
    </div>
  );
}
