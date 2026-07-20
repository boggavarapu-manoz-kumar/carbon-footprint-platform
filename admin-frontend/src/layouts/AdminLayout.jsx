import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/navigation/Sidebar';
import { TopNavbar } from '../components/navigation/TopNavbar';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';

export const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden w-full">
      {/* Sidebar Navigation */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar />
        
        {/* Breadcrumbs */}
        <Breadcrumbs />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
