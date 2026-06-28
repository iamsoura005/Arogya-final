import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, MessageSquare, Beaker, Calendar, Pill, 
  Users, BarChart3, AlertTriangle, Shield, Sparkles, 
  Smartphone, Settings, LogOut, Stethoscope, Menu, X, Heart
} from 'lucide-react';

export type SidebarPage = 
  | 'dashboard' 
  | 'consultation' 
  | 'lab-reports' 
  | 'appointments' 
  | 'medications' 
  | 'health-cards' 
  | 'family-hub' 
  | 'analytics' 
  | 'benchmarking' 
  | 'model-comparison' 
  | 'compliance' 
  | 'emergency' 
  | 'export'
  | 'personal-dashboard';

interface SidebarProps {
  activePage: SidebarPage;
  setActivePage: (page: SidebarPage) => void;
  onLogout: () => void;
  user: any;
}

export default function Sidebar({ activePage, setActivePage, onLogout, user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, color: 'text-teal-400' },
    { id: 'consultation', label: 'AI Consultation Hub', icon: MessageSquare, color: 'text-emerald-400' },
    { id: 'lab-reports', label: 'Lab Report Analyzer', icon: Beaker, color: 'text-indigo-400' },
    { id: 'appointments', label: 'Appointment Scheduler', icon: Calendar, color: 'text-blue-400' },
    { id: 'medications', label: 'Medication Tracker', icon: Pill, color: 'text-purple-400' },
    { id: 'health-cards', label: 'Health Card Generator', icon: Sparkles, color: 'text-amber-400' },
    { id: 'family-hub', label: 'Family Health Hub', icon: Users, color: 'text-pink-400' },
    { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3, color: 'text-teal-400' },
    { id: 'benchmarking', label: 'LLM Benchmarks', icon: BarChart3, color: 'text-sky-400' },
    { id: 'model-comparison', label: 'Side-by-Side Comparison', icon: Settings, color: 'text-indigo-400' },
    { id: 'compliance', label: 'HIPAA & Compliance', icon: Shield, color: 'text-slate-400' },
    { id: 'emergency', label: 'Emergency Center', icon: AlertTriangle, color: 'text-red-400' },
    { id: 'personal-dashboard', label: 'Personal Dashboard', icon: Heart, color: 'text-rose-450' },
    { id: 'export', label: 'Export Data', icon: Smartphone, color: 'text-gray-400' },
  ] as const;

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-900 px-5 py-4 flex items-center justify-between z-40">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-slate-950" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Arogya</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 border border-slate-800 rounded-lg text-slate-450 hover:text-white"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Drawer */}
      <div
        className={`fixed inset-y-0 left-0 bg-slate-950 border-r border-slate-900 z-50 w-72 transform lg:transform-none lg:opacity-100 lg:relative lg:flex flex-col justify-between py-6 px-4 transition-all duration-300 overflow-y-auto scrollbar-thin h-screen lg:h-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/10">
              <Stethoscope className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-350 to-emerald-350 bg-clip-text text-transparent tracking-tight">
              Arogya
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-500/10 text-teal-350 border-l-4 border-teal-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Card & Logout */}
        <div className="space-y-4 pt-6 border-t border-slate-900 px-2 mt-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm font-bold text-teal-400 shadow-inner">
              {user?.firstName?.[0] || user?.name?.[0] || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-200 truncate">{user?.firstName || user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-slate-450 hover:text-slate-200 text-sm font-semibold hover:bg-slate-900/40 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5 text-slate-550" />
            <span>Logout Profile</span>
          </button>
        </div>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-xs"
        />
      )}
    </>
  );
}
