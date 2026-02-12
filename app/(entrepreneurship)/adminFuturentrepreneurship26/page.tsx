'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Download, Search, Filter, Eye, Trash2, AlertTriangle, Mail, Send, 
  CheckCircle, XCircle, Loader2, RefreshCw, FileText, Building2, DollarSign, Users,
  TrendingUp, Clock
} from 'lucide-react';

// ────────────────────────────────────────────────
// Types (combined & complete)
// ────────────────────────────────────────────────
interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  areaOfInterest: string;
  category: string;
  categoryName: string;
  price: string;
  registrationId: string;
  createdAt: Timestamp;
  paymentStatus: string;
  paymentReference: string | null;
  paymentMethod: string | null;
  updatedAt: Timestamp;
  emailSent?: boolean;
  emailSentAt?: Timestamp;
  confirmedBy?: 'webhook' | 'admin';
  manualConfirmation?: boolean;
}

interface PitchDeck {
  id: string;
  registrationId: string;
  fullName: string;
  email: string;
  category: string;
  businessName: string;
  businessDescription: string;
  problemStatement?: string;
  solution?: string;
  targetMarket?: string;
  revenueModel?: string;
  fundingNeeds: string;
  teamSize: string;
  pitchDeckUrl: string;
  pitchDeckFileName: string;
  cloudinaryPublicId: string;
  fileSize?: number;
  fileType?: string;
  fileFormat?: string;
  submissionDate: Timestamp;
  status: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ────────────────────────────────────────────────
// Helper Functions
// ────────────────────────────────────────────────
function downloadCSV(csv: string, name: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function categoryBadgeClass(name: string) {
  if (name.includes('Fully Funded')) return 'bg-emerald-100 text-emerald-800';
  if (name.includes('Partially Funded')) return 'bg-blue-100 text-blue-800';
  if (name.includes('Basic')) return 'bg-purple-100 text-purple-800';
  return 'bg-amber-100 text-amber-800';
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'completed': return 'bg-emerald-100 text-emerald-800';
    case 'pending': return 'bg-amber-100 text-amber-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'approved': return 'bg-emerald-100 text-emerald-800';
    case 'shortlisted': return 'bg-blue-100 text-blue-800';
    case 'under_review': return 'bg-amber-100 text-amber-800';
    case 'submitted': return 'bg-gray-100 text-gray-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// ────────────────────────────────────────────────
// Modals (Delete, Email, Payment)
// ────────────────────────────────────────────────
function DeleteModal({ 
  isOpen, onClose, onConfirm, itemType, itemName, deleting 
}: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  itemType: string; itemName: string; deleting: boolean;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this {itemType}?<br />
          <strong className="text-gray-900">{itemName}</strong><br />
          <span className="text-red-600 font-semibold">This action cannot be undone.</span>
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={deleting} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
            {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailConfirmModal({ 
  isOpen, onClose, onConfirm, registration, sending 
}: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  registration: Registration | null; sending: boolean;
}) {
  if (!isOpen || !registration) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Send Confirmation Email</h3>
        </div>
        <p className="text-gray-600 mb-4">Send confirmation email to:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-semibold">{registration.fullName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Email:</span><span className="font-semibold">{registration.email}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Reg ID:</span><span className="font-mono font-semibold text-emerald-600">{registration.registrationId}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Category:</span><span className="font-semibold">{registration.categoryName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Amount:</span><span className="font-semibold">{registration.price}</span></div>
        </div>
        {registration.emailSent && registration.emailSentAt && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800">
              ⚠️ Email previously sent on {registration.emailSentAt.toDate().toLocaleString()}
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={sending} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={sending} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
            {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Email</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentConfirmModal({ 
  isOpen, onClose, onConfirm, registration, confirming 
}: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  registration: Registration | null; confirming: boolean;
}) {
  if (!isOpen || !registration) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Confirm Payment Manually</h3>
        </div>
        <p className="text-gray-600 mb-4">Manually mark this registration as paid? This will:</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 space-y-2 text-sm">
          <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" /><span>Update status to <strong>completed</strong></span></div>
          <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" /><span>Send confirmation email</span></div>
          <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" /><span>Record admin confirmation</span></div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-semibold">{registration.fullName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Email:</span><span className="font-semibold">{registration.email}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Reg ID:</span><span className="font-mono font-semibold text-emerald-600">{registration.registrationId}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Amount:</span><span className="font-semibold">{registration.price}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className="font-semibold text-amber-600 uppercase">{registration.paymentStatus}</span></div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-800">⚠️ <strong>Important:</strong> Only confirm if payment was verified outside the system (bank transfer, cash, etc.).</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={confirming} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={confirming} className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
            {confirming ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><CheckCircle className="w-4 h-4" /> Confirm Payment</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Toast
// ────────────────────────────────────────────────
function Toast({ message, type, onClose }: { 
  message: string; type: 'success' | 'error' | 'warning' | 'info'; onClose: () => void 
}) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: 'bg-emerald-500', error: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-500' };
  const icons = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
    info: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
  };
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md`}>
        {icons[type]}<p className="font-medium">{message}</p>
        <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-1">×</button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Pagination (unchanged)
// ────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number; totalPages: number; onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); } 
  else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }
  return (
    <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 hover:bg-gray-100 transition">← Prev</button>
      {pages.map((p, i) => p === '...' ? <span key={`el-${i}`} className="px-2 text-gray-400">…</span> : (
        <button key={p} onClick={() => onPageChange(p)} className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${p === currentPage ? 'bg-emerald-600 text-white shadow' : 'border border-gray-300 hover:bg-gray-100'}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 hover:bg-gray-100 transition">Next →</button>
    </div>
  );
}

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pitchDecks, setPitchDecks] = useState<PitchDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'registrations' | 'pitchDecks'>('registrations');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterPitchStatus, setFilterPitchStatus] = useState('all');

  // Modals
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: 'registration' | 'pitch'; id: string; name: string } | null>(null);
  const [emailModal, setEmailModal] = useState<{ isOpen: boolean; registration: Registration | null }>({ isOpen: false, registration: null });
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; registration: Registration | null }>({ isOpen: false, registration: null });

  // States
  const [deleting, setDeleting] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // Pagination
  const [regPage, setRegPage] = useState(1);
  const [pitchPage, setPitchPage] = useState(1);

  // ── Data Loading ────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [regSnap, pitchSnap] = await Promise.all([
        getDocs(query(collection(db, 'registrations'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'pitch-decks'), orderBy('submissionDate', 'desc'))),
      ]);
      setRegistrations(regSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Registration));
      setPitchDecks(pitchSnap.docs.map(d => ({ id: d.id, ...d.data() }) as PitchDeck));
      setToast({ message: `Loaded ${regSnap.size} registrations & ${pitchSnap.size} pitch decks`, type: 'success' });
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Check Firestore rules/indexes.');
      setToast({ message: 'Failed to load dashboard data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { setRegPage(1); }, [searchTerm, filterCategory, filterPaymentStatus]);
  useEffect(() => { setPitchPage(1); }, [searchTerm, filterPitchStatus]);

  // ── Delete ──────────────────────────────────────
  const handleDeleteClick = (type: 'registration' | 'pitch', id: string, name: string) => {
    setDeleteModal({ isOpen: true, type, id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const coll = deleteModal.type === 'registration' ? 'registrations' : 'pitch-decks';
      await deleteDoc(doc(db, coll, deleteModal.id));
      if (deleteModal.type === 'registration') {
        setRegistrations(prev => prev.filter(r => r.id !== deleteModal.id));
      } else {
        setPitchDecks(prev => prev.filter(p => p.id !== deleteModal.id));
      }
      setDeleteModal(null);
      setToast({ message: 'Deleted successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Delete failed', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  // ── Email ───────────────────────────────────────
  const handleSendEmailClick = (registration: Registration) => setEmailModal({ isOpen: true, registration });

  const handleSendEmailConfirm = async () => {
    if (!emailModal.registration) return;
    setSendingEmail(true);
    try {
      const res = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailModal.registration.email,
          fullName: emailModal.registration.fullName,
          uniqueId: emailModal.registration.registrationId,
          categoryName: emailModal.registration.categoryName,
          categoryId: emailModal.registration.category,
          price: emailModal.registration.price,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed');
      setToast({ message: `Email sent to ${emailModal.registration.email}`, type: 'success' });
      setEmailModal({ isOpen: false, registration: null });
      await loadData();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Email send failed', type: 'error' });
    } finally {
      setSendingEmail(false);
    }
  };

  // ── Manual Payment ──────────────────────────────
  const handleConfirmPaymentClick = (registration: Registration) => setPaymentModal({ isOpen: true, registration });

  const handleConfirmPaymentSubmit = async () => {
    if (!paymentModal.registration) return;
    setConfirmingPayment(true);
    try {
      const res = await fetch('/api/admin-payment-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: paymentModal.registration.registrationId,
          fullName: paymentModal.registration.fullName,
          email: paymentModal.registration.email,
          categoryName: paymentModal.registration.categoryName,
          categoryId: paymentModal.registration.category,
          price: paymentModal.registration.price,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed');
      setToast({ message: data.warning || `Payment confirmed & email sent to ${paymentModal.registration.email}`, type: data.warning ? 'warning' : 'success' });
      setPaymentModal({ isOpen: false, registration: null });
      await loadData();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Confirmation failed', type: 'error' });
    } finally {
      setConfirmingPayment(false);
    }
  };

  // ── Filtering & Pagination ──────────────────────
  const filteredRegistrations = useMemo(() => registrations.filter(r => {
    const s = searchTerm.toLowerCase();
    return (
      `${r.fullName} ${r.email} ${r.registrationId}`.toLowerCase().includes(s) &&
      (filterCategory === 'all' || r.categoryName.includes(filterCategory)) &&
      (filterPaymentStatus === 'all' || r.paymentStatus === filterPaymentStatus)
    );
  }), [registrations, searchTerm, filterCategory, filterPaymentStatus]);

  const filteredPitchDecks = useMemo(() => pitchDecks.filter(p => {
    const s = searchTerm.toLowerCase();
    return (
      `${p.fullName} ${p.businessName} ${p.registrationId} ${p.email}`.toLowerCase().includes(s) &&
      (filterPitchStatus === 'all' || p.status === filterPitchStatus)
    );
  }), [pitchDecks, searchTerm, filterPitchStatus]);

  const paginatedRegs = useMemo(() => {
    const start = (regPage - 1) * PAGE_SIZE;
    return filteredRegistrations.slice(start, start + PAGE_SIZE);
  }, [filteredRegistrations, regPage]);

  const paginatedPitches = useMemo(() => {
    const start = (pitchPage - 1) * PAGE_SIZE;
    return filteredPitchDecks.slice(start, start + PAGE_SIZE);
  }, [filteredPitchDecks, pitchPage]);

  // ── Stats ───────────────────────────────────────
  const regStats = useMemo(() => ({
    total: registrations.length,
    completed: registrations.filter(r => r.paymentStatus === 'completed').length,
    pending: registrations.filter(r => r.paymentStatus === 'pending').length,
    emailsSent: registrations.filter(r => r.emailSent).length,
    manual: registrations.filter(r => r.manualConfirmation).length,
  }), [registrations]);

  const pitchStats = useMemo(() => ({
    total: pitchDecks.length,
    submitted: pitchDecks.filter(p => p.status === 'submitted').length,
    underReview: pitchDecks.filter(p => p.status === 'under_review').length,
    shortlisted: pitchDecks.filter(p => p.status === 'shortlisted').length,
    approved: pitchDecks.filter(p => p.status === 'approved').length,
    rejected: pitchDecks.filter(p => p.status === 'rejected').length,
  }), [pitchDecks]);

  // ── CSV Export ──────────────────────────────────
  const exportRegistrationsCSV = () => {
    const headers = ['Reg ID','Name','Email','Phone','Area','Category','Price','Payment','Email Sent','Manual','Date'];
    const rows = filteredRegistrations.map(r => [
      r.registrationId, r.fullName, r.email, r.phone, r.areaOfInterest, r.categoryName, r.price,
      r.paymentStatus, r.emailSent ? 'Yes' : 'No', r.manualConfirmation ? 'Yes' : 'No',
      r.createdAt?.toDate().toLocaleDateString() || 'N/A'
    ]);
    downloadCSV([headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n'), 'registrations');
    setToast({ message: 'Registrations exported', type: 'success' });
  };

  const exportPitchDecksCSV = () => {
    const headers = ['Reg ID','Name','Email','Business','Category','Funding Needs','Team','Status','File Size','URL','Cloudinary ID','Date'];
    const rows = filteredPitchDecks.map(p => [
      p.registrationId, p.fullName, p.email, p.businessName, p.category, p.fundingNeeds, p.teamSize, p.status,
      formatFileSize(p.fileSize), p.pitchDeckUrl || '', p.cloudinaryPublicId || '',
      p.submissionDate?.toDate().toLocaleDateString() || 'N/A'
    ]);
    downloadCSV([headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n'), 'pitch-decks');
    setToast({ message: 'Pitch decks exported', type: 'success' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={loadData} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">FuturenTrepeneurship NYSC 2026</p>
            </div>
            <button onClick={loadData} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 transition">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-6 border-b border-gray-200">
            {(['registrations', 'pitchDecks'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-4 font-semibold transition ${activeTab === tab ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'registrations' ? `Registrations (${registrations.length})` : `Pitch Decks (${pitchDecks.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {activeTab === 'registrations' ? (
            <>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
                <div className="text-4xl font-bold mb-1">{regStats.total}</div>
                <div className="text-emerald-100">Total</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="text-3xl font-bold text-emerald-600 mb-1">{regStats.completed}</div>
                <div className="text-sm text-gray-600">Paid</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="text-3xl font-bold text-amber-600 mb-1">{regStats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="text-3xl font-bold text-purple-600 mb-1">{regStats.manual}</div>
                <div className="text-sm text-gray-600">Manual</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="text-3xl font-bold text-indigo-600 mb-1">{regStats.emailsSent}</div>
                <div className="text-sm text-gray-600">Emails Sent</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                <div className="text-4xl font-bold mb-1">{pitchStats.total}</div>
                <div className="text-blue-100">Total</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow"><div className="text-3xl font-bold text-gray-600 mb-1">{pitchStats.submitted}</div><div className="text-sm text-gray-600">Submitted</div></div>
              <div className="bg-white rounded-xl p-6 shadow"><div className="text-3xl font-bold text-amber-600 mb-1">{pitchStats.underReview}</div><div className="text-sm text-gray-600">Under Review</div></div>
              <div className="bg-white rounded-xl p-6 shadow"><div className="text-3xl font-bold text-blue-600 mb-1">{pitchStats.shortlisted}</div><div className="text-sm text-gray-600">Shortlisted</div></div>
              <div className="bg-white rounded-xl p-6 shadow"><div className="text-3xl font-bold text-emerald-600 mb-1">{pitchStats.approved}</div><div className="text-sm text-gray-600">Approved</div></div>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'registrations' ? 'Search name, email, ID...' : 'Search name, business, ID...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            {activeTab === 'registrations' && (
              <>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 appearance-none">
                    <option value="all">All Categories</option>
                    <option value="Fully Funded">Fully Funded</option>
                    <option value="Partially Funded">Partially Funded</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select value={filterPaymentStatus} onChange={e => setFilterPaymentStatus(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 appearance-none">
                    <option value="all">All Payments</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'pitchDecks' && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select value={filterPitchStatus} onChange={e => setFilterPitchStatus(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 appearance-none">
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}

            <button
              onClick={activeTab === 'registrations' ? exportRegistrationsCSV : exportPitchDecksCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <Download className="w-5 h-5" /> Export CSV
            </button>
          </div>
        </div>

        {/* Tables */}
        {activeTab === 'registrations' && (
          <>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['ID', 'Name', 'Email', 'Phone', 'Area', 'Category', 'Price', 'Payment', 'Email', 'Date', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedRegs.map(reg => (
                      <tr key={reg.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-mono text-sm font-semibold text-emerald-600">{reg.registrationId}</div>
                          {reg.manualConfirmation && <span className="text-xs text-purple-600">Manual</span>}
                        </td>
                        <td className="px-6 py-4 font-medium">{reg.fullName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{reg.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{reg.phone}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{reg.areaOfInterest}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${categoryBadgeClass(reg.categoryName)}`}>{reg.categoryName}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold">{reg.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(reg.paymentStatus)}`}>{reg.paymentStatus}</span>
                        </td>
                        <td className="px-6 py-4">
                          {reg.emailSent ? (
                            <span className="flex items-center gap-1 text-emerald-600 text-sm"><CheckCircle className="w-4 h-4" /> Sent</span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400 text-sm"><XCircle className="w-4 h-4" /> Not Sent</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{reg.createdAt?.toDate().toLocaleDateString() || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-2">
                            {reg.paymentStatus === 'pending' && (
                              <button
                                onClick={() => handleConfirmPaymentClick(reg)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200 transition"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Confirm
                              </button>
                            )}
                            <button
                              onClick={() => handleSendEmailClick(reg)}
                              disabled={reg.paymentStatus !== 'completed'}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                reg.paymentStatus === 'completed'
                                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                              }`}
                            >
                              <Mail className="w-3.5 h-3.5" /> {reg.emailSent ? 'Resend' : 'Send'}
                            </button>
                            <button
                              onClick={() => handleDeleteClick('registration', reg.id, reg.fullName)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold border border-red-200 transition"
                              disabled={deleting}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {paginatedRegs.length === 0 && <div className="text-center py-12 text-gray-500">No registrations found.</div>}
            </div>
            <Pagination currentPage={regPage} totalPages={Math.ceil(filteredRegistrations.length / PAGE_SIZE)} onPageChange={setRegPage} />
          </>
        )}

        {activeTab === 'pitchDecks' && (
          <>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Reg ID', 'Applicant', 'Business', 'Pitch Deck', 'Status', 'Date', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedPitches.map(pitch => (
                      <tr key={pitch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-mono text-sm font-semibold text-blue-600">{pitch.registrationId}</div>
                          <span className={`inline-flex px-2 py-0.5 text-xs rounded ${categoryBadgeClass(pitch.category)} mt-1`}>{pitch.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{pitch.fullName}</div>
                          <div className="text-sm text-gray-500">{pitch.email}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Users className="w-3.5 h-3.5" /> {pitch.teamSize}
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="font-medium flex items-center gap-2 mb-1">
                            <Building2 className="w-4 h-4 text-emerald-600" /> {pitch.businessName}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2 mb-2">{pitch.businessDescription}</div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-amber-600" />
                            <span className="font-semibold">{pitch.fundingNeeds}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium mb-1">{pitch.pitchDeckFileName}</div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(pitch.fileSize)} {pitch.fileFormat && `• ${pitch.fileFormat.toUpperCase()}`}
                          </div>
                          {pitch.cloudinaryPublicId && (
                            <div className="text-xs text-gray-400 font-mono truncate max-w-[180px] mt-1">
                              {pitch.cloudinaryPublicId}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(pitch.status)}`}>
                            {pitch.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {pitch.submissionDate?.toDate().toLocaleString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-2">
                            <a href={pitch.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200 transition">
                              <Eye className="w-3.5 h-3.5" /> View
                            </a>
                            <a href={pitch.pitchDeckUrl} download className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition">
                              <Download className="w-3.5 h-3.5" /> Download
                            </a>
                            <button onClick={() => handleDeleteClick('pitch', pitch.id, pitch.businessName)} disabled={deleting} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold border border-red-200 transition">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {paginatedPitches.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  No pitch decks found
                </div>
              )}
            </div>
            <Pagination currentPage={pitchPage} totalPages={Math.ceil(filteredPitchDecks.length / PAGE_SIZE)} onPageChange={setPitchPage} />
          </>
        )}

        {/* Modals */}
        {deleteModal && (
          <DeleteModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal(null)}
            onConfirm={handleDeleteConfirm}
            itemType={deleteModal.type === 'registration' ? 'registration' : 'pitch deck'}
            itemName={deleteModal.name}
            deleting={deleting}
          />
        )}
        {emailModal.isOpen && (
          <EmailConfirmModal
            isOpen={emailModal.isOpen}
            onClose={() => setEmailModal({ isOpen: false, registration: null })}
            onConfirm={handleSendEmailConfirm}
            registration={emailModal.registration}
            sending={sendingEmail}
          />
        )}
        {paymentModal.isOpen && (
          <PaymentConfirmModal
            isOpen={paymentModal.isOpen}
            onClose={() => setPaymentModal({ isOpen: false, registration: null })}
            onConfirm={handleConfirmPaymentSubmit}
            registration={paymentModal.registration}
            confirming={confirmingPayment}
          />
        )}

        <style jsx global>{`
          @keyframes scale-up { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          .animate-scale-up { animation: scale-up 0.2s ease-out; }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
        `}</style>
      </div>
    </div>
  );
}