import React, { useState } from "react";
import { openRazorpayCheckout, RazorpayPrefill } from "../../lib/razorpay";
import { toast } from "sonner";
import { CreditCard, Loader2 } from "lucide-react";

export interface RazorpayCheckoutButtonProps {
  amountInPaise: number; // e.g. 50000 = ₹500
  currency?: string;
  receipt?: string;
  orderId?: string;
  prefill?: RazorpayPrefill;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure?: (error: any) => void;
}

export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  amountInPaise,
  currency = "INR",
  receipt,
  orderId,
  prefill,
  buttonText,
  className = "",
  disabled = false,
  onSuccess,
  onFailure,
}) => {
  const [loading, setLoading] = useState(false);

  const formattedAmount = (amountInPaise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: currency || "INR",
  });

  const handlePay = async () => {
    if (amountInPaise < 100) {
      toast.error("Amount must be at least ₹1.00 (100 paise).");
      return;
    }

    setLoading(true);
    try {
      await openRazorpayCheckout({
        amount: amountInPaise,
        currency,
        receipt,
        order_id: orderId,
        prefill,
        onSuccess: (res) => {
          setLoading(false);
          toast.success("Payment successful! Verification confirmed.");
          if (onSuccess) onSuccess(res);
        },
        onFailure: (err) => {
          setLoading(false);
          const errorMsg = err?.description || err?.message || "Payment could not be completed.";
          toast.error(`Payment failed: ${errorMsg}`);
          if (onFailure) onFailure(err);
        },
        onDismiss: () => {
          setLoading(false);
          toast.info("Payment window dismissed.");
        },
      });
    } catch (err: any) {
      setLoading(false);
      toast.error(err?.message || "Failed to initialize Razorpay Checkout.");
      if (onFailure) onFailure(err);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={disabled || loading}
      className={
        className ||
        "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-black bg-amber-500 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      }
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing Payment...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          <span>{buttonText || `Pay ${formattedAmount} via Razorpay`}</span>
        </>
      )}
    </button>
  );
};
