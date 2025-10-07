"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  phoneNumber: string;
  type: "admin";
  createdAt: string;
  updatedAt: string;
}

const AdminLayout = ({ children, params }: any) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Unwrap params using React.use()
  const resolvedParams: any = React.use(params);
  const userid = resolvedParams.userid;

  // Function to get cookie value by name (client-side)
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  };

  useEffect(() => {
    // Check if user is authenticated and get user data
    const checkAuth = () => {
      const token = getCookie("token");
      const userData = getCookie("user-info");
      if (!token || !userData) {
        // Redirect to signin if no token or user data
        router.push("/signin");
        return;
      }

      try {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);

        // Verify that the user can access this specific admin panel
        if (parsedUser.username !== userid || parsedUser.type !== "admin") {
          console.log(
            `User ${parsedUser.username} trying to access admin panel without proper permissions`
          );
          router.push("/signin");
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/signin");
      }
    };

    checkAuth();
  }, [userid, router]);

  // Admin menu items
  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      href: `/${userid}/panel`,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z"
          />
        </svg>
      ),
    },
    {
      id: "user-management",
      name: "User Management",
      href: `/${userid}/panel/user-management`,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
    },
    {
      id: "plan-master",
      name: "Plan Master",
      href: `/${userid}/panel/plan-management`,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      id: "plan-history",
      name: "Plan History",
      href: `/${userid}/panel/plan-history`,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  // Handle logout
  const handleLogout = () => {
    // Delete cookies by setting them to expire
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Redirect to signin page
    router.push("/signin");
  };

  // Function to get current page name from pathname
  const getCurrentPageName = () => {
    const segments = pathname.split("/");
    const lastSegment = segments[segments.length - 1];

    if (lastSegment === "panel" || lastSegment === userid) {
      return "Dashboard";
    }

    const menuItem = menuItems.find((item) => item.href === pathname);
    return menuItem ? menuItem.name : "Dashboard";
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-all duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg
                className="h-8 w-8 text-white"
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
            </div>
            <div>
              <h1 className="text-white text-xl font-bold tracking-wide">
                Admin Panel
              </h1>
              <p className="text-blue-100 text-xs font-medium">
                Management System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex-1 px-6 pb-6 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-4 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                    : "text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                <div
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    pathname === item.href
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                  }`}
                >
                  {item.icon}
                </div>
                <span className="font-semibold">{item.name}</span>
                {pathname === item.href && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Role indicator */}
          <div className="mt-8 px-4">
            <div className="px-4 py-3 rounded-xl text-xs font-bold text-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                ADMIN ACCESS
              </div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
              <span className="text-white text-lg font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user.username}
              </p>
              <p className="text-xs text-slate-600 truncate">
                {user.type} • {user.phoneNumber}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Logout"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 z-30">
          <div className="flex items-center justify-between px-6 lg:px-8 py-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Breadcrumb */}
              <nav className="hidden sm:flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-3 text-sm">
                  <li>
                    <Link
                      href={`/${userid}/panel`}
                      className="text-slate-500 hover:text-blue-600 transition-colors font-medium"
                    >
                      Admin
                    </Link>
                  </li>
                  <li>
                    <svg
                      className="h-4 w-4 mx-1 text-slate-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </li>
                  <li className="text-slate-900 font-bold">
                    {getCurrentPageName()}
                  </li>
                </ol>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg">
                  0
                </span>
              </button>

              {/* Status indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700">Online</span>
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-sm font-bold text-slate-700">
                    {user.username}
                  </span>
                  <svg
                    className="hidden sm:block h-4 w-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content - This will change based on the current page */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
