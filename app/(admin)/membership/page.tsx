"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

interface Member {
  id: string;
  type: "personal" | "organization";
  name?: string; // For personal members (combines firstName, middleName, lastName)
  organizationName?: string; // For organizational members (maps to orgName)
  gender?: string; // For personal members only
  amountPaid: number; // Calculated based on membershipTier
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
  const membersPerPage = 5; // Number of members per page

  // Define membership tier prices (in NGN)
  const tierPrices: { [key: string]: number } = {
    student: 0,
    basic: 50000,
    professional: 200000,
    corporate: 500000,
  };

  const fetchMembers = async (type: "personal" | "organization") => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "membershipApplications"), where("type", "==", type));
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
          amountPaid: data.paymentStatus === "completed" && data.membershipTier in tierPrices
            ? tierPrices[data.membershipTier]
            : 0,
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
      // Adjust current page if deleting the last member on a page
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

  useEffect(() => {
    if (selectedType) {
      fetchMembers(selectedType);
    }
  }, [selectedType]);

  const handleMembershipClick = (type: "personal" | "organization") => {
    setSelectedType(type);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filter members based on search term
  const filteredMembers = members.filter((member) => {
    const searchValue = searchTerm.toLowerCase();
    const nameToSearch =
      member.type === "personal" ? member.name?.toLowerCase() : member.organizationName?.toLowerCase();
    return nameToSearch?.includes(searchValue) || false;
  });

  // Pagination logic
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
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

        {/* Search Bar */}
        {selectedType && (
          <div className="mb-6">
            <input
              type="text"
              placeholder={`Search by ${selectedType === "personal" ? "name" : "organization name"}...`}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full max-w-md border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="py-3 px-4 text-left">
                      {selectedType === "personal" ? "Name" : "Organization Name"}
                    </th>
                    {selectedType === "personal" && (
                      <th className="py-3 px-4 text-left">Gender</th>
                    )}
                    <th className="py-3 px-4 text-left">Amount Paid</th>
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
                        {selectedType === "personal" && (
                          <td className="py-3 px-4">{member.gender || "N/A"}</td>
                        )}
                        <td className="py-3 px-4">₦{member.amountPaid.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={selectedType === "personal" ? 4 : 3}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
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
                ))}
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