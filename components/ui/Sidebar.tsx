import React, { useState, useMemo } from 'react';
import { User, Permission } from '../../types';
import { 
  IconLayoutDashboard, IconClock, IconLogout, IconPlus, 
  IconChevronLeft, IconChevronRight, IconChevronDown, IconWorld, IconClipboardList, 
  IconMapPin, IconChartBar, IconSearch, IconRetention, IconCalendar, 
  IconUsers, IconFileAnalytics, IconTrash, IconFingerprint, IconSparkles,
  IconBell, IconShieldCheck, IconDatabase, IconX
} from './Icon';
import { Search } from 'lucide-react';
import { haptic } from '../../utils/haptics';

export interface SidebarProps {
  currentUser: User;
  currentView: string;
  isMinimized: boolean;
  isOpenOnMobile: boolean;
  onNavigate: (view: any) => void;
  onNewService: () => void;
  onOpenSettings?: () => void;
  onLogout: () => void;
  onToggleDesktop: () => void;
  onCloseMobile: () => void;
  logoUrl?: string;
  logoHasError: boolean;
  onLogoError: () => void;
  onOpenChangePassword?: () => void;
  onOpenDesktopInstall?: () => void;
}

interface NavItemDef {
  id: string;
  label: string;
  icon: React.ReactElement;
  category: 'OPERATIONS' | 'CUSTOMERS' | 'WORKSHOP' | 'ADMINISTRATION';
  permissionCheck?: () => boolean;
  badge?: string | number;
}

const NavLinkItem: React.FC<{
  icon: React.ReactElement;
  label: string;
  categoryTag: string;
  isActive: boolean;
  isMinimized: boolean;
  onClick: () => void;
  badge?: string | number;
}> = ({ icon, label, categoryTag, isActive, isMinimized, onClick, badge }) => {
  const styledIcon = React.cloneElement(icon as React.ReactElement<any>, {
    className: `w-5 h-5 transition-transform duration-200 group-hover:scale-105`
  });

  return (
    <li className="relative list-none group">
      <button
        onClick={onClick}
        aria-label={label}
        className={`w-full flex items-center px-3 py-2 min-h-[44px] text-sm font-semibold rounded-xl transition-all duration-150 active:scale-[0.99] select-none ${
          isActive
            ? 'text-amber-300 bg-amber-400/15 shadow-sm border border-amber-400/30'
            : 'text-slate-300 hover:text-white hover:bg-white/5'
        } ${isMinimized ? 'justify-center px-0' : ''}`}
      >
        {isActive && !isMinimized && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-brand-accent rounded-r-full shadow-[0_0_8px_rgba(248,191,42,0.8)]"></div>
        )}
        <div className={`
          flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 flex-shrink-0
          ${isActive 
            ? 'bg-brand-accent text-brand-blue shadow-md'
            : 'bg-white/5 group-hover:bg-white/10 text-slate-300'
          }`
        }>
          {styledIcon}
        </div>
        {!isMinimized && (
          <div className="ml-3 flex-1 flex items-center justify-between min-w-0 text-left">
            <span className="truncate font-medium text-[13px]">{label}</span>
            {badge !== undefined && (
              <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 flex-shrink-0">
                {badge}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Popover label for Desktop Minimized mode */}
      {isMinimized && (
        <div className="fixed left-20 z-[100] hidden group-hover:flex items-center gap-2 bg-slate-900 border border-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap pointer-events-none animate-in fade-in slide-in-from-left-2 duration-150">
          <span className="font-bold text-slate-100">{label}</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-extrabold tracking-wider border border-amber-400/30">
            {categoryTag}
          </span>
        </div>
      )}
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentView,
  isMinimized,
  isOpenOnMobile,
  onNavigate,
  onNewService,
  onLogout,
  onToggleDesktop,
  onCloseMobile,
  logoUrl,
  logoHasError,
  onLogoError,
}) => {
  const hasPermission = (p: Permission) => currentUser.permissions.includes(p);
  const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager';
  const isAgentOrTech = currentUser.role === 'agent' || currentUser.role === 'technician';

  // Desktop minimized status (mobile drawer is always full-width with labels)
  const effectiveMinimized = isMinimized && !isOpenOnMobile;

  // Search filter query for rapid page accessibility
  const [searchQuery, setSearchQuery] = useState('');

  // Simplified Collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    OPERATIONS: true,
    CUSTOMERS: true,
    WORKSHOP: true,
    ADMINISTRATION: true,
  });

  const toggleSection = (key: string) => {
    haptic.light();
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNavClick = (targetView: string) => {
    haptic.selection();
    onNavigate(targetView);
    if (isOpenOnMobile) {
      onCloseMobile();
    }
  };

  const handleNewServiceClick = () => {
    haptic.medium();
    onNewService();
    if (isOpenOnMobile) {
      onCloseMobile();
    }
  };

  // Canonical definition of all simplified navigation pages
  const allNavItems: NavItemDef[] = useMemo(() => {
    return [
      // 1. OPERATIONS (Daily Work)
      {
        id: 'DASHBOARD',
        label: 'Dashboard',
        icon: <IconLayoutDashboard />,
        category: 'OPERATIONS',
        permissionCheck: () => hasPermission(Permission.CAN_VIEW_DASHBOARD),
      },
      {
        id: 'APPOINTMENTS_OVERVIEW',
        label: 'My Schedule',
        icon: <IconCalendar />,
        category: 'OPERATIONS',
        permissionCheck: () => isAgentOrTech && hasPermission(Permission.CAN_VIEW_APPOINTMENTS_OVERVIEW),
      },
      {
        id: 'LIST',
        label: 'Service Orders',
        icon: <IconClock />,
        category: 'OPERATIONS',
        permissionCheck: () => hasPermission(Permission.CAN_VIEW_SERVICE_HISTORY),
      },
      {
        id: 'SERVICE_REQUEST',
        label: 'Web Leads',
        icon: <IconClipboardList />,
        category: 'OPERATIONS',
        permissionCheck: () => hasPermission(Permission.CAN_VIEW_SERVICE_REQUESTS),
      },
      {
        id: 'LIVE_MAP',
        label: 'Fleet Tracker',
        icon: <IconMapPin />,
        category: 'OPERATIONS',
        permissionCheck: () => hasPermission(Permission.CAN_VIEW_LIVE_MAP),
      },

      // 2. CUSTOMERS (CRM & Retention)
      {
        id: 'CUSTOMER_HISTORY',
        label: 'Customer Search',
        icon: <IconSearch />,
        category: 'CUSTOMERS',
        permissionCheck: () => hasPermission(Permission.CAN_VIEW_CUSTOMER_HISTORY),
      },
      {
        id: 'CUSTOMER_BOOK',
        label: 'Customer Book',
        icon: <IconUsers />,
        category: 'CUSTOMERS',
        permissionCheck: () => hasPermission(Permission.CAN_VIEW_CUSTOMER_HISTORY),
      },
      {
        id: 'RETENTION',
        label: 'Retention & Followups',
        icon: <IconRetention />,
        category: 'CUSTOMERS',
        permissionCheck: () => hasPermission(Permission.CAN_VIEW_RETENTION_DASHBOARD),
      },
      {
        id: 'NOTIFICATIONS',
        label: 'Service Reminders',
        icon: <IconBell />,
        category: 'CUSTOMERS',
        permissionCheck: () => isAdminOrManager,
      },
      {
        id: 'WARRANTY_TRACKER',
        label: 'Warranties',
        icon: <IconShieldCheck />,
        category: 'CUSTOMERS',
        permissionCheck: () => hasPermission(Permission.CAN_VIEW_CUSTOMER_HISTORY),
      },

      // 3. WORKSHOP & FINANCE
      {
        id: 'ERP_MANAGEMENT',
        label: 'ERP Operations',
        icon: <IconClipboardList />,
        category: 'WORKSHOP',
        permissionCheck: () => hasPermission(Permission.CAN_VIEW_ANALYTICS),
      },
      {
        id: 'INVENTORY_FORECASTING',
        label: 'Stock Forecast',
        icon: <IconSparkles />,
        category: 'WORKSHOP',
        permissionCheck: () => hasPermission(Permission.CAN_VIEW_ANALYTICS),
      },
      {
        id: 'EXPENSES',
        label: 'Expenses',
        icon: <IconFileAnalytics />,
        category: 'WORKSHOP',
        permissionCheck: () => hasPermission(Permission.CAN_LOG_EXPENSES) || hasPermission(Permission.CAN_MANAGE_SPEND_CATEGORIES),
      },
      {
        id: 'PROFIT_LOSS',
        label: 'Profit & Loss',
        icon: <IconFileAnalytics />,
        category: 'WORKSHOP',
        permissionCheck: () => hasPermission(Permission.CAN_VIEW_PROFIT_LOSS),
      },
      {
        id: 'ANALYTICS',
        label: 'Business Analytics',
        icon: <IconChartBar />,
        category: 'WORKSHOP',
        permissionCheck: () => hasPermission(Permission.CAN_VIEW_ANALYTICS),
      },

      // 4. ADMINISTRATION & MASTERS (Admin / Manager)
      {
        id: 'USER_MANAGEMENT',
        label: 'Staff Access',
        icon: <IconUsers />,
        category: 'ADMINISTRATION',
        permissionCheck: () => hasPermission(Permission.CAN_MANAGE_USERS),
      },
      {
        id: 'ATTENDANCE_MANAGEMENT',
        label: 'Attendance Logs',
        icon: <IconFingerprint />,
        category: 'ADMINISTRATION',
        permissionCheck: () => hasPermission(Permission.CAN_MANAGE_USERS),
      },
      {
        id: 'SERVICE_CATALOG',
        label: 'Service Catalog',
        icon: <IconClipboardList />,
        category: 'ADMINISTRATION',
        permissionCheck: () => hasPermission(Permission.CAN_MANAGE_SERVICES),
      },
      {
        id: 'SERVICE_TEMPLATE_MANAGEMENT',
        label: 'Forms & Custom Fields',
        icon: <IconWorld />,
        category: 'ADMINISTRATION',
        permissionCheck: () => hasPermission(Permission.CAN_MANAGE_SERVICES),
      },
      {
        id: 'CAR_DATABASE',
        label: 'Car Database',
        icon: <IconDatabase />,
        category: 'ADMINISTRATION',
        permissionCheck: () => hasPermission(Permission.CAN_MANAGE_SERVICES),
      },
      {
        id: 'HUB_MANAGEMENT',
        label: 'Hub Management',
        icon: <IconMapPin />,
        category: 'ADMINISTRATION',
        permissionCheck: () => hasPermission(Permission.CAN_MANAGE_SERVICES),
      },
      {
        id: 'TRASH',
        label: 'Trash Bin',
        icon: <IconTrash />,
        category: 'ADMINISTRATION',
        permissionCheck: () => hasPermission(Permission.CAN_VIEW_TRASH),
      },
    ];
  }, [currentUser]);

  // Filter items by permission and optional search query
  const visibleItems = useMemo(() => {
    return allNavItems.filter(item => {
      const allowed = item.permissionCheck ? item.permissionCheck() : true;
      if (!allowed) return false;
      if (!searchQuery.trim()) return true;
      return item.label.toLowerCase().includes(searchQuery.trim().toLowerCase());
    });
  }, [allNavItems, searchQuery]);

  const categories = [
    { key: 'OPERATIONS', label: 'Operations' },
    { key: 'CUSTOMERS', label: 'Customers & CRM' },
    { key: 'WORKSHOP', label: 'Workshop & Finance' },
    { key: 'ADMINISTRATION', label: 'Administration' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 bg-[#071629] flex flex-col no-print border-r border-slate-800/90 shadow-2xl
    transition-transform transform md:transition-all md:transform-none duration-300 ease-in-out
    ${isOpenOnMobile ? 'translate-x-0 ring-1 ring-white/10' : '-translate-x-full'}
    ${effectiveMinimized ? 'md:w-20' : 'md:w-64'}
    w-72 sm:w-80 max-w-[85vw]
  `;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside 
        className={sidebarClasses}
        role="navigation"
        aria-label="Main Navigation Sidebar"
        style={{
          paddingTop: 'max(0px, env(safe-area-inset-top, 0px))',
          paddingBottom: 'max(0px, env(safe-area-inset-bottom, 0px))'
        }}
      >
        {/* Brand & Top Bar */}
        <div className="flex items-center justify-between h-16 sm:h-20 border-b border-white/5 px-4 flex-shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="bg-white rounded-xl p-1.5 h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center flex-shrink-0 shadow-lg ring-1 ring-white/20">
              {logoUrl && !logoHasError ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full rounded-lg object-cover" onError={onLogoError} />
              ) : (
                <img src="https://pub-d1d6c35dc7024f819f155246a42ea32b.r2.dev/Website%20Assets/logo/bigengine%203.png" alt="A Big Engine" className="h-full w-full object-contain" />
              )}
            </div>
            {!effectiveMinimized && (
              <div className="whitespace-nowrap">
                <h1 className="text-base sm:text-lg font-black tracking-tighter uppercase leading-none">
                  <span className="text-white">A BIG </span><br/>
                  <span className="text-brand-accent">ENGINE</span>
                </h1>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Desktop Minimize/Expand Toggle */}
            {!effectiveMinimized && (
              <button 
                onClick={onToggleDesktop} 
                title="Collapse Sidebar (Shortcut: [ )" 
                aria-label="Collapse sidebar"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors hidden md:flex items-center justify-center"
              >
                <IconChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Mobile Close Button (44x44 min touch target) */}
            <button
              onClick={onCloseMobile}
              title="Close Menu"
              aria-label="Close navigation menu"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors md:hidden active:scale-95"
            >
              <IconX className="w-6 h-6 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Action Header: New Service Order Button */}
        <div className={`p-3 flex-shrink-0 ${effectiveMinimized ? 'flex justify-center' : ''}`}>
          {hasPermission(Permission.CAN_CREATE_ORDERS) && (
            <button 
              onClick={handleNewServiceClick} 
              title="Create New Service Order"
              aria-label="Create New Service Order"
              className={`flex items-center justify-center bg-brand-accent text-brand-blue font-black rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-brand-accent/20 min-h-[44px] ${
                effectiveMinimized ? 'h-10 w-10 p-0' : 'w-full py-2.5 px-4'
              }`}
            >
              <IconPlus className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
              {!effectiveMinimized && <span className="ml-2 font-bold text-sm">New Service</span>}
            </button>
          )}
        </div>

        {/* Quick Search Filter (Expanded Mode Only) */}
        {!effectiveMinimized && (
          <div className="px-3 pb-2 flex-shrink-0">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Quick jump..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-9 pr-7 py-2 focus:outline-hidden focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear page search"
                  className="absolute right-2.5 text-slate-400 hover:text-white"
                >
                  <IconX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Body */}
        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto sidebar-scrollbar touch-pan-y">
          {searchQuery.trim() ? (
            /* Search Results Flat List */
            <ul className="space-y-1">
              <li className="px-2 py-1 text-[11px] font-bold text-amber-400/90 uppercase tracking-wider">
                Matching Pages ({visibleItems.length})
              </li>
              {visibleItems.length === 0 ? (
                <li className="px-3 py-4 text-xs text-slate-500 text-center">
                  No matching pages found
                </li>
              ) : (
                visibleItems.map(item => (
                  <NavLinkItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    categoryTag={item.category}
                    isActive={currentView === item.id}
                    isMinimized={effectiveMinimized}
                    onClick={() => handleNavClick(item.id)}
                    badge={item.badge}
                  />
                ))
              )}
            </ul>
          ) : (
            /* Structured Simplified Sections */
            <ul className="space-y-1">
              {categories.map(cat => {
                const itemsInCat = visibleItems.filter(i => i.category === cat.key);
                if (itemsInCat.length === 0) return null;

                const isOpen = openSections[cat.key] || effectiveMinimized;

                return (
                  <React.Fragment key={cat.key}>
                    {/* Section Header */}
                    {!effectiveMinimized ? (
                      <li className="pt-2.5 pb-1 px-1">
                        <button
                          onClick={() => toggleSection(cat.key)}
                          className="w-full flex items-center justify-between px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left group"
                        >
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 group-hover:text-brand-accent transition-colors">
                            {cat.label}
                          </span>
                          <span className="text-slate-500 group-hover:text-white transition-transform">
                            {isOpen ? <IconChevronDown className="w-3.5 h-3.5" /> : <IconChevronRight className="w-3.5 h-3.5" />}
                          </span>
                        </button>
                      </li>
                    ) : (
                      <li className="my-2 border-t border-white/10" />
                    )}

                    {/* Section Items */}
                    {isOpen && (
                      itemsInCat.map(item => (
                        <NavLinkItem
                          key={item.id}
                          icon={item.icon}
                          label={item.label}
                          categoryTag={cat.label}
                          isActive={currentView === item.id}
                          isMinimized={effectiveMinimized}
                          onClick={() => handleNavClick(item.id)}
                          badge={item.badge}
                        />
                      ))
                    )}
                  </React.Fragment>
                );
              })}
            </ul>
          )}
        </nav>

        {/* Bottom Area: Clean Collapse Bar & Quick Sign-out */}
        <div className="flex-shrink-0 bg-black/25 border-t border-white/5 p-2">
          <div className="flex items-center justify-between gap-1">
            {/* Desktop Expand / Collapse Button */}
            <button
              onClick={() => {
                haptic.light();
                onToggleDesktop();
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-slate-400 hover:text-brand-accent bg-white/5 hover:bg-white/10 rounded-xl transition-all min-h-[44px] ${
                effectiveMinimized ? 'w-full' : 'flex-1'
              }`}
              title={effectiveMinimized ? 'Expand Sidebar (Ctrl+B or [)' : 'Collapse Sidebar'}
              aria-label={effectiveMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {effectiveMinimized ? (
                <IconChevronRight className="w-5 h-5 text-brand-accent animate-pulse" />
              ) : (
                <>
                  <IconChevronLeft className="w-4 h-4" />
                  <span>Collapse</span>
                </>
              )}
            </button>

            {/* Quick Logout (When expanded) */}
            {!effectiveMinimized && (
              <button
                onClick={() => {
                  haptic.warning();
                  onLogout();
                }}
                title="Log out securely"
                aria-label="Log out"
                className="p-2 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <IconLogout className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
