"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Sample owner data
const sampleOwners = [
  {
    id: 1,
    storeName: "Tech Paradise",
    number: "+1 (555) 123-4567",
    place: "New York, NY",
    productCount: 245,
    createdAt: "2023-01-15",
    status: "active",
  },
  {
    id: 2,
    storeName: "Fashion Hub",
    number: "+1 (555) 234-5678",
    place: "Los Angeles, CA",
    productCount: 189,
    createdAt: "2023-02-22",
    status: "active",
  },
  {
    id: 3,
    storeName: "Fitness Center",
    number: "+1 (555) 345-6789",
    place: "Chicago, IL",
    productCount: 156,
    createdAt: "2023-03-10",
    status: "inactive",
  },
  {
    id: 4,
    storeName: "Coffee Roasters",
    number: "+1 (555) 456-7890",
    place: "Seattle, WA",
    productCount: 89,
    createdAt: "2023-04-05",
    status: "active",
  },
  {
    id: 5,
    storeName: "Gaming World",
    number: "+1 (555) 567-8901",
    place: "Austin, TX",
    productCount: 312,
    createdAt: "2023-05-18",
    status: "active",
  },
  {
    id: 6,
    storeName: "Mobile Accessories",
    number: "+1 (555) 678-9012",
    place: "Miami, FL",
    productCount: 203,
    createdAt: "2023-06-12",
    status: "inactive",
  },
  {
    id: 7,
    storeName: "Home Decor Plus",
    number: "+1 (555) 789-0123",
    place: "Denver, CO",
    productCount: 167,
    createdAt: "2023-07-03",
    status: "active",
  },
  {
    id: 8,
    storeName: "Sports Equipment",
    number: "+1 (555) 890-1234",
    place: "Boston, MA",
    productCount: 278,
    createdAt: "2023-08-20",
    status: "active",
  },
];

// Desktop Table Component
const DesktopOwnerTable = ({ owners, onToggleStatus }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(owners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOwners = owners.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Owner Management - Desktop View
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Store Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Contact & Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentOwners.map((owner: any) => (
              <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 text-sm">
                    {owner.storeName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <div className="text-sm text-gray-900">{owner.number}</div>
                    <div className="text-sm text-gray-500">{owner.place}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    {owner.productCount} items
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(owner.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onToggleStatus(owner.id)}
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors hover:opacity-80 ${
                      owner.status === "active"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {owner.status === "active" ? "Active" : "Inactive"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(endIndex, owners.length)} of{" "}
          {owners.length} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Mobile Cards Component
const MobileOwnerCards = ({ owners, onToggleStatus }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(owners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOwners = owners.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Owner Management - Mobile View
        </h2>
      </div>

      {/* Owner Cards */}
      <div className="space-y-3">
        {currentOwners.map((owner: any) => (
          <div
            key={owner.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="space-y-3">
              {/* Store Name and Status */}
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-900 text-base leading-tight flex-1 mr-2">
                  {owner.storeName}
                </h3>
                <button
                  onClick={() => onToggleStatus(owner.id)}
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap cursor-pointer transition-colors hover:opacity-80 ${
                    owner.status === "active"
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  {owner.status === "active" ? "Active" : "Inactive"}
                </button>
              </div>

              {/* Contact Information */}
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Phone:</span>
                  <span>{owner.number}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Location:</span>
                  <span>{owner.place}</span>
                </div>
              </div>

              {/* Product Count and Date */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {owner.productCount} items
                </div>
                <div className="text-sm text-gray-500">
                  Created: {formatDate(owner.createdAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Pagination */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages} ({owners.length} total)
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              <span className="ml-1">Previous</span>
            </button>

            <span className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg">
              {currentPage}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-1">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component that shows both views
const OwnerManagementDemo = () => {
  const [owners, setOwners] = useState(sampleOwners);

  const toggleStatus = (ownerId: number) => {
    setOwners((prevOwners) =>
      prevOwners.map((owner) =>
        owner.id === ownerId
          ? {
              ...owner,
              status: owner.status === "active" ? "inactive" : "active",
            }
          : owner
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Desktop View */}
        <div className="hidden lg:block">
          <DesktopOwnerTable owners={owners} onToggleStatus={toggleStatus} />
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          <MobileOwnerCards owners={owners} onToggleStatus={toggleStatus} />
        </div>
      </div>
    </div>
  );
};

export default OwnerManagementDemo;
