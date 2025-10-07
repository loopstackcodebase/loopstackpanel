// app/(admins)/[userid]/panel/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  overall: {
    totalOwners: number;
    totalProducts: number;
    subscribedOwners: number;
    freePlanOwners: number;
    totalRevenue: number;
  };
  today: {
    registrations: number;
    totalProducts: number;
    subscribedOwners: number;
    freePlanRegistrations: number;
    todayRevenue: number;
  };
}

const DashboardPage = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Function to get cookie value by name
      const getCookie = (name: string): string | null => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          return parts.pop()?.split(";").shift() || null;
        }
        return null;
      };
      
      const token = getCookie("token");
      
      const response = await fetch('/api/admin/dashboard/stats', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || 'Failed to fetch dashboard statistics');
      }
    } catch (error) {
      setError('Failed to fetch dashboard statistics');
      console.error('Dashboard stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'dashboard':
        // Already on dashboard
        break;
      case 'plan-management':
        router.push(window.location.pathname.replace('/panel', '/panel/plan-management'));
        break;
      case 'plan-history':
        router.push(window.location.pathname.replace('/panel', '/panel/plan-history'));
        break;
      case 'user-management':
        router.push(window.location.pathname.replace('/panel', '/panel/user-management'));
        break;
    }
  };

  const overallStatsCards = [
    {
      title: "Total Owners",
      value: loading ? "..." : stats?.overall.totalOwners.toLocaleString() || "0",
      icon: (
        <svg
          className="h-8 w-8 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 6a3 3 0 106 0 3 3 0 00-6 0zm9 6a2 2 0 11-4 0 2 2 0 014 0zm-5 7a4 4 0 00-8 0v1h8v-1z"
          />
        </svg>
      ),
    },
    {
      title: "Total Products",
      value: loading ? "..." : stats?.overall.totalProducts.toLocaleString() || "0",
      icon: (
        <svg
          className="h-8 w-8 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      title: "Subscribed Owners",
      value: loading ? "..." : stats?.overall.subscribedOwners.toLocaleString() || "0",
      icon: (
        <svg
          className="h-8 w-8 text-purple-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
    },
    {
      title: "Free Plan Users",
      value: loading ? "..." : stats?.overall.freePlanOwners.toLocaleString() || "0",
      icon: (
        <svg
          className="h-8 w-8 text-orange-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
    },
  ];

  const todayStatsCards = [
    {
      title: "New Registrations",
      value: loading ? "..." : stats?.today.registrations.toLocaleString() || "0",
      icon: (
        <svg
          className="h-8 w-8 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
    },
    {
      title: "Products Added",
      value: loading ? "..." : stats?.today.totalProducts.toLocaleString() || "0",
      icon: (
        <svg
          className="h-8 w-8 text-cyan-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    },
    {
      title: "New Subscriptions",
      value: loading ? "..." : stats?.today.subscribedOwners.toLocaleString() || "0",
      icon: (
        <svg
          className="h-8 w-8 text-indigo-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      title: "Free Plan Signups",
      value: loading ? "..." : stats?.today.freePlanRegistrations.toLocaleString() || "0",
      icon: (
        <svg
          className="h-8 w-8 text-rose-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      ),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, here's what's happening with your store today.
            </p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
          <button 
            onClick={fetchDashboardStats}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, here's what's happening with your store today.
          </p>
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Overall Statistics</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span>{loading ? 'Loading...' : 'Live data'}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {overallStatsCards.map((card, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-50 p-3 rounded-xl">{card.icon}</div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {card.value}
                </h3>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Stats Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Today's Activity</h2>
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Last 24 hours</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {todayStatsCards.map((card, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white p-3 rounded-xl shadow-sm">{card.icon}</div>
                <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg text-green-700 bg-green-50">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Today
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {card.value}
                </h3>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Section - Replacing Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>Revenue Analytics</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 p-3 rounded-xl">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-lg">
                Total
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                ${loading ? "..." : stats?.overall.totalRevenue?.toLocaleString() || "0"}
              </h3>
              <p className="text-green-700 text-sm font-medium">Total Revenue</p>
            </div>
          </div>

          {/* Today's Revenue */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-xl">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">
                Today
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                ${loading ? "..." : stats?.today.todayRevenue?.toLocaleString() || "0"}
              </h3>
              <p className="text-blue-700 text-sm font-medium">Today's Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;