import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Search, 
  BarChart3, 
  Settings, 
  Shield, 
  Bell, 
  User, 
  Menu, 
  X, 
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { DashboardHome, ScanManager, Reports, UserSettings } from '../components/dashboard';

const Dashboard: React.FC = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get the active section from the URL
  const getActiveSection = () => {
    if (location === '/dashboard') return 'home';
    if (location === '/dashboard/scans') return 'scans';
    if (location === '/dashboard/reports') return 'reports';
    if (location === '/dashboard/settings') return 'settings';
    return 'home';
  };

  const activeSection = getActiveSection();

  // Render the appropriate content based on the active section
  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <DashboardHome />;
      case 'scans':
        return <ScanManager />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <UserSettings />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark text-gray-100 font-sans antialiased flex flex-col">
      <Helmet>
        <title>Dashboard | SecureScan AI</title>
        <meta name="description" content="Manage your web security scans and reports" />
      </Helmet>

      {/* Top Navigation Bar */}
      <header className="bg-primary-medium/80 backdrop-blur-md border-b border-accent-blue/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-accent-blue" />
                <span className="text-xl font-bold tracking-tight">SecureScan<span className="text-accent-blue">AI</span></span>
              </div>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-gray-300 hover:text-accent-blue"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Right Navigation */}
            <div className="hidden md:flex items-center space-x-5">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-accent-blue">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="bg-accent-blue/20 p-1 rounded-full">
                  <User className="h-6 w-6 text-accent-blue" />
                </div>
                <span className="text-sm">Demo User</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Hidden on Mobile */}
        <aside className="hidden md:block w-64 bg-primary-medium/30 border-r border-accent-blue/20">
          <nav className="p-4 sticky top-16">
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard">
                  <a className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'home' 
                      ? 'bg-accent-blue/20 text-accent-blue' 
                      : 'text-gray-300 hover:text-gray-100 hover:bg-primary-medium/50'
                  }`}>
                    <LayoutDashboard className="mr-3 h-5 w-5" />
                    <span>Dashboard</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/scans">
                  <a className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'scans' 
                      ? 'bg-accent-blue/20 text-accent-blue' 
                      : 'text-gray-300 hover:text-gray-100 hover:bg-primary-medium/50'
                  }`}>
                    <Search className="mr-3 h-5 w-5" />
                    <span>Scan Manager</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/reports">
                  <a className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'reports' 
                      ? 'bg-accent-blue/20 text-accent-blue' 
                      : 'text-gray-300 hover:text-gray-100 hover:bg-primary-medium/50'
                  }`}>
                    <BarChart3 className="mr-3 h-5 w-5" />
                    <span>Reports</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings">
                  <a className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'settings' 
                      ? 'bg-accent-blue/20 text-accent-blue' 
                      : 'text-gray-300 hover:text-gray-100 hover:bg-primary-medium/50'
                  }`}>
                    <Settings className="mr-3 h-5 w-5" />
                    <span>Settings</span>
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Mobile Menu - Only visible when mobileMenuOpen is true */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-primary-dark z-40 md:hidden">
            <div className="p-4">
              <div className="flex justify-end">
                <button
                  className="text-gray-300 hover:text-accent-blue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>
              <nav className="mt-8">
                <ul className="space-y-4">
                  <li>
                    <Link href="/dashboard">
                      <a 
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeSection === 'home' 
                            ? 'bg-accent-blue/20 text-accent-blue' 
                            : 'text-gray-300 hover:text-gray-100 hover:bg-primary-medium/50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        <span>Dashboard</span>
                        <ChevronRight className="ml-auto h-5 w-5" />
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/scans">
                      <a 
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeSection === 'scans' 
                            ? 'bg-accent-blue/20 text-accent-blue' 
                            : 'text-gray-300 hover:text-gray-100 hover:bg-primary-medium/50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Search className="mr-3 h-5 w-5" />
                        <span>Scan Manager</span>
                        <ChevronRight className="ml-auto h-5 w-5" />
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/reports">
                      <a 
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeSection === 'reports' 
                            ? 'bg-accent-blue/20 text-accent-blue' 
                            : 'text-gray-300 hover:text-gray-100 hover:bg-primary-medium/50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <BarChart3 className="mr-3 h-5 w-5" />
                        <span>Reports</span>
                        <ChevronRight className="ml-auto h-5 w-5" />
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/settings">
                      <a 
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                          activeSection === 'settings' 
                            ? 'bg-accent-blue/20 text-accent-blue' 
                            : 'text-gray-300 hover:text-gray-100 hover:bg-primary-medium/50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="mr-3 h-5 w-5" />
                        <span>Settings</span>
                        <ChevronRight className="ml-auto h-5 w-5" />
                      </a>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;