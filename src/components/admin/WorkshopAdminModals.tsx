import React, { useState } from 'react';
import { Workshop } from '../../data/mockData';
import { BookedWorkshop } from '../../context/StoreContext';
import { cloudinaryService } from '../../services/cloudinaryService';
import {
  Calendar,
  Clock,
  Video,
  ExternalLink,
  Eye,
  Users,
  Edit2,
  Copy,
  Check,
  Share2,
  Search,
  Download,
  Plus,
  Mail,
  Phone,
  Upload,
  X,
  Sparkles,
  MapPin,
} from 'lucide-react';

// ========================================================
// WORKSHOP DETAILS & ATTENDEE ROSTER MODAL ("Share Who Booked & Show Link")
// ========================================================
export interface WorkshopDetailsModalProps {
  workshop: Workshop;
  attendees: BookedWorkshop[];
  onClose: () => void;
  onEditWorkshop?: (workshop: Workshop) => void;
  onUpdateMeetingDetails: (
    workshopId: string,
    meetingLink: string,
    meetingNotes?: string,
    platform?: 'Google Meet' | 'Zoom' | 'Studio Offline'
  ) => void;
  onUpdateBookingStatus: (bookingId: string, status: 'Confirmed' | 'Completed' | 'Cancelled') => void;
  onAddTestBooking: (workshop: Workshop) => void;
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export const WorkshopDetailsModal: React.FC<WorkshopDetailsModalProps> = ({
  workshop,
  attendees,
  onClose,
  onEditWorkshop,
  onUpdateMeetingDetails,
  onUpdateBookingStatus,
  onAddTestBooking,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'meeting'>('overview');
  const [meetingLink, setMeetingLink] = useState(workshop.meetingLink || '');
  const [meetingPlatform, setMeetingPlatform] = useState<'Google Meet' | 'Zoom' | 'Studio Offline'>(
    (workshop.meetingPlatform as 'Google Meet' | 'Zoom' | 'Studio Offline') ||
      (workshop.format === 'Studio Offline' ? 'Studio Offline' : 'Google Meet')
  );
  const [meetingNotes, setMeetingNotes] = useState(workshop.meetingNotes || '');
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isCopiedBuyerLink, setIsCopiedBuyerLink] = useState(false);
  const [isCopiedRoster, setIsCopiedRoster] = useState(false);
  const [isCopiedEmails, setIsCopiedEmails] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Confirmed' | 'Completed' | 'Cancelled'>('all');

  const buyerBookingUrl = `${window.location.origin}/?view=workshops&workshop=${workshop.id}`;
  const currentLink = meetingLink.trim() || workshop.meetingLink || '';

  // Copy Direct Buyer Booking Link
  const handleCopyBuyerLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(buyerBookingUrl);
      }
      setIsCopiedBuyerLink(true);
      setTimeout(() => setIsCopiedBuyerLink(false), 2500);
      showToast('Buyer Booking Link Copied!', 'Share this URL with buyers to book spots: ' + buyerBookingUrl, 'success');
    } catch {
      showToast('Buyer Link Ready', buyerBookingUrl, 'info');
    }
  };

  // Share Formatted Buyer Invite on WhatsApp / Social
  const handleShareBuyerInvite = async () => {
    const inviteText = `🎨 Reserve your spot for "${workshop.title}" hosted by ${workshop.creatorName} on Curowit!
📅 Date & Time: ${workshop.date} at ${workshop.time} (${workshop.duration})
🎟️ Ticket Fee: ₹${workshop.price} (${workshop.seatsLeft} seats left)
🔗 Book Your Spot Online: ${buyerBookingUrl}

Curowit — Home of Handcrafted Treasures`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Workshop: ${workshop.title}`,
          text: inviteText,
          url: buyerBookingUrl,
        });
        showToast('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(inviteText);
        showToast('Buyer Invite Copied!', 'Invitation text copied for WhatsApp/Email sharing.', 'success');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        await navigator.clipboard.writeText(inviteText);
        showToast('Buyer Invite Copied!');
      }
    }
  };

  // Email Meeting Link to all registered buyers
  const handleEmailAttendeesMeetingLink = () => {
    const emails = attendees.map((a) => a.userEmail?.trim()).filter(Boolean) as string[];
    if (emails.length === 0) {
      showToast('No Buyer Emails', 'No registered attendees with email addresses found.', 'info');
      return;
    }
    const bccList = Array.from(new Set(emails)).join(',');
    const subject = encodeURIComponent(`Live Workshop Access Link: ${workshop.title}`);
    const body = encodeURIComponent(`Hello Artisan Learner,

Thank you for booking "${workshop.title}" hosted by ${workshop.creatorName}!

Here are your live session access details:
📅 Date & Time: ${workshop.date} at ${workshop.time} (${workshop.duration})
🔗 Master Session Link: ${meetingLink.trim() || workshop.meetingLink || 'Link will be active before session starts'}
📝 Preparation & Notes: ${meetingNotes.trim() || workshop.meetingNotes || 'Please join 5 minutes early with your creative materials ready.'}

Looking forward to creating together!
Curowit Workshops Team
${buyerBookingUrl}`);

    window.open(`mailto:?bcc=${bccList}&subject=${subject}&body=${body}`, '_blank');
  };

  const filteredAttendees = attendees.filter((a) => {
    const term = attendeeSearch.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (a.userName || '').toLowerCase().includes(term) ||
      (a.userEmail || '').toLowerCase().includes(term) ||
      (a.userPhone || '').includes(term) ||
      (a.id || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = attendees.reduce((sum, a) => sum + (a.price || workshop.price), 0);
  const confirmedAttendees = attendees.filter((a) => a.status !== 'Cancelled');

  // Copy Meeting Link
  const handleCopyMeetingLink = async () => {
    if (!currentLink) {
      showToast('No Meeting Link', 'Please configure a master meeting link below.', 'error');
      return;
    }
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentLink);
      }
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2500);
      showToast('Master Meeting Link Copied!', currentLink);
    } catch {
      showToast('Meeting Link Ready', currentLink);
    }
  };

  // Copy Who Booked (Roster)
  const handleCopyRoster = async () => {
    if (attendees.length === 0) {
      showToast('No Attendees', 'No customers have booked this workshop yet.', 'info');
      return;
    }

    const rosterText = `=== Workshop Attendees Roster ===
Workshop: ${workshop.title}
Host Maker: ${workshop.creatorName}
Date: ${workshop.date} at ${workshop.time}
Total Registered: ${attendees.length} (${confirmedAttendees.length} Confirmed)
Master Session Link: ${workshop.meetingLink || 'Pending setup'}

Enrolled Patrons:
${attendees
  .map(
    (a, idx) =>
      `${idx + 1}. ${a.userName || 'Artisan Learner'} | Email: ${a.userEmail || 'N/A'} | Phone: ${a.userPhone || 'N/A'} | Ref: ${a.id} | Booked: ${a.bookedAt} | Status: ${a.status} | Payment: ${a.paymentId || 'Verified'}`
  )
  .join('\n')}

Curowit Realtime Database Admin Export`;

    try {
      await navigator.clipboard.writeText(rosterText);
      setIsCopiedRoster(true);
      setTimeout(() => setIsCopiedRoster(false), 2500);
      showToast('Attendee Roster Copied!', `${attendees.length} attendees copied to clipboard.`, 'success');
    } catch {
      showToast('Copy Error', 'Please select text manually.', 'error');
    }
  };

  // Copy All Emails
  const handleCopyEmails = async () => {
    const emails = attendees.map((a) => a.userEmail?.trim()).filter(Boolean);
    if (emails.length === 0) {
      showToast('No Emails Found', 'None of the registered attendees have an email on record.', 'info');
      return;
    }
    const emailList = Array.from(new Set(emails)).join(', ');
    try {
      await navigator.clipboard.writeText(emailList);
      setIsCopiedEmails(true);
      setTimeout(() => setIsCopiedEmails(false), 2500);
      showToast('Attendee Emails Copied!', `${emails.length} emails copied.`, 'success');
    } catch {
      showToast('Email List Ready', emailList);
    }
  };

  // Export CSV Spreadsheet
  const handleExportCSV = () => {
    if (attendees.length === 0) {
      showToast('No Data', 'No attendee records to export.', 'info');
      return;
    }

    const headers = ['Booking ID', 'Customer Name', 'Email', 'Phone', 'Booked Date', 'Status', 'Payment ID', 'Fee'];
    const rows = attendees.map((a) => [
      `"${a.id}"`,
      `"${a.userName || ''}"`,
      `"${a.userEmail || ''}"`,
      `"${a.userPhone || ''}"`,
      `"${a.bookedAt || ''}"`,
      `"${a.status || 'Confirmed'}"`,
      `"${a.paymentId || ''}"`,
      `"${a.price || workshop.price}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workshop-${workshop.id}-attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Exported', `Downloaded attendee roster for "${workshop.title}".`);
  };

  // Save Master Meeting Link
  const handleSaveMeetingLink = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMeetingDetails(workshop.id, meetingLink.trim(), meetingNotes.trim(), meetingPlatform);
    showToast('Meeting Link Saved & Broadcasted', 'Master link updated for workshop and all attendees.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF7] rounded-3xl border-2 border-[#07545A]/25 max-w-4xl w-full shadow-2xl my-auto text-xs max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#07545A]/12 shrink-0 bg-[#FFFDF7] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={workshop.image}
              alt={workshop.title}
              className="w-14 h-12 sm:w-16 sm:h-14 rounded-2xl object-cover border border-[#07545A]/20 bg-white shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3F704B] bg-[#FFF8EA] px-2 py-0.5 rounded-full border border-[#07545A]/15">
                  {workshop.format}
                </span>
                <span className="text-[11px] font-extrabold text-[#07545A]">
                  ₹{workshop.price} / seat
                </span>
                <span className="text-[11px] text-[#687778]">
                  Hosted by {workshop.creatorName}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#07545A] font-display truncate">
                {workshop.title}
              </h3>
              <p className="text-[11px] text-[#173B3D]/70 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#07545A]" />
                  {workshop.date} · {workshop.time}
                </span>
                <span>·</span>
                <span>{workshop.duration}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyBuyerLink}
              className={`px-2.5 py-1.5 rounded-xl font-bold text-xs hidden sm:flex items-center gap-1.5 transition-all cursor-pointer border ${
                isCopiedBuyerLink
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-[#07545A] hover:bg-[#07545A]/10 border-[#07545A]/25'
              }`}
              title="Copy public buyer booking link"
            >
              {isCopiedBuyerLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopiedBuyerLink ? 'Copied' : 'Copy Buyer Link'}</span>
            </button>

            {onEditWorkshop && (
              <button
                type="button"
                onClick={() => onEditWorkshop(workshop)}
                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-[#07545A] text-[#FFF8EA] hover:bg-[#063F45] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Edit workshop title, image, fee, schedule, seats, or description"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#F2A900]" />
                <span>Edit Workshop</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-[#173B3D]/60 hover:text-[#07545A] hover:bg-[#07545A]/10 rounded-full transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#07545A]/15 px-4 sm:px-5 shrink-0 bg-[#FFFDF7]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-[#07545A] text-[#07545A]'
                : 'border-transparent text-[#173B3D]/70 hover:text-[#07545A]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Full Workshop Overview & Details</span>
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'roster'
                ? 'border-[#07545A] text-[#07545A]'
                : 'border-transparent text-[#173B3D]/70 hover:text-[#07545A]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Who Booked & Attendees ({attendees.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('meeting')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'meeting'
                ? 'border-[#07545A] text-[#07545A]'
                : 'border-transparent text-[#173B3D]/70 hover:text-[#07545A]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Linkediting: Update Live Meeting URL</span>
          </button>
        </div>

        {/* Tab 1: Full Workshop Overview & Dossier (GORGEOUS, COMPLETE, UNSQUISHED) */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
            {/* Workshop Hero Visual Card */}
            <div className="bg-[#FFF8EA] p-4 sm:p-6 rounded-3xl border border-[#07545A]/15 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                <div className="md:col-span-5 rounded-2xl overflow-hidden aspect-16/10 bg-stone-200 border border-[#07545A]/20 shadow-xs relative">
                  <img
                    src={workshop.image}
                    alt={workshop.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#FFF8EA]/95 backdrop-blur-xs text-[#07545A] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#07545A]/15 shadow-2xs">
                    {workshop.format}
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-[#07545A] text-[#FFF8EA] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                    {workshop.seatsLeft} seats remaining
                  </div>
                </div>

                <div className="md:col-span-7 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#07545A] bg-[#07545A]/10 px-3 py-1 rounded-full">
                      ₹{workshop.price} / attendee
                    </span>
                    <span className="text-xs font-bold text-[#3F704B] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      {workshop.format}
                    </span>
                    <span className="text-xs font-bold text-[#E97868] bg-[#E97868]/10 px-3 py-1 rounded-full">
                      {workshop.seatsLeft} seats left
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-[#07545A] font-display leading-snug">
                    {workshop.title}
                  </h2>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#173B3D]/80">
                    <span className="w-6 h-6 rounded-full bg-[#07545A] text-[#FFF8EA] flex items-center justify-center font-bold text-[10px]">
                      {workshop.creatorName.charAt(0).toUpperCase()}
                    </span>
                    <span>Taught by <strong className="text-[#07545A]">{workshop.creatorName}</strong></span>
                  </div>

                  <p className="text-xs text-[#173B3D]/85 leading-relaxed whitespace-pre-wrap bg-white p-3.5 rounded-2xl border border-[#07545A]/15">
                    {workshop.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Complete Workshop Specification Grid */}
              <div className="p-4 bg-white rounded-2xl border border-[#07545A]/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#687778] block text-[10px] uppercase font-bold mb-0.5">Instructor</span>
                  <span className="font-bold text-[#07545A]">{workshop.creatorName}</span>
                </div>
                <div>
                  <span className="text-[#687778] block text-[10px] uppercase font-bold mb-0.5">Date & Time</span>
                  <span className="font-bold text-[#07545A]">{workshop.date} · {workshop.time}</span>
                </div>
                <div>
                  <span className="text-[#687778] block text-[10px] uppercase font-bold mb-0.5">Duration</span>
                  <span className="font-bold text-[#07545A]">{workshop.duration}</span>
                </div>
                <div>
                  <span className="text-[#687778] block text-[10px] uppercase font-bold mb-0.5">Platform / Location</span>
                  <span className="font-bold text-[#07545A]">{workshop.location || workshop.meetingPlatform || 'Google Meet'}</span>
                </div>
              </div>

              {/* Public Buyer Booking URL Command Card */}
              <div className="bg-gradient-to-br from-[#FFFDF7] to-white p-4 rounded-2xl border-2 border-[#07545A]/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[#07545A] text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
                    <span>Public Buyer Booking Link</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    Active Storefront URL
                  </span>
                </div>
                <p className="text-[11px] text-[#173B3D]/70">
                  Buyers can visit this link directly to read curriculum details and reserve their spots.
                </p>

                <div className="p-2.5 bg-[#FFF8EA] rounded-xl border border-[#07545A]/20 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[#07545A] font-bold truncate select-all">
                    {buyerBookingUrl}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyBuyerLink}
                    className="px-3.5 py-1.5 bg-[#07545A] text-[#FFF8EA] hover:bg-[#063F45] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Buyer Link</span>
                  </button>

                  <a
                    href={buyerBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white text-[#07545A] hover:bg-[#07545A]/10 border border-[#07545A]/20 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Store Link</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleShareBuyerInvite}
                    className="px-3 py-1.5 bg-white text-[#07545A] hover:bg-[#07545A]/10 border border-[#07545A]/20 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share WhatsApp Invite</span>
                  </button>
                </div>
              </div>

              {/* Master Session Meeting Access Link Card */}
              <div className="bg-white p-4 rounded-2xl border border-[#07545A]/15 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[#07545A] text-xs">
                    <Video className="w-3.5 h-3.5 text-[#07545A]" />
                    <span>Master Session Access Credentials</span>
                  </div>
                  <span className="text-[10px] text-[#687778]">
                    Platform: <strong className="text-[#07545A]">{workshop.meetingPlatform || 'Google Meet'}</strong>
                  </span>
                </div>

                <div className="p-2.5 bg-[#FFF8EA] rounded-xl border border-[#07545A]/15 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[#07545A] font-medium truncate select-all">
                    {workshop.meetingLink || 'No master meeting link configured yet.'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('meeting')}
                    className="px-2.5 py-1 bg-white hover:bg-[#07545A]/10 text-[#07545A] rounded-lg border border-[#07545A]/20 font-bold text-[11px] shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Link</span>
                  </button>
                </div>

                {workshop.meetingNotes && (
                  <p className="text-[11px] text-[#173B3D]/70 bg-stone-50 p-2.5 rounded-xl border border-[#07545A]/10">
                    <strong className="text-[#07545A]">Notes: </strong>{workshop.meetingNotes}
                  </p>
                )}
              </div>

              {/* Quick Jump Action to Edit Full Details */}
              {onEditWorkshop && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onEditWorkshop(workshop)}
                    className="px-5 py-2.5 bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-98"
                  >
                    <Edit2 className="w-4 h-4 text-[#F2A900]" />
                    <span>Edit All Workshop Details</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Who Booked And All (Attendee Roster) */}
        {activeTab === 'roster' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
            {/* Metric Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="bg-[#FFF8EA] p-3 rounded-2xl border border-[#07545A]/12">
                <span className="text-[10px] text-[#687778] uppercase font-bold block mb-0.5">Total Booked</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-[#07545A] font-display tabular-nums">
                    {attendees.length}
                  </span>
                  <span className="text-[10px] text-[#173B3D]/60 font-medium">patrons</span>
                </div>
              </div>

              <div className="bg-[#FFF8EA] p-3 rounded-2xl border border-[#07545A]/12">
                <span className="text-[10px] text-[#687778] uppercase font-bold block mb-0.5">Confirmed Active</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-emerald-800 font-display tabular-nums">
                    {confirmedAttendees.length}
                  </span>
                  <span className="text-[10px] text-emerald-800/80 font-medium">active</span>
                </div>
              </div>

              <div className="bg-[#FFF8EA] p-3 rounded-2xl border border-[#07545A]/12">
                <span className="text-[10px] text-[#687778] uppercase font-bold block mb-0.5">Seats Remaining</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-[#E97868] font-display tabular-nums">
                    {workshop.seatsLeft}
                  </span>
                  <span className="text-[10px] text-[#687778] font-medium">open</span>
                </div>
              </div>

              <div className="bg-[#FFF8EA] p-3 rounded-2xl border border-[#07545A]/12">
                <span className="text-[10px] text-[#687778] uppercase font-bold block mb-0.5">Total Revenue</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-[#07545A] font-display tabular-nums">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Toolbar for Sharing and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#FFF8EA] p-3 rounded-2xl border border-[#07545A]/12">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#173B3D]/50" />
                  <input
                    type="text"
                    placeholder="Search attendee by name, email, phone, or ID..."
                    value={attendeeSearch}
                    onChange={(e) => setAttendeeSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#07545A]/20 rounded-xl outline-none text-xs"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-white border border-[#07545A]/20 rounded-xl outline-none text-xs font-semibold shrink-0"
                >
                  <option value="all">All Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Action Buttons: "Share Who Booked And All" */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyRoster}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    isCopiedRoster
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#07545A] text-[#FFF8EA] hover:bg-[#063F45]'
                  }`}
                  title="Copy full attendee roster text to clipboard to share"
                >
                  {isCopiedRoster ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Roster Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Who Booked</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyEmails}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-xs bg-white text-[#07545A] hover:bg-[#07545A]/10 border border-[#07545A]/25 flex items-center gap-1.5 transition-all cursor-pointer ${
                    isCopiedEmails ? 'text-emerald-700 border-emerald-400' : ''
                  }`}
                  title="Copy all attendee emails separated by comma"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isCopiedEmails ? 'Emails Copied!' : 'Copy Emails'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-2.5 py-1.5 rounded-xl font-bold text-xs bg-white text-[#07545A] hover:bg-[#07545A]/10 border border-[#07545A]/25 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Download attendees CSV spreadsheet"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Attendees List / Table */}
            {filteredAttendees.length === 0 ? (
              <div className="text-center py-10 bg-[#FFF8EA]/50 rounded-2xl border border-dashed border-[#07545A]/20 p-6">
                <Users className="w-10 h-10 text-[#07545A]/40 mx-auto mb-2" />
                <h4 className="font-bold text-[#07545A] text-sm mb-1">
                  {attendees.length === 0 ? 'No Patrons Have Booked Yet' : 'No Attendees Match Filter'}
                </h4>
                <p className="text-xs text-[#173B3D]/70 max-w-sm mx-auto mb-4">
                  {attendees.length === 0
                    ? 'When patrons reserve seats on the store, their booking details and contacts will automatically show here in real time.'
                    : 'Try clearing your search term or status filter.'}
                </p>
                {attendees.length === 0 && (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => onAddTestBooking(workshop)}
                      className="px-4 py-2 bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Demo Booking</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyBuyerLink}
                      className="px-4 py-2 bg-white text-[#07545A] hover:bg-[#07545A]/10 font-bold border border-[#07545A]/20 rounded-xl cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Workshop Public Link</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-[#07545A]/15 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#FFF8EA] text-[#07545A] border-b border-[#07545A]/15 uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Attendee Name</th>
                        <th className="p-3">Contact Details</th>
                        <th className="p-3">Booking Ref</th>
                        <th className="p-3">Booked Date</th>
                        <th className="p-3">Payment ID</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#07545A]/10 bg-white">
                      {filteredAttendees.map((b) => (
                        <tr key={b.id} className="hover:bg-[#FFF8EA]/40 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-full bg-[#07545A] text-[#FFF8EA] font-bold flex items-center justify-center text-[11px] shrink-0">
                                {(b.userName || 'U').charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <span className="font-bold text-[#173B3D] block text-xs">
                                  {b.userName || 'Anonymous Patron'}
                                </span>
                                <span className="text-[10px] text-[#687778]">
                                  Fee: ₹{b.price || workshop.price}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="space-y-0.5">
                              {b.userEmail ? (
                                <a
                                  href={`mailto:${b.userEmail}`}
                                  className="text-[#07545A] hover:underline flex items-center gap-1 text-[11px] font-medium"
                                >
                                  <Mail className="w-3 h-3 text-[#07545A]/70 shrink-0" />
                                  <span className="truncate max-w-[170px]">{b.userEmail}</span>
                                </a>
                              ) : (
                                <span className="text-[#687778] italic text-[10px]">No email</span>
                              )}
                              {b.userPhone && (
                                <a
                                  href={`tel:${b.userPhone}`}
                                  className="text-[#173B3D]/80 hover:text-[#07545A] flex items-center gap-1 text-[10px]"
                                >
                                  <Phone className="w-3 h-3 text-[#173B3D]/50 shrink-0" />
                                  <span>{b.userPhone}</span>
                                </a>
                              )}
                            </div>
                          </td>

                          <td className="p-3 font-mono font-bold text-[#07545A] text-[11px]">
                            {b.id}
                          </td>

                          <td className="p-3 text-[#173B3D]/80 text-[11px] whitespace-nowrap">
                            {b.bookedAt || 'Recently'}
                          </td>

                          <td className="p-3">
                            <span className="font-mono text-[10px] text-[#687778] bg-[#FFF8EA] px-2 py-0.5 rounded border border-[#07545A]/10">
                              {b.paymentId ? b.paymentId.slice(0, 14) : 'Online Confirmed'}
                            </span>
                          </td>

                          <td className="p-3">
                            <select
                              value={b.status}
                              onChange={(e) => onUpdateBookingStatus(b.id, e.target.value as any)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                                b.status === 'Confirmed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : b.status === 'Completed'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-red-50 text-red-800 border-red-300'
                              }`}
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Update Master Meeting Link & Instructions */}
        {activeTab === 'meeting' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
            {/* Live Access Link Status Card */}
            <div className="bg-gradient-to-br from-[#FFF8EA] to-[#F7EBD7] border-2 border-[#07545A]/25 p-4 rounded-2xl flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#07545A] text-[#FFF8EA] flex items-center justify-center shrink-0">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#07545A] text-xs">
                      Live Session Access Link
                    </h4>
                    <span className="text-[10px] text-[#687778]">
                      Platform: <strong className="text-[#07545A]">{meetingPlatform}</strong>
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    currentLink
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {currentLink ? 'Link Configured' : 'Needs Setup'}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-[#07545A]/20 flex items-center justify-between gap-2 mb-3">
                <span className="font-mono text-xs text-[#07545A] font-bold truncate select-all">
                  {currentLink || 'No meeting URL configured yet. Enter below.'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyMeetingLink}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    isCopiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#07545A] text-[#FFF8EA] hover:bg-[#063F45]'
                  }`}
                >
                  {isCopiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedLink ? 'Copied!' : 'Copy Meet Link'}</span>
                </button>

                {currentLink && currentLink.startsWith('http') && (
                  <a
                    href={currentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-white text-[#07545A] hover:bg-[#07545A]/10 border border-[#07545A]/25 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test Open Meet</span>
                  </a>
                )}

                {attendees.length > 0 && currentLink && (
                  <button
                    type="button"
                    onClick={handleEmailAttendeesMeetingLink}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Email All {attendees.length} Buyers</span>
                  </button>
                )}
              </div>
            </div>

            {/* Form to update meeting URL */}
            <form onSubmit={handleSaveMeetingLink} className="space-y-4 bg-[#FFF8EA] p-5 rounded-2xl border border-[#07545A]/15">
              <div>
                <h4 className="font-bold text-[#07545A] text-sm mb-1">
                  Configure Master Workshop Link & Preparation Notes
                </h4>
                <p className="text-xs text-[#173B3D]/70 mb-4">
                  Changes made here update the workshop’s master meeting credentials and broadcast to all enrolled patrons' profile dashboards live.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#07545A] block mb-1">Session Platform</label>
                  <select
                    value={meetingPlatform}
                    onChange={(e) => setMeetingPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl outline-none font-semibold text-xs"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Studio Offline">Studio Offline</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-[#07545A] block mb-1">
                    Meeting URL / Access Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    required={meetingPlatform !== 'Studio Offline'}
                    className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#07545A] block mb-1">
                  Preparation Instructions & Meeting Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Please join 5 minutes early. Materials needed: 3.5mm hook, cotton yarn, stitch markers."
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl outline-none text-xs"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-[#687778]">
                  Enrolled attendees will immediately see this updated link in their patron account.
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Video className="w-3.5 h-3.5 text-[#F2A900]" />
                  <span>Save & Broadcast Link</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#07545A]/10 bg-[#FFF8EA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-[#687778]">
              Workshop ID: <code className="font-mono text-[#07545A] font-bold">{workshop.id}</code>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-emerald-800">Realtime Synced</span>
          </div>

          <div className="flex items-center gap-2">
            {onEditWorkshop && (
              <button
                type="button"
                onClick={() => onEditWorkshop(workshop)}
                className="px-3.5 py-1.5 font-bold text-xs bg-white text-[#07545A] border border-[#07545A]/25 hover:bg-[#07545A]/10 rounded-xl cursor-pointer flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Workshop</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 font-bold text-xs bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] rounded-xl cursor-pointer shadow-2xs"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// REUSABLE WORKSHOP EDIT / ADD MODAL COMPONENT (EFFORTLESS SMOOTH SCROLLING)
// ========================================================
export interface WorkshopEditModalProps {
  workshop?: Workshop;
  isNew?: boolean;
  onClose: () => void;
  onSave: (ws: any) => void;
}

export const WorkshopEditModal: React.FC<WorkshopEditModalProps> = ({
  workshop,
  isNew = false,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(workshop?.title || '');
  const [creatorName, setCreatorName] = useState(workshop?.creatorName || 'Siya Sharma');
  const [date, setDate] = useState(workshop?.date || 'Sat, 10 Oct 2026');
  const [time, setTime] = useState(workshop?.time || '4:00 PM - 6:00 PM IST');
  const [duration, setDuration] = useState(workshop?.duration || '2 Hours');
  const [format, setFormat] = useState<'Live Online' | 'Studio Offline'>(workshop?.format || 'Live Online');
  const [location, setLocation] = useState(workshop?.location || '');
  const [price, setPrice] = useState(workshop?.price || 899);
  const [seatsLeft, setSeatsLeft] = useState(workshop?.seatsLeft || 8);
  const [image, setImage] = useState(workshop?.image || '/images/hero_handmade_1790260978568.jpg');
  const [description, setDescription] = useState(workshop?.description || '');
  const [meetingLink, setMeetingLink] = useState(workshop?.meetingLink || '');
  const [meetingPlatform, setMeetingPlatform] = useState<'Google Meet' | 'Zoom' | 'Studio Offline'>(
    workshop?.meetingPlatform || (workshop?.format === 'Studio Offline' ? 'Studio Offline' : 'Google Meet')
  );
  const [meetingNotes, setMeetingNotes] = useState(workshop?.meetingNotes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      creatorName: creatorName.trim(),
      date: date.trim(),
      time: time.trim(),
      duration: duration.trim(),
      format,
      location: format === 'Studio Offline' ? location.trim() : undefined,
      price: Number(price),
      seatsLeft: Number(seatsLeft),
      image,
      description: description.trim(),
      meetingLink: meetingLink.trim(),
      meetingPlatform,
      meetingNotes: meetingNotes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF7] rounded-3xl border-2 border-[#07545A]/25 max-w-xl w-full shadow-2xl text-xs max-h-[90vh] flex flex-col overflow-hidden my-auto">
        {/* Sticky Fixed Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#07545A]/15 shrink-0 bg-[#FFFDF7]">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#07545A] font-display">
              {isNew ? 'Schedule New Workshop' : 'Edit Workshop Details'}
            </h3>
            <p className="text-[11px] text-[#173B3D]/70">
              {isNew ? 'Publish a live cohort session for buyers' : `Editing Workshop ID: ${workshop?.id || ''}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#173B3D]/60 hover:text-[#07545A] hover:bg-[#07545A]/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close edit modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dedicated Smooth Scrollable Form Body */}
        <form id="workshop-edit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 overscroll-contain">
          {/* Cover Image */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#07545A]">Workshop Cover Image</label>
              <label className="inline-flex items-center gap-1 text-[11px] font-bold text-[#07545A] hover:text-[#064247] cursor-pointer bg-[#07545A]/5 px-2.5 py-1 rounded-lg border border-[#07545A]/15 transition-colors">
                <Upload className="w-3 h-3 text-[#F2A900]" />
                <span>Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) {
                      try {
                        const res = await cloudinaryService.uploadFile(file, { folder: 'curowit-workshops' });
                        setImage(res.url);
                      } catch {}
                    }
                  }}
                />
              </label>
            </div>
            <div className="flex gap-3 items-center">
              <img
                src={image}
                alt="Workshop preview"
                className="w-16 h-12 object-cover rounded-xl border border-[#07545A]/20 bg-white shrink-0 shadow-2xs"
              />
              <input
                type="text"
                value={image.startsWith('data:') ? '(Uploaded Device Image)' : image}
                onChange={(e) => setImage(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Workshop Title */}
          <div>
            <label className="font-bold text-[#07545A] block mb-1">Workshop Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Hand-Built Studio Ceramics & Pinch Pottery"
              className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-bold text-xs"
            />
          </div>

          {/* Instructor & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Instructor / Artisan</label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-[#07545A] block mb-1">Session Format</label>
              <select
                value={format}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setFormat(val);
                  if (val === 'Studio Offline' && meetingPlatform === 'Google Meet') {
                    setMeetingPlatform('Studio Offline');
                  }
                }}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-semibold text-xs"
              >
                <option value="Live Online">Live Online</option>
                <option value="Studio Offline">Studio Offline</option>
              </select>
            </div>
          </div>

          {/* Location (If Studio Offline) */}
          {format === 'Studio Offline' && (
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Physical Studio Location / Address</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Indiranagar Craft Studio, Bengaluru"
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none text-xs"
              />
            </div>
          )}

          {/* Fee, Seats, Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Fee (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                min={0}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-bold text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-[#07545A] block mb-1">Seats Open</label>
              <input
                type="number"
                value={seatsLeft}
                onChange={(e) => setSeatsLeft(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-[#07545A] block mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2.5 Hours"
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none text-xs"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Saturday, Oct 12"
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 4:00 PM – 6:00 PM IST"
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none text-xs"
              />
            </div>
          </div>

          {/* Master Meeting Link Configuration */}
          <div className="p-3.5 bg-[#FFF8EA] rounded-2xl border border-[#07545A]/15 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-[#07545A]">
              <Video className="w-3.5 h-3.5" />
              <span>Session Access Credentials (Live to All Attendees)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="font-medium text-[#687778] block mb-1 text-[11px]">Platform</label>
                <select
                  value={meetingPlatform}
                  onChange={(e) => setMeetingPlatform(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#07545A]/20 rounded-xl outline-none font-semibold text-xs"
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Studio Offline">Studio Offline</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="font-medium text-[#687778] block mb-1 text-[11px]">Meeting URL / Access Link</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-uvw-rst"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#07545A]/20 rounded-xl outline-none font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-[#687778] block mb-1 text-[11px]">Preparation Notes & Instructions</label>
              <input
                type="text"
                placeholder="e.g. Please join 5 mins early with craft kit ready"
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#07545A]/20 rounded-xl outline-none text-xs"
              />
            </div>
          </div>

          {/* Experience Description */}
          <div>
            <label className="font-bold text-[#07545A] block mb-1">Experience Description & Curriculum</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the skills taught, materials included, and who this workshop is for..."
              className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none text-xs leading-relaxed"
            />
          </div>
        </form>

        {/* Sticky Fixed Footer */}
        <div className="p-4 sm:p-5 border-t border-[#07545A]/15 bg-[#FFF8EA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] text-[#687778]">Live sync active</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-[#173B3D]/70 hover:bg-[#07545A]/10 rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="workshop-edit-form"
              className="px-5 py-2 bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-transform active:scale-98"
            >
              <Check className="w-4 h-4 text-[#F2A900]" />
              <span>{isNew ? 'Publish Workshop' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
