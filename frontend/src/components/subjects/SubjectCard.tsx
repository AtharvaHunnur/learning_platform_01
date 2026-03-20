"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock } from "lucide-react";

interface SubjectCardProps {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  _count: {
    sections: number;
    enrollments: number;
  };
  price: string | number | null;
}

export function SubjectCard({ id, title, description, thumbnail_url, _count, price }: SubjectCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300">
      <div className="aspect-video relative overflow-hidden bg-muted">
        {thumbnail_url ? (
          <img
            src={thumbnail_url}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <BookOpen className="h-10 w-10 opacity-20" />
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-0">
        <h3 className="font-bold text-lg line-clamp-1">{title}</h3>
      </CardHeader>
      <CardContent className="p-4 py-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {description || "No description available."}
        </p>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{_count.sections} Modules</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{_count.enrollments} Students</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {price ? `₹${price}` : "Free"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <Link href={`/subjects/${id}`} className="w-full">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
