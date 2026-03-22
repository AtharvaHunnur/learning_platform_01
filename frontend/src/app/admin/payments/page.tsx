"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { format } from "date-fns";
import { LayoutDashboard, Wallet, User as UserIcon, BookOpen } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const fetchAllPayments = async () => {
    try {
      const { data } = await api.get("/admin/payments");
      setPayments(data.data);
    } catch (err) {
      console.error("Failed to fetch all payments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      fetchAllPayments();
    }
  }, [isAuthenticated, user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Navbar />
      <main className="flex-grow container max-w-7xl mx-auto px-4 py-8 md:px-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">Sales and Payment Management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm opacity-80">Total Revenue</p>
                <h3 className="text-2xl font-bold">
                  ₹{payments.filter(p => p.status === "COMPLETED").reduce((acc, p) => acc + parseFloat(p.amount), 0).toLocaleString()}
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-xl">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Enrollments</p>
                <h3 className="text-2xl font-bold">{payments.filter(p => p.status === "COMPLETED").length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <UserIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Successful Payments</p>
                <h3 className="text-2xl font-bold">{payments.filter(p => p.status === "COMPLETED").length}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-md overflow-hidden bg-card">
          <CardHeader className="bg-muted/10 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading transactions...</p>
              </div>
            ) : payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{payment.user.name}</span>
                          <span className="text-xs text-muted-foreground lowercase leading-none">{payment.user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px]">
                        <span className="line-clamp-1">{payment.subject.title}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {payment.transaction_id}
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-bold">
                        ₹{payment.amount}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-muted p-4 rounded-full">
                  <Wallet className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">No transactions found</h3>
                  <p className="text-sm text-muted-foreground">Sales records will appear here.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
