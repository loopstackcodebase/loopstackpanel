"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User, Store, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BASE_STORE_URL } from "@/utils/constant";

interface UserData {
  _id: string;
  username: string;
  phoneNumber: string;
  email?: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface StoreData {
  _id: string;
  storeName: string;
  displayName: string;
  products: string;
  email: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    user: UserData;
    store: StoreData | null;
  };
  error?: string;
}

export default function UserView() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [storeData, setStoreData] = useState<StoreData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userId = params.id as string;
        
        // Get token from cookies
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
          
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await fetch(`/api/admin/owner-list/view/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data: ApiResponse = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch user data");
        }
        
        setUserData(data.data.user);
        setStoreData(data.data.store);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params.id]);

  const goBack = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Button 
          variant="outline" 
          onClick={goBack}
          className="mb-6 hover:cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <Button 
        variant="outline" 
        onClick={goBack}
        className="mb-6 hover:cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">User Details</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-500 p-4 flex items-center">
            <User className="h-6 w-6 text-white mr-2" />
            <h2 className="text-xl font-semibold text-white">User Information</h2>
          </div>
          
          <div className="p-4 sm:p-6">
            {userData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">{userData.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{userData.phoneNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{userData.email || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      userData.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {userData.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">User Type</p>
                    <p className="font-medium capitalize">{userData.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-medium text-xs sm:text-sm truncate">{userData._id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">{formatDate(userData.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">{formatDate(userData.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Store Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-500 p-4 flex items-center">
            <Store className="h-6 w-6 text-white mr-2" />
            <h2 className="text-xl font-semibold text-white">Store Information</h2>
          </div>
          
          <div className="p-4 sm:p-6">
            {storeData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Store Name</p>
                    <p className="font-medium">{storeData.displayName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Products</p>
                    <p className="font-medium">{storeData.products}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Store Email</p>
                  <p className="font-medium">{storeData.email || "Not provided"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Store ID</p>
                  <p className="font-medium text-xs sm:text-sm truncate">{storeData._id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Store Link</p>
                  <a 
                    href={`${BASE_STORE_URL}/${storeData.storeName}/products`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    Visit Store <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">No store information available for this user.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}