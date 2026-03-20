"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { format } from "date-fns";
import { CreditCard, ArrowLeft, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/payments/history");
      setPayments(data);
    } catch (err) {
      console.error("Failed to fetch payment history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />
      <main className="flex-grow container max-w-7xl mx-auto px-4 py-8 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <Link href="/profile" className="text-sm text-primary flex items-center gap-1 hover:underline mb-2">
              <ArrowLeft className="h-4 w-4" /> Back to Profile
            </Link>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <History className="h-8 w-8 text-primary" />
              Payment History
            </h1>
            <p className="text-muted-foreground">Manage your course enrollments and transaction records.</p>
          </div>
        </div>

        <Card className="border-none shadow-md overflow-hidden bg-card">
          <CardHeader className="bg-muted/10 border-b">
            <CardTitle className="text-lg">Your Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading history...</p>
              </div>
            ) : payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
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
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            {payment.subject.thumbnail_url ? (
                              <img src={payment.subject.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <CreditCard className="h-5 w-5 opacity-20" />
                            )}
                          </div>
                          <span className="line-clamp-1">{payment.subject.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {payment.transaction_id}
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
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
                  <CreditCard className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">No payments yet</h3>
                  <p className="text-sm text-muted-foreground">Courses you enroll in will appear here.</p>
                </div>
                <Link href="/">
                  <Button variant="outline">Explore Courses</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
