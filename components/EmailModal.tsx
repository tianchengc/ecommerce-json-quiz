"use client";
import React from "react";

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  onSend: () => void;
  isSending: boolean;
  email: string;
  setEmail: (email: string) => void;
  ui: any;
}

const EmailModal: React.FC<EmailModalProps> = ({
  open,
  onClose,
  onSend,
  isSending,
  email,
  setEmail,
  ui
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 p-4 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-5 sm:p-8 shadow-lg max-w-md w-full">
        <h2 className="text-lg sm:text-xl font-bold mb-2">{ui?.modalTitle}</h2>
        <p className="mb-4 text-sm sm:text-base text-[#4b5563]">{ui?.modalDescription}</p>
        <input
          type="email"
          placeholder={ui?.emailPlaceholder}
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-[#e5e5e5] rounded px-3 sm:px-4 py-2 mb-4 text-sm sm:text-base"
          disabled={isSending}
        />
        <button
          className="bg-[#bfa16b] text-white text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium shadow hover:bg-[#a88c5b] transition w-full"
          onClick={onSend}
          disabled={isSending}
        >
          {isSending ? ui?.sendingText : ui?.sendButton}
        </button>
        <button
          className="mt-4 text-sm text-[#bfa16b] underline"
          onClick={onClose}
          disabled={isSending}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EmailModal;
