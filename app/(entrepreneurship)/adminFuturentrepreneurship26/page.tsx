'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Download, Search, Filter, Eye, Trash2, AlertTriangle } from 'lucide-react';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  areaOfInterest: string;
  categoryName: string;
  price: string;
  uniqueId: string;
  registrationDate: Timestamp;
  status: string;
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
// Pagination constants
// ────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ────────────────────────────────────────────────
// Helper – download a CSV string as a file and
// immediately revoke the blob URL so we don't
// leak memory.
// ────────────────────────────────────────────────
function downloadCSV(csv: string, name: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${name}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // ← prevents memory leak
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
// Pagination Component
// ────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Build page numbers with ellipsis logic
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3)              pages.push('...');
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
// Badge helpers (pure – no allocations in render)
// ────────────────────────────────────────────────
function categoryBadgeClass(name: string) {
  if (name.includes('Fully Funded'))      return 'bg-emerald-100 text-emerald-800';
  if (name.includes('Partially Funded')) return 'bg-blue-100 text-blue-800';
  if (name.includes('Basic'))            return 'bg-purple-100 text-purple-800';
  return 'bg-amber-100 text-amber-800';                        // Self-Funded
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'approved':     return 'bg-emerald-100 text-emerald-800';
    case 'shortlisted':  return 'bg-blue-100   text-blue-800';
    case 'under_review': return 'bg-amber-100  text-amber-800';
    default:             return 'bg-gray-100   text-gray-800';
  }
}

// ────────────────────────────────────────────────
// Admin Dashboard
// ────────────────────────────────────────────────
export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pitchDecks,    setPitchDecks]    = useState<PitchDeck[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState<'registrations' | 'pitchDecks'>('registrations');
  const [searchTerm,    setSearchTerm]    = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [deleteModal,   setDeleteModal]   = useState<{ isOpen: boolean; type: 'registration' | 'pitch'; id: string; name: string } | null>(null);
  const [deleting,      setDeleting]      = useState(false);

  // ── pagination state (one page counter per tab) ──
  const [regPage,   setRegPage]   = useState(1);
  const [pitchPage, setPitchPage] = useState(1);

  // ── load both collections once on mount ──────────
  const loadData = async () => {
    try {
      const [regSnap, pitchSnap] = await Promise.all([
        getDocs(query(collection(db, 'registrations'),  orderBy('registrationDate', 'desc'), limit(500))),
        getDocs(query(collection(db, 'pitch-decks'),    orderBy('submissionDate',   'desc'), limit(500))),
      ]);

      setRegistrations(regSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Registration));
      setPitchDecks(pitchSnap.docs.map(d => ({ id: d.id, ...d.data() }) as PitchDeck));
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── reset page-1 whenever search / filter changes ─
  useEffect(() => { setRegPage(1);   }, [searchTerm, filterCategory]);
  useEffect(() => { setPitchPage(1); }, [searchTerm]);

  // ── delete handlers ──────────────────────────────
  const handleDeleteClick = (type: 'registration' | 'pitch', id: string, name: string) => {
    setDeleteModal({ isOpen: true, type, id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    
    setDeleting(true);
    try {
      const collectionName = deleteModal.type === 'registration' ? 'registrations' : 'pitch-decks';
      await deleteDoc(doc(db, collectionName, deleteModal.id));
      
      // Update local state
      if (deleteModal.type === 'registration') {
        setRegistrations(prev => prev.filter(r => r.id !== deleteModal.id));
      } else {
        setPitchDecks(prev => prev.filter(p => p.id !== deleteModal.id));
      }
      
      setDeleteModal(null);
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // ── memoised filtered lists ──────────────────────
  const filteredRegistrations = useMemo(() =>
    registrations.filter(reg => {
      const haystack = `${reg.fullName} ${reg.email} ${reg.uniqueId}`.toLowerCase();
      const matchesSearch   = haystack.includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || reg.categoryName.includes(filterCategory);
      return matchesSearch && matchesCategory;
    }),
    [registrations, searchTerm, filterCategory]
  );

  const filteredPitchDecks = useMemo(() =>
    pitchDecks.filter(p =>
      `${p.fullName} ${p.businessName} ${p.registrationId}`.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [pitchDecks, searchTerm]
  );

  // ── paginated slices ─────────────────────────────
  const paginatedRegs = useMemo(() => {
    const start = (regPage - 1) * PAGE_SIZE;
    return filteredRegistrations.slice(start, start + PAGE_SIZE);
  }, [filteredRegistrations, regPage]);

  const paginatedPitches = useMemo(() => {
    const start = (pitchPage - 1) * PAGE_SIZE;
    return filteredPitchDecks.slice(start, start + PAGE_SIZE);
  }, [filteredPitchDecks, pitchPage]);

  // ── memoised stats ───────────────────────────────
  const regStats = useMemo(() => ({
    total:           registrations.length,
    fullyFunded:     registrations.filter(r => r.categoryName.includes('Fully Funded')).length,
    partiallyFunded: registrations.filter(r => r.categoryName.includes('Partially Funded')).length,
    basic:           registrations.filter(r => r.categoryName.includes('Basic')).length,
    selfFunded:      registrations.filter(r => r.categoryName.includes('Self-Funded')).length,
  }), [registrations]);

  const pitchStats = useMemo(() => ({
    total:       pitchDecks.length,
    submitted:   pitchDecks.filter(p => p.status === 'submitted').length,
    underReview: pitchDecks.filter(p => p.status === 'under_review').length,
    shortlisted: pitchDecks.filter(p => p.status === 'shortlisted').length,
    approved:    pitchDecks.filter(p => p.status === 'approved').length,
  }), [pitchDecks]);

  // ── CSV exporters ────────────────────────────────
  const exportRegistrationsToCSV = () => {
    const headers = ['Registration ID','Name','Email','Phone','Area of Interest','Category','Price','Date'];
    const rows = filteredRegistrations.map(r => [
      r.uniqueId, r.fullName, r.email, r.phone,
      r.areaOfInterest, r.categoryName, r.price,
      r.registrationDate?.toDate().toLocaleDateString() || 'N/A',
    ]);
    downloadCSV(
      [headers.join(','), ...rows.map(row => row.map(c => `"${c}"`).join(','))].join('\n'),
      'registrations'
    );
  };

  const exportPitchDecksToCSV = () => {
    const headers = ['Registration ID','Name','Email','Business Name','Funding Needs','Team Size','Status','Pitch Deck URL','Submission Date'];
    const rows = filteredPitchDecks.map(p => [
      p.registrationId, p.fullName, p.email, p.businessName,
      p.fundingNeeds, p.teamSize, p.status,
      p.pitchDeckUrl || '',
      p.submissionDate?.toDate().toLocaleDateString() || 'N/A',
    ]);
    downloadCSV(
      [headers.join(','), ...rows.map(row => row.map(c => `"${c}"`).join(','))].join('\n'),
      'pitch-decks'
    );
  };

  // ── loading state ────────────────────────────────
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

  // ── render ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">FuturenTrepeneurship NYSC 2026</p>
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
              <div className="bg-white rounded-xl p-6 shadow"><div className="text-3xl font-bold text-emerald-600 mb-1">{regStats.fullyFunded}</div><div className="text-sm text-gray-600">Fully Funded</div></div>
              <div className="bg-white rounded-xl p-6 shadow"><div className="text-3xl font-bold text-blue-600   mb-1">{regStats.partiallyFunded}</div><div className="text-sm text-gray-600">Partially Funded</div></div>
              <div className="bg-white rounded-xl p-6 shadow"><div className="text-3xl font-bold text-purple-600 mb-1">{regStats.basic}</div><div className="text-sm text-gray-600">Basic</div></div>
              <div className="bg-white rounded-xl p-6 shadow"><div className="text-3xl font-bold text-amber-600  mb-1">{regStats.selfFunded}</div><div className="text-sm text-gray-600">Self-Funded</div></div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                <div className="text-4xl font-bold mb-1">{pitchStats.total}</div>
                <div className="text-blue-100">Total Pitch Decks</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow"><div className="text-3xl font-bold text-gray-600   mb-1">{pitchStats.submitted}</div><div className="text-sm text-gray-600">Submitted</div></div>
              <div className="bg-white rounded-xl p-6 shadow"><div className="text-3xl font-bold text-amber-600  mb-1">{pitchStats.underReview}</div><div className="text-sm text-gray-600">Under Review</div></div>
              <div className="bg-white rounded-xl p-6 shadow"><div className="text-3xl font-bold text-blue-600   mb-1">{pitchStats.shortlisted}</div><div className="text-sm text-gray-600">Shortlisted</div></div>
              <div className="bg-white rounded-xl p-6 shadow"><div className="text-3xl font-bold text-emerald-600 mb-1">{pitchStats.approved}</div><div className="text-sm text-gray-600">Approved</div></div>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      {['ID','Name','Email','Phone','Area of Interest','Category','Price','Date','Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedRegs.map(reg => (
                      <tr key={reg.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-mono text-sm font-semibold text-emerald-600">{reg.uniqueId}</div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {reg.registrationDate?.toDate().toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteClick('registration', reg.id, reg.fullName)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold text-sm transition"
                            disabled={deleting}
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
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
                      {['Reg ID','Name','Business','Funding','Team','Status','Date','Actions'].map(h => (
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
                          <div className="flex items-center gap-3">
                            {/* View (opens in new tab) */}
                            <a
                              href={pitch.pitchDeckUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                            >
                              <Eye className="w-4 h-4" /> View
                            </a>
                            {/* Download */}
                            <a
                              href={pitch.pitchDeckUrl}
                              download={pitch.pitchDeckFileName || 'pitch-deck'}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                            >
                              <Download className="w-4 h-4" /> Download
                            </a>
                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteClick('pitch', pitch.id, pitch.businessName)}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold text-sm transition"
                              disabled={deleting}
                            >
                              <Trash2 className="w-4 h-4" /> Delete
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

      {/* Add CSS for modal animation */}
      <style jsx global>{`
        @keyframes scale-up {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}