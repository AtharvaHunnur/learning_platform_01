"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, ShieldCheck, Info } from "lucide-react";
import api from "@/lib/api";

interface PaymentGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  subjectTitle: string;
  amount: string | number;
  onSuccess: () => void;
}

export function PaymentGateway({ isOpen, onClose, subjectId, subjectTitle, amount, onSuccess }: PaymentGatewayProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Card details, 2: Processing, 3: Success

  const handlePay = async () => {
    setLoading(true);
    setStep(2);
    
    try {
      // 1. Initiate payment on backend
      const initRes = await api.post("/payments/initiate", { subjectId });
      const paymentId = initRes.data.id;

      // 2. Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Complete payment on backend
      await api.post(`/payments/${paymentId}/complete`);
      
      setStep(3);
      setTimeout(() => {
        onSuccess();
        onClose();
        // Reset for next time
        setStep(1);
      }, 2000);
    } catch (err) {
      console.error("Payment failed", err);
      setStep(1); // Back to card details on error
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Secure Checkout</DialogTitle>
              <DialogDescription>
                Enroll in <span className="font-semibold text-foreground">{subjectTitle}</span> for ₹{amount}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="4242 4242 4242 4242" className="pl-10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiry</label>
                  <Input placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CVV</label>
                  <Input placeholder="123" type="password" />
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3 border border-blue-100">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-700">
                  This is a dummy payment gateway. No real transaction will be made. You can use any card details.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button onClick={handlePay} disabled={loading} className="gap-2">
                Pay ₹{amount} Now
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="font-medium">Processing payment...</p>
            <p className="text-sm text-muted-foreground">Please do not refresh the page.</p>
          </div>
        )}

        {step === 3 && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="bg-green-100 p-3 rounded-full">
              <ShieldCheck className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Payment Successful!</h3>
            <p className="text-muted-foreground">You are now enrolled in the course.</p>
            <p className="text-sm text-primary font-medium animate-pulse">Redirecting to course content...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
