import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CurowitLogo } from './CurowitLogo';
import { MessageSquarePlus, X, Send, CheckCircle2, LifeBuoy, Sparkles, HelpCircle } from 'lucide-react';

export const RaiseTicketButton: React.FC = () => {
  const { user, showToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState<string | null>(null);

  // Form states
  const [category, setCategory] = useState('Order & Delivery Inquiry');
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState(user.email || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedTicketId = `CW-TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketSubmitted(generatedTicketId);
      setIsSubmitting(false);
      showToast(
        `Ticket #${generatedTicketId} Raised`,
        'Our Curowit creator concierge will reply to your email shortly.'
      );
    }, 600);
  };

  const handleReset = () => {
    setTicketSubmitted(null);
    setMessage('');
    setOrderId('');
    setIsOpen(false);
  };

  return (
    <>
      {/* Small & Perfect Floating Corner Trigger Button */}
      <div className="fixed bottom-18 md:bottom-6 right-3.5 sm:right-6 z-40 group select-none">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2 p-2.5 sm:px-3.5 sm:py-2.5 rounded-full bg-[#07545A] text-[#FFF8EA] shadow-lg hover:shadow-xl hover:bg-[#063F45] border border-[#F2A900]/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Raise a Support Ticket"
          title="Need help? Raise a ticket"
        >
          {/* Unique Curowit Mini Logo Emblem Mark */}
          <div className="w-6 h-6 rounded-full overflow-hidden border border-[#FFF8EA]/40 shrink-0 bg-[#FFF8EA]">
            <img
              src="/curowit-logo.jpg"
              alt="Curowit"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <span className="hidden sm:inline text-xs font-semibold tracking-wide pr-1">
            Raise Ticket
          </span>

          {/* Tiny Golden Sparkle Badge */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#F2A900] text-[#07545A] flex items-center justify-center text-[9px] font-black shadow-xs">
            ✦
          </span>
        </button>
      </div>

      {/* Raise Ticket Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFF8EA] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#07545A]/20 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {ticketSubmitted ? (
              /* Success confirmation state */
              <div className="relative text-center py-6">
                <button
                  onClick={handleReset}
                  className="absolute -top-2 -right-2 sm:top-0 sm:right-0 w-8 h-8 rounded-full bg-[#07545A]/10 hover:bg-[#07545A]/20 text-[#07545A] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-14 h-14 rounded-full bg-[#3F704B]/15 text-[#3F704B] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#07545A] font-display mb-1">
                  Ticket #{ticketSubmitted} Created!
                </h3>
                <p className="text-xs text-[#173B3D]/75 max-w-xs mx-auto mb-6">
                  Thank you for reaching out. Our support team and artisan concierge will review your request and get back to you within 2 hours.
                </p>
                <div className="bg-[#F7EBD7] p-3.5 rounded-2xl text-xs text-[#07545A] font-medium mb-6">
                  Confirmation sent to <strong className="text-[#173B3D]">{email || 'your email'}</strong>
                </div>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-semibold hover:bg-[#063F45] cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Ticket Form */
              <div>
                {/* Header Lockup with Dedicated Non-Overlapping Cross Button */}
                <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-[#07545A]/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#07545A]/20 shrink-0">
                      <img
                        src="/curowit-logo.jpg"
                        alt="Curowit"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-[#07545A] font-display leading-tight">
                        Curowit Care & Helpdesk
                      </h2>
                      <p className="text-xs text-[#687778] line-clamp-1">
                        Raise a support ticket for orders, makers, or general help
                      </p>
                    </div>
                  </div>

                  {/* Clean Non-Overlapping Close Cross Button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#07545A]/10 hover:bg-[#07545A]/20 text-[#07545A] flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label className="text-xs font-bold text-[#173B3D] block mb-1">
                      Issue Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/15 text-[#173B3D] focus:outline-none focus:ring-1 focus:ring-[#07545A]"
                    >
                      <option>Order & Delivery Inquiry</option>
                      <option>Custom Personalization Help</option>
                      <option>Creator / Artisan Question</option>
                      <option>Damaged Parcel / Replacement</option>
                      <option>Payment & Refund Assistance</option>
                      <option>General Craft Query</option>
                    </select>
                  </div>

                  {/* Order ID (Optional) */}
                  <div>
                    <label className="text-xs font-bold text-[#173B3D] block mb-1">
                      Order Reference ID <span className="text-[10px] text-[#687778] font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. CW-8924"
                      className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/15 text-[#173B3D] placeholder:text-[#687778] focus:outline-none focus:ring-1 focus:ring-[#07545A]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold text-[#173B3D] block mb-1">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/15 text-[#173B3D] placeholder:text-[#687778] focus:outline-none focus:ring-1 focus:ring-[#07545A]"
                    />
                  </div>

                  {/* Message Description */}
                  <div>
                    <label className="text-xs font-bold text-[#173B3D] block mb-1">
                      How can we assist you?
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your question, request, or issue with as much detail as possible..."
                      className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/15 text-[#173B3D] placeholder:text-[#687778] focus:outline-none focus:ring-1 focus:ring-[#07545A]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#687778] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#F2A900]" />
                      <span>Average response: &lt; 2 hrs</span>
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-bold hover:bg-[#063F45] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50 active:scale-95"
                    >
                      <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
