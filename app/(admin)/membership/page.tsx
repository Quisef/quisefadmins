"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, deleteDoc, doc, orderBy } from "firebase/firestore";

interface Member {
  id: string;
  type: "personal" | "organization";
  name?: string;
  organizationName?: string;
  gender?: string;
  email: string;
  phone: string;
  address: string;
  membershipTier: string;
  tierAmount: number;
  paymentStatus: string;
  paymentId?: string;
  paymentMethod?: string;
  paymentChannel?: string;
  amountPaid?: number;
  paidAt?: Date;
  submittedAt?: Date;
  failureReason?: string;
}

export default function MembershipPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"personal" | "organization" | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const membersPerPage = 10;

  const fetchMembers = async (type: "personal" | "organization") => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "membershipApplications"),
        where("type", "==", type),
        //orderBy("submittedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const membersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type as "personal" | "organization",
          name:
            data.type === "personal"
              ? `${data.firstName || ""} ${data.middleName || ""} ${data.lastName || ""}`.trim()
              : undefined,
          organizationName: data.type === "organization" ? data.orgName : undefined,
          gender: data.type === "personal" ? data.gender : undefined,
          email: data.email,
          phone: data.phone,
          address: data.address,
          membershipTier: data.membershipTier,
          tierAmount: data.tierAmount || 0,
          paymentStatus: data.paymentStatus || "pending",
          paymentId: data.paymentId,
          paymentMethod: data.paymentMethod,
          paymentChannel: data.paymentChannel,
          amountPaid: data.amountPaid,
          paidAt: data.paidAt?.toDate(),
          submittedAt: data.submittedAt?.toDate(),
          failureReason: data.failureReason,
        } as Member;
      });
      setMembers(membersData);
    } catch (err) {
      setError("Failed to fetch members");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = (id: string) => {
    setMemberToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      await deleteDoc(doc(db, "membershipApplications", memberToDelete));
      setMembers((prevMembers) => prevMembers.filter((member) => member.id !== memberToDelete));
      setError(null);
      const filtered = members.filter((member) => member.id !== memberToDelete);
      const totalPagesAfterDelete = Math.ceil(filtered.length / membersPerPage);
      if (currentPage > totalPagesAfterDelete && currentPage > 1) {
        setCurrentPage(totalPagesAfterDelete);
      }
    } catch (err) {
      setError("Failed to delete member");
      console.error(err);
    } finally {
      setShowDeleteModal(false);
      setMemberToDelete(null);
    }
  };

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
  };

  useEffect(() => {
    if (selectedType) {
      fetchMembers(selectedType);
    }
  }, [selectedType]);

  const handleMembershipClick = (type: "personal" | "organization") => {
    setSelectedType(type);
    setCurrentPage(1);
    setSearchTerm("");
    setFilterStatus("all");
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatus = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  // Filter members based on search term and payment status
  const filteredMembers = members.filter((member) => {
    const searchValue = searchTerm.toLowerCase();
    const nameToSearch =
      member.type === "personal" ? member.name?.toLowerCase() : member.organizationName?.toLowerCase();
    const matchesSearch = nameToSearch?.includes(searchValue) || member.email.toLowerCase().includes(searchValue);
    const matchesStatus = filterStatus === "all" || member.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: members.length,
    completed: members.filter((m) => m.paymentStatus === "completed").length,
    pending: members.filter((m) => m.paymentStatus === "pending").length,
    failed: members.filter((m) => m.paymentStatus === "failed").length,
    totalRevenue: members
      .filter((m) => m.paymentStatus === "completed")
      .reduce((sum, m) => sum + (m.amountPaid || 0), 0),
  };

  // Pagination logic
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Membership Management</h1>

        {/* Membership Type Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleMembershipClick("personal")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedType === "personal"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Personal Membership
          </button>
          <button
            onClick={() => handleMembershipClick("organization")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedType === "organization"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Organization Membership
          </button>
        </div>

        {/* Statistics Cards */}
        {selectedType && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <p className="text-green-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <p className="text-yellow-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow">
              <p className="text-red-600 text-sm">Failed</p>
              <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <p className="text-blue-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        {selectedType && (
          <div className="mb-6 flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder={`Search by ${selectedType === "personal" ? "name or email" : "organization name or email"}...`}
              value={searchTerm}
              onChange={handleSearch}
              className="flex-1 min-w-[250px] border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterStatus}
              onChange={handleFilterStatus}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 text-gray-600">Loading members...</div>
        )}

        {/* Members List */}
        {!loading && selectedType && (
          <>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="py-3 px-4 text-left">
                      {selectedType === "personal" ? "Name" : "Organization"}
                    </th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Tier</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMembers.length > 0 ? (
                    currentMembers.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {member.type === "personal" ? member.name : member.organizationName}
                        </td>
                        <td className="py-3 px-4">{member.email}</td>
                        <td className="py-3 px-4 capitalize">{member.membershipTier}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(member.paymentStatus)}`}>
                            {member.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {member.paymentStatus === "completed"
                            ? formatCurrency(member.amountPaid || member.tierAmount)
                            : formatCurrency(member.tierAmount)}
                        </td>
                        <td className="py-3 px-4 text-sm">{formatDate(member.submittedAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(member)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-4 text-center text-gray-600"
                      >
                        No members found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  Next
                </button>
              </div>
            )}

            {/* Results Counter */}
            {filteredMembers.length > 0 && (
              <div className="mt-4 text-center text-gray-600">
                Showing {indexOfFirstMember + 1} -{" "}
                {Math.min(indexOfLastMember, filteredMembers.length)} of {filteredMembers.length}{" "}
                members
              </div>
            )}
          </>
        )}

        {/* Initial State Message */}
        {!selectedType && !loading && (
          <div className="text-center py-8 text-gray-600">
            Please select a membership type to view members.
          </div>
        )}

        {/* Member Details Modal */}
        {showDetailsModal && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Member Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name/Organization</p>
                    <p className="font-semibold">
                      {selectedMember.type === "personal" ? selectedMember.name : selectedMember.organizationName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{selectedMember.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedMember.phone}</p>
                  </div>
                  {selectedMember.gender && (
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-semibold capitalize">{selectedMember.gender}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold">{selectedMember.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Membership Tier</p>
                    <p className="font-semibold capitalize">{selectedMember.membershipTier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tier Amount</p>
                    <p className="font-semibold">{formatCurrency(selectedMember.tierAmount)}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(selectedMember.paymentStatus)}`}>
                        {selectedMember.paymentStatus}
                      </span>
                    </div>
                    {selectedMember.amountPaid && (
                      <div>
                        <p className="text-sm text-gray-600">Amount Paid</p>
                        <p className="font-semibold">{formatCurrency(selectedMember.amountPaid)}</p>
                      </div>
                    )}
                  </div>

                  {selectedMember.paymentId && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Payment Reference</p>
                      <p className="font-mono text-sm">{selectedMember.paymentId}</p>
                    </div>
                  )}

                  {selectedMember.paymentMethod && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-semibold capitalize">{selectedMember.paymentMethod}</p>
                      </div>
                      {selectedMember.paymentChannel && (
                        <div>
                          <p className="text-sm text-gray-600">Payment Channel</p>
                          <p className="font-semibold capitalize">{selectedMember.paymentChannel}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedMember.paidAt && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Paid At</p>
                      <p className="font-semibold">{formatDate(selectedMember.paidAt)}</p>
                    </div>
                  )}

                  {selectedMember.failureReason && (
                    <div className="mt-2 p-3 bg-red-50 rounded">
                      <p className="text-sm text-red-600">Failure Reason</p>
                      <p className="font-semibold text-red-900">{selectedMember.failureReason}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Application Submitted</p>
                  <p className="font-semibold">{formatDate(selectedMember.submittedAt)}</p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Confirm Deletion</h2>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete this member? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteMember}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}