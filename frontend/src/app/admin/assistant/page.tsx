'use client';

import { AdminAssistant } from '@/components/ai/AdminAssistant';

export default function AdminAssistantPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Operations Hub</h1>
        <p className="text-muted-foreground mt-2">
          Use the AI assistant to get insights and help with administrative tasks.
        </p>
      </div>
      
      <div className="grid gap-6">
        <AdminAssistant />
      </div>
    </div>
  );
}
