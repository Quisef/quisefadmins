"use client";
import PageHeader from "@/components/pageHeader";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  startAfter,
  endBefore,
} from "firebase/firestore";
import { Loader2, Trash2, Edit, X } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
}

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDoc, setLastDoc] = useState<any>(null); // For "Next" pagination
  const [firstDoc, setFirstDoc] = useState<any>(null); // For "Previous" pagination
  const [totalContacts, setTotalContacts] = useState(0);
  const contactsPerPage = 6; // Number of contacts per page

  // Fetch contacts with pagination
  useEffect(() => {
    const contactsRef = collection(db, "contacts");
    let q = query(contactsRef, orderBy("name"), limit(contactsPerPage));

    if (currentPage > 1 && lastDoc) {
      q = query(contactsRef, orderBy("name"), startAfter(lastDoc), limit(contactsPerPage));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const contactList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Contact[];
        setContacts(contactList);

        // Set pagination cursors
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          setFirstDoc(snapshot.docs[0]);
        }

        // Get total count (for pagination controls) - this is a one-time fetch
        if (totalContacts === 0) {
          const totalQuery = query(contactsRef);
          onSnapshot(totalQuery, (totalSnapshot) => {
            setTotalContacts(totalSnapshot.docs.length);
          });
        }
      },
      (error) => {
        setError("Failed to fetch contacts");
        console.error(error);
      }
    );

    return () => unsubscribe();
  }, [currentPage, lastDoc]);

  // Update Contact
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;

    setIsLoading(true);
    setError(null);

    try {
      const contactDoc = doc(db, "contacts", editingContact.id); // Changed to "messages" to match fetch
      await updateDoc(contactDoc, {
        name: editingContact.name,
        email: editingContact.email,
        message: editingContact.message,
      });
      setEditingContact(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Contact
  const handleDelete = async (id: string) => {
    try {
      const contactDoc = doc(db, "contacts", id); // Changed to "messages"
      await deleteDoc(contactDoc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deletion failed");
    }
  };

  // Filtered Contacts (client-side filtering after pagination)
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination controls
  const totalPages = Math.ceil(totalContacts / contactsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      // Reset lastDoc to fetch from the previous page correctly
      setLastDoc(firstDoc);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Contacts Management</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search contacts"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Contact</h2>
              <button
                onClick={() => setEditingContact(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={editingContact.name}
                onChange={(e) =>
                  setEditingContact((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={editingContact.email}
                onChange={(e) =>
                  setEditingContact((prev) =>
                    prev ? { ...prev, email: e.target.value } : null
                  )
                }
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Message"
                value={editingContact.message}
                onChange={(e) =>
                  setEditingContact((prev) =>
                    prev ? { ...prev, message: e.target.value } : null
                  )
                }
                className="w-full p-2 border rounded min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
                >
                  {isLoading && <Loader2 className="mr-2 animate-spin" />}
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{contact.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingContact(contact)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-gray-600">{contact.email}</p>
            <p className="text-gray-500 mt-2 line-clamp-3">{contact.message}</p>
          </div>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <p className="text-center text-gray-500">
          {contacts.length === 0
            ? "No contacts found."
            : "No contacts match your search."}
        </p>
      )}

      {/* Pagination Controls */}
      {totalContacts > contactsPerPage && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || contacts.length < contactsPerPage}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;