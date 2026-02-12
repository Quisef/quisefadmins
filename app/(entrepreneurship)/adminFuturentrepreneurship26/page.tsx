'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Download, Search, Filter, Eye, Trash2, AlertTriangle, Mail, Send, 
  CheckCircle, XCircle, Loader2, ChevronDown, ChevronLeft, ChevronRight,
  DollarSign, Users, TrendingUp, Clock
} from 'lucide-react';

// ────────────────────────────────────────────────
// Types
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
  businessName: string;
  businessDescription: string;
  fundingNeeds: string;
  teamSize: string;
  pitchDeckUrl: string;
  pitchDeckFileName: string;
  submissionDate: Timestamp;
  status: string;
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
    default: return 'bg-gray-100 text-gray-800';
  }
}

// ────────────────────────────────────────────────
// Delete Confirmation Modal
// ────────────────────────────────────────────────
function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemType, 
  itemName 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: string;
  itemName: string;
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
          Are you sure you want to delete this {itemType}?
          <br />
          <strong className="text-gray-900">{itemName}</strong>
          <br />
          <span className="text-red-600 font-semibold">This action cannot be undone.</span>
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Email Confirmation Modal
// ────────────────────────────────────────────────
function EmailConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  registration,
  sending
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  registration: Registration | null;
  sending: boolean;
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
        
        <p className="text-gray-600 mb-4">
          Send confirmation email to:
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Name:</span>
            <span className="font-semibold text-gray-900">{registration.fullName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email:</span>
            <span className="font-semibold text-gray-900">{registration.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Registration ID:</span>
            <span className="font-mono font-semibold text-emerald-600">{registration.registrationId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Category:</span>
            <span className="font-semibold text-gray-900">{registration.categoryName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount:</span>
            <span className="font-semibold text-gray-900">{registration.price}</span>
          </div>
        </div>

        {registration.emailSent && registration.emailSentAt && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800">
              ⚠️ Email was previously sent on {registration.emailSentAt.toDate().toLocaleString()}
            </p>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={sending}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={sending}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Payment Confirmation Modal
// ────────────────────────────────────────────────
function PaymentConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  registration,
  confirming
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  registration: Registration | null;
  confirming: boolean;
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
        
        <p className="text-gray-600 mb-4">
          Manually mark this registration as paid? This will:
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Update payment status to <strong>completed</strong></span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Send confirmation email to registrant</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Record payment details in system</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Name:</span>
            <span className="font-semibold text-gray-900">{registration.fullName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email:</span>
            <span className="font-semibold text-gray-900">{registration.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Registration ID:</span>
            <span className="font-mono font-semibold text-emerald-600">{registration.registrationId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount:</span>
            <span className="font-semibold text-gray-900">{registration.price}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Current Status:</span>
            <span className="font-semibold text-amber-600 uppercase">{registration.paymentStatus}</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-800">
            ⚠️ <strong>Important:</strong> Only confirm if you've verified payment through bank transfer, cash, or other means outside the system.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={confirming}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {confirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirm Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Toast Notification
// ────────────────────────────────────────────────
function Toast({ message, type, onClose }: { 
  message: string; 
  type: 'success' | 'error' | 'warning'; 
  onClose: () => void 
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md`}>
        {icons[type]}
        <p className="font-medium">{message}</p>
        <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-1">
          ×
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Pagination Component
// ────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 hover:bg-gray-100 transition"
      >
        ← Prev
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
              p === currentPage
                ? 'bg-emerald-600 text-white shadow'
                : 'border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 hover:bg-gray-100 transition"
      >
        Next →
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────
// Main Admin Dashboard Component
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
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ 
    isOpen: boolean; 
    type: 'registration' | 'pitch'; 
    id: string; 
    name: string 
  } | null>(null);
  const [emailModal, setEmailModal] = useState<{ 
    isOpen: boolean; 
    registration: Registration | null 
  }>({ isOpen: false, registration: null });
  const [paymentModal, setPaymentModal] = useState<{ 
    isOpen: boolean; 
    registration: Registration | null 
  }>({ isOpen: false, registration: null });
  
  // Action states
  const [deleting, setDeleting] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  
  // Pagination states
  const [regPage, setRegPage] = useState(1);
  const [pitchPage, setPitchPage] = useState(1);

  // ── Load data from Firestore ────────────────────
  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [regSnap, pitchSnap] = await Promise.all([
        getDocs(query(collection(db, 'registrations'), orderBy('createdAt', 'desc'), limit(500))),
        getDocs(query(collection(db, 'pitch-decks'), orderBy('submissionDate', 'desc'), limit(500))),
      ]);

      setRegistrations(regSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Registration));
      setPitchDecks(pitchSnap.docs.map(d => ({ id: d.id, ...d.data() }) as PitchDeck));
      
      console.log('✅ Dashboard data loaded:', {
        registrations: regSnap.docs.length,
        pitchDecks: pitchSnap.docs.length
      });
    } catch (err) {
      console.error('❌ Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please check Firestore indexes and permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => { setRegPage(1); }, [searchTerm, filterCategory, filterPaymentStatus]);
  useEffect(() => { setPitchPage(1); }, [searchTerm]);

  // ── Delete handlers ──────────────────────────────
  const handleDeleteClick = (type: 'registration' | 'pitch', id: string, name: string) => {
    setDeleteModal({ isOpen: true, type, id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    
    setDeleting(true);
    try {
      const collectionName = deleteModal.type === 'registration' ? 'registrations' : 'pitch-decks';
      await deleteDoc(doc(db, collectionName, deleteModal.id));
      
      if (deleteModal.type === 'registration') {
        setRegistrations(prev => prev.filter(r => r.id !== deleteModal.id));
      } else {
        setPitchDecks(prev => prev.filter(p => p.id !== deleteModal.id));
      }
      
      setDeleteModal(null);
      setToast({ message: 'Deleted successfully', type: 'success' });
      console.log('✅ Deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting:', err);
      setToast({ message: 'Failed to delete. Please try again.', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  // ── Email sending handlers ──────────────────────
  const handleSendEmailClick = (registration: Registration) => {
    setEmailModal({ isOpen: true, registration });
  };

  const handleSendEmailConfirm = async () => {
    if (!emailModal.registration) return;

    setSendingEmail(true);
    try {
      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailModal.registration.email,
          fullName: emailModal.registration.fullName,
          uniqueId: emailModal.registration.registrationId,
          categoryName: emailModal.registration.categoryName,
          categoryId: emailModal.registration.category,
          price: emailModal.registration.price,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      setToast({ 
        message: `Confirmation email sent successfully to ${emailModal.registration.email}`, 
        type: 'success' 
      });
      
      setEmailModal({ isOpen: false, registration: null });
      await loadData();
      
      console.log('✅ Confirmation email sent successfully');
    } catch (err) {
      console.error('❌ Error sending email:', err);
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to send confirmation email', 
        type: 'error' 
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // ── Payment confirmation handlers ────────────────
  const handleConfirmPaymentClick = (registration: Registration) => {
    setPaymentModal({ isOpen: true, registration });
  };

  const handleConfirmPaymentSubmit = async () => {
    if (!paymentModal.registration) return;

    setConfirmingPayment(true);
    try {
      const response = await fetch('/api/admin-payment-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: paymentModal.registration.registrationId,
          fullName: paymentModal.registration.fullName,
          email: paymentModal.registration.email,
          categoryName: paymentModal.registration.categoryName,
          categoryId: paymentModal.registration.category,
          price: paymentModal.registration.price,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to confirm payment');
      }

      // Check if email was sent
      if (result.warning) {
        setToast({ 
          message: result.warning, 
          type: 'warning' 
        });
      } else {
        setToast({ 
          message: `Payment confirmed and email sent to ${paymentModal.registration.email}`, 
          type: 'success' 
        });
      }
      
      setPaymentModal({ isOpen: false, registration: null });
      await loadData();
      
      console.log('✅ Payment manually confirmed successfully');
    } catch (err) {
      console.error('❌ Error confirming payment:', err);
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to confirm payment', 
        type: 'error' 
      });
    } finally {
      setConfirmingPayment(false);
    }
  };

  // ── Filtered lists ───────────────────────────────
  const filteredRegistrations = useMemo(() =>
    registrations.filter(reg => {
      const haystack = `${reg.fullName} ${reg.email} ${reg.registrationId}`.toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || reg.categoryName.includes(filterCategory);
      const matchesPayment = filterPaymentStatus === 'all' || reg.paymentStatus === filterPaymentStatus;
      return matchesSearch && matchesCategory && matchesPayment;
    }),
    [registrations, searchTerm, filterCategory, filterPaymentStatus]
  );

  const filteredPitchDecks = useMemo(() =>
    pitchDecks.filter(p =>
      `${p.fullName} ${p.businessName} ${p.registrationId}`.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [pitchDecks, searchTerm]
  );

  // ── Paginated slices ─────────────────────────────
  const paginatedRegs = useMemo(() => {
    const start = (regPage - 1) * PAGE_SIZE;
    return filteredRegistrations.slice(start, start + PAGE_SIZE);
  }, [filteredRegistrations, regPage]);

  const paginatedPitches = useMemo(() => {
    const start = (pitchPage - 1) * PAGE_SIZE;
    return filteredPitchDecks.slice(start, start + PAGE_SIZE);
  }, [filteredPitchDecks, pitchPage]);

  // ── Stats ────────────────────────────────────────
  const regStats = useMemo(() => ({
    total: registrations.length,
    completed: registrations.filter(r => r.paymentStatus === 'completed').length,
    pending: registrations.filter(r => r.paymentStatus === 'pending').length,
    fullyFunded: registrations.filter(r => r.categoryName.includes('Fully Funded')).length,
    partiallyFunded: registrations.filter(r => r.categoryName.includes('Partially Funded')).length,
    basic: registrations.filter(r => r.categoryName.includes('Basic')).length,
    selfFunded: registrations.filter(r => r.categoryName.includes('Self-Funded')).length,
    emailsSent: registrations.filter(r => r.emailSent).length,
    manuallyConfirmed: registrations.filter(r => r.manualConfirmation).length,
  }), [registrations]);

  const pitchStats = useMemo(() => ({
    total: pitchDecks.length,
    submitted: pitchDecks.filter(p => p.status === 'submitted').length,
    underReview: pitchDecks.filter(p => p.status === 'under_review').length,
    shortlisted: pitchDecks.filter(p => p.status === 'shortlisted').length,
    approved: pitchDecks.filter(p => p.status === 'approved').length,
  }), [pitchDecks]);

  // ── CSV exporters ────────────────────────────────
  const exportRegistrationsToCSV = () => {
    const headers = ['Registration ID', 'Name', 'Email', 'Phone', 'Area of Interest', 'Category', 'Price', 'Payment Status', 'Payment Method', 'Email Sent', 'Manual Confirmation', 'Date'];
    const rows = filteredRegistrations.map(r => [
      r.registrationId,
      r.fullName,
      r.email,
      r.phone,
      r.areaOfInterest,
      r.categoryName,
      r.price,
      r.paymentStatus,
      r.paymentMethod || 'N/A',
      r.emailSent ? 'Yes' : 'No',
      r.manualConfirmation ? 'Yes' : 'No',
      r.createdAt?.toDate().toLocaleDateString() || 'N/A',
    ]);
    downloadCSV(
      [headers.join(','), ...rows.map(row => row.map(c => `"${c}"`).join(','))].join('\n'),
      'registrations'
    );
  };

  const exportPitchDecksToCSV = () => {
    const headers = ['Registration ID', 'Name', 'Email', 'Business Name', 'Funding Needs', 'Team Size', 'Status', 'Pitch Deck URL', 'Submission Date'];
    const rows = filteredPitchDecks.map(p => [
      p.registrationId,
      p.fullName,
      p.email,
      p.businessName,
      p.fundingNeeds,
      p.teamSize,
      p.status,
      p.pitchDeckUrl || '',
      p.submissionDate?.toDate().toLocaleDateString() || 'N/A',
    ]);
    downloadCSV(
      [headers.join(','), ...rows.map(row => row.map(c => `"${c}"`).join(','))].join('\n'),
      'pitch-decks'
    );
  };

  // ── Loading / Error states ───────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadData}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Toast Notifications */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">FuturenTrepeneurship NYSC 2026</p>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            {(['registrations', 'pitchDecks'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-4 font-semibold transition ${
                  activeTab === tab
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'registrations'
                  ? `Registrations (${registrations.length})`
                  : `Pitch Decks (${pitchDecks.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {activeTab === 'registrations' ? (
            <>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
                <div className="text-4xl font-bold mb-1">{regStats.total}</div>
                <div className="text-emerald-100">Total Registrations</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="text-3xl font-bold text-emerald-600 mb-1">{regStats.completed}</div>
                <div className="text-sm text-gray-600">Paid</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="text-3xl font-bold text-amber-600 mb-1">{regStats.pending}</div>
                <div className="text-sm text-gray-600">Pending Payment</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="text-3xl font-bold text-purple-600 mb-1">{regStats.manuallyConfirmed}</div>
                <div className="text-sm text-gray-600">Manually Confirmed</div>
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
                <div className="text-blue-100">Total Pitch Decks</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="text-3xl font-bold text-gray-600 mb-1">{pitchStats.submitted}</div>
                <div className="text-sm text-gray-600">Submitted</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="text-3xl font-bold text-amber-600 mb-1">{pitchStats.underReview}</div>
                <div className="text-sm text-gray-600">Under Review</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="text-3xl font-bold text-blue-600 mb-1">{pitchStats.shortlisted}</div>
                <div className="text-sm text-gray-600">Shortlisted</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <div className="text-3xl font-bold text-emerald-600 mb-1">{pitchStats.approved}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
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
                placeholder={activeTab === 'registrations' ? 'Search by name, email, or ID…' : 'Search by name, business, or ID…'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            {activeTab === 'registrations' && (
              <>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="Fully Funded">Fully Funded</option>
                    <option value="Partially Funded">Partially Funded</option>
                    <option value="Basic">Basic</option>
                    <option value="Self-Funded">Self-Funded</option>
                  </select>
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filterPaymentStatus}
                    onChange={e => setFilterPaymentStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white outline-none"
                  >
                    <option value="all">All Payments</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </>
            )}

            <button
              onClick={activeTab === 'registrations' ? exportRegistrationsToCSV : exportPitchDecksToCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <Download className="w-5 h-5" /> Export CSV
            </button>
          </div>
        </div>

        {/* ── Registrations Table ──────────────────── */}
        {activeTab === 'registrations' && (
          <>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['ID', 'Name', 'Email', 'Phone', 'Area', 'Category', 'Price', 'Payment', 'Confirmation', 'Date', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedRegs.map(reg => (
                      <tr key={reg.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-mono text-sm font-semibold text-emerald-600">{reg.registrationId}</div>
                          {reg.manualConfirmation && (
                            <span className="inline-flex items-center gap-1 text-xs text-purple-600 mt-1">
                              <Users className="w-3 h-3" /> Manual
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{reg.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.phone}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{reg.areaOfInterest}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${categoryBadgeClass(reg.categoryName)}`}>
                            {reg.categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{reg.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(reg.paymentStatus)}`}>
                            {reg.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {reg.emailSent ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 text-sm">
                              <CheckCircle className="w-4 h-4" /> Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                              <XCircle className="w-4 h-4" /> Not Sent
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {reg.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            {reg.paymentStatus === 'pending' && (
                              <button
                                onClick={() => handleConfirmPaymentClick(reg)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-md font-semibold text-xs transition-all cursor-pointer border border-emerald-200"
                                title="Manually confirm payment"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> 
                                Confirm Payment
                              </button>
                            )}
                            <button
                              onClick={() => handleSendEmailClick(reg)}
                              disabled={reg.paymentStatus !== 'completed'}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                                reg.paymentStatus === 'completed'
                                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md cursor-pointer border border-blue-200'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              }`}
                              title={reg.paymentStatus !== 'completed' ? 'Payment must be completed first' : 'Send confirmation email'}
                            >
                              <Mail className="w-3.5 h-3.5" /> 
                              {reg.emailSent ? 'Resend' : 'Send'}
                            </button>
                            <button
                              onClick={() => handleDeleteClick('registration', reg.id, reg.fullName)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-md font-semibold text-xs transition-all cursor-pointer border border-red-200"
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

              {paginatedRegs.length === 0 && (
                <div className="text-center py-12 text-gray-500">No registrations found matching your criteria.</div>
              )}
            </div>

            <Pagination currentPage={regPage} totalPages={Math.ceil(filteredRegistrations.length / PAGE_SIZE)} onPageChange={setRegPage} />

            <div className="mt-4 text-center text-sm text-gray-500">
              Showing {paginatedRegs.length} of {filteredRegistrations.length} registrations
            </div>
          </>
        )}

        {/* ── Pitch Decks Table ────────────────────── */}
        {activeTab === 'pitchDecks' && (
          <>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Reg ID', 'Name', 'Business', 'Funding', 'Team', 'Status', 'Date', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedPitches.map(pitch => (
                      <tr key={pitch.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-mono text-sm font-semibold text-blue-600">{pitch.registrationId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{pitch.fullName}</div>
                          <div className="text-sm text-gray-500">{pitch.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{pitch.businessName}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{pitch.businessDescription}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{pitch.fundingNeeds}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pitch.teamSize}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(pitch.status)}`}>
                            {pitch.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pitch.submissionDate?.toDate().toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <a
                              href={pitch.pitchDeckUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-md font-semibold text-xs transition-all cursor-pointer border border-emerald-200"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </a>
                            <a
                              href={pitch.pitchDeckUrl}
                              download={pitch.pitchDeckFileName || 'pitch-deck'}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md font-semibold text-xs transition-all cursor-pointer border border-blue-200"
                            >
                              <Download className="w-3.5 h-3.5" /> Download
                            </a>
                            <button
                              onClick={() => handleDeleteClick('pitch', pitch.id, pitch.businessName)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-md font-semibold text-xs transition-all cursor-pointer border border-red-200"
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

              {paginatedPitches.length === 0 && (
                <div className="text-center py-12 text-gray-500">No pitch decks found matching your criteria.</div>
              )}
            </div>

            <Pagination currentPage={pitchPage} totalPages={Math.ceil(filteredPitchDecks.length / PAGE_SIZE)} onPageChange={setPitchPage} />

            <div className="mt-4 text-center text-sm text-gray-500">
              Showing {paginatedPitches.length} of {filteredPitchDecks.length} pitch decks
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <DeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal(null)}
          onConfirm={handleDeleteConfirm}
          itemType={deleteModal.type === 'registration' ? 'registration' : 'pitch deck'}
          itemName={deleteModal.name}
        />
      )}

      {/* Email Confirmation Modal */}
      {emailModal.isOpen && (
        <EmailConfirmModal
          isOpen={emailModal.isOpen}
          onClose={() => setEmailModal({ isOpen: false, registration: null })}
          onConfirm={handleSendEmailConfirm}
          registration={emailModal.registration}
          sending={sendingEmail}
        />
      )}

      {/* Payment Confirmation Modal */}
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
        @keyframes scale-up {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-scale-up { animation: scale-up 0.2s ease-out; }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        
        button:not(:disabled) {
          cursor: pointer !important;
        }
        button:disabled {
          cursor: not-allowed !important;
        }
        button:not(:disabled):active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}