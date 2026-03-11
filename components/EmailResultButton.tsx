"use client";
import React, { useState } from "react";
import EmailModal from "./EmailModal";

interface EmailResultButtonProps {
  ui: any;
  recommendations: any;
  guidance?: string;
  thinkingProcess?: string;
  notes?: string;
  locale: string;
  sendResultButtonText: string;
}

const EmailResultButton: React.FC<EmailResultButtonProps> = ({
  ui,
  recommendations,
  guidance,
  thinkingProcess,
  notes,
  locale,
  sendResultButtonText
}) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setIsSending(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          recommendations,
          guidance,
          thinkingProcess,
          notes,
          locale
        })
      });
      if (res.ok) {
        setSuccess(ui.successMessage || "Email sent!");
        setOpen(false);
      } else {
        setError(ui.errorMessage || "Failed to send email.");
      }
    } catch (e) {
      setError(ui.errorMessage || "Failed to send email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        className="bg-[#bfa16b] text-white text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold shadow hover:bg-[#a88c5b] transition w-full"
        onClick={() => setOpen(true)}
      >
        {sendResultButtonText || ui.buttonText || "Send Results to Email"}
      </button>
      <EmailModal
        open={open}
        onClose={() => setOpen(false)}
        onSend={handleSend}
        isSending={isSending}
        email={email}
        setEmail={setEmail}
        ui={ui}
      />
      {success && <div className="text-green-600 text-sm mt-2 text-center">{success}</div>}
      {error && <div className="text-red-600 text-sm mt-2 text-center">{error}</div>}
    </>
  );
};

export default EmailResultButton;
