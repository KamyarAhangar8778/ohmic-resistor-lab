'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  GitBranch,
  Layers,
  Sliders,
  Zap,
  Menu,
  X,
  Compass,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  activeToolId?: string;
  onSelectTool?: (toolId: string) => void;
}

interface ToolItem {
  id: string;
  name: string;
  enName: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  comingSoon?: boolean;
}

const TOOLS_LIST: ToolItem[] = [
  {
    id: 'parallel-resistor',
    name: 'مقاومت موازی',
    enName: 'Parallel Resistors',
    icon: GitBranch,
    active: true,
  },
  {
    id: 'series-resistor',
    name: 'مقاومت سری',
    enName: 'Series Resistors',
    icon: Layers,
    active: false,
    comingSoon: true,
  },
  {
    id: 'voltage-divider',
    name: 'تقسیم ولتاژ',
    enName: 'Voltage Divider',
    icon: Sliders,
    active: true,
  },
  {
    id: 'ohms-law',
    name: 'قانون اهم',
    enName: 'Ohm’s Law',
    icon: Zap,
    active: false,
    comingSoon: true,
  },
];

export function AppShell({
  children,
  activeToolId = 'parallel-resistor',
  onSelectTool,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const currentTool = TOOLS_LIST.find((t) => t.id === activeToolId) || TOOLS_LIST[0];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-vazir" dir="rtl">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 h-14 border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        {/* Zone 1: Brand & Workspace */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800/50"
            aria-label="منوی ابزارها"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop Sidebar Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="hidden md:flex items-center justify-center h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 rounded-md border border-zinc-800 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'باز کردن منو' : 'بستن منو (افزایش عرض فضای کار)'}
            aria-label={isSidebarCollapsed ? 'باز کردن منو' : 'بستن منو'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-emerald-400" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-200">
              <Cpu className="h-4 w-4" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tight text-white">
              OHMIC
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 mr-2">
            <span>/</span>
            <span className="text-zinc-400">تحلیل مدار</span>
            <span>/</span>
            <span className="text-zinc-200 font-medium">{currentTool.name}</span>
          </div>
        </div>

        {/* Zone 2: System Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>آماده به کار</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Left Sidebar (Desktop) */}
        <aside
          className={cn(
            'hidden md:flex flex-col border-l border-zinc-850 bg-[#09090b] shrink-0 transition-all duration-300 ease-in-out overflow-hidden',
            isSidebarCollapsed ? 'w-0 p-0 border-l-0 opacity-0 pointer-events-none' : 'w-64 p-4 opacity-100'
          )}
        >
          <div className="mb-4 px-1 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-semibold select-none">
              ابزارهای محاسباتی
            </span>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors cursor-pointer"
              title="بستن منو (افزایش عرض فضای کار)"
              aria-label="بستن منو"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
          </div>

          <nav className="space-y-1">
            {TOOLS_LIST.map((tool) => {
              const Icon = tool.icon;
              const isSelected = activeToolId === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    if (tool.active && onSelectTool) {
                      onSelectTool(tool.id);
                    }
                  }}
                  disabled={!tool.active}
                  className={`w-full group flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors text-right ${
                    isSelected
                      ? 'bg-zinc-850/90 text-white border border-zinc-700/80 shadow-xs'
                      : tool.active
                      ? 'text-zinc-300 hover:text-white hover:bg-zinc-850/50 cursor-pointer'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-cyan-400' : tool.active ? 'text-zinc-300' : 'text-zinc-500'}`} />
                    <span>{tool.name}</span>
                  </div>

                  {tool.comingSoon ? (
                    <Badge variant="subtle" className="text-[10px] py-0 px-1.5">
                      به‌زودی
                    </Badge>
                  ) : (
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isSelected ? 'text-cyan-400' : 'text-emerald-400'}`} />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-850">
            <div className="rounded-md border border-zinc-850 bg-zinc-900/30 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <Compass className="h-3.5 w-3.5 text-zinc-400" />
                <span>معماری ماژولار</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400 leading-normal">
                زیرساخت توسعه‌پذیر برای افزودن ابزارهای مهندسی برق بعدی.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer with Directional Easing */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.16, ease: [0.3, 0, 1, 1] } }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 top-14 z-50 bg-[#09090b]/95 backdrop-blur-md md:hidden p-4"
            >
              <div className="mb-4 px-2">
                <span className="text-[11px] text-zinc-400 font-semibold">
                  ابزارهای محاسباتی
                </span>
              </div>
              <nav className="space-y-1.5">
                {TOOLS_LIST.map((tool, idx) => {
                  const Icon = tool.icon;
                  const isSelected = activeToolId === tool.id;
                  return (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => {
                        if (tool.active) {
                          if (onSelectTool) onSelectTool(tool.id);
                          setMobileMenuOpen(false);
                        }
                      }}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-850 text-white border border-zinc-700'
                          : tool.active
                          ? 'text-zinc-300 hover:text-white hover:bg-zinc-850/50'
                          : 'text-zinc-400 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-cyan-400' : ''}`} />
                        <span>{tool.name}</span>
                      </div>
                      {tool.comingSoon ? (
                        <Badge variant="subtle" className="text-[10px]">
                          به‌زودی
                        </Badge>
                      ) : (
                        <CheckCircle2 className={`h-3.5 w-3.5 ${isSelected ? 'text-cyan-400' : 'text-emerald-400'}`} />
                      )}
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Open Sidebar Button when Collapsed */}
        {isSidebarCollapsed && (
          <div className="hidden md:block fixed right-3 top-20 z-30">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/90 text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-900 shadow-xl text-xs font-medium transition-all cursor-pointer backdrop-blur-md"
              title="نمایش منوی ابزارها"
            >
              <PanelLeftOpen className="h-3.5 w-3.5 text-emerald-400" />
              <span>ابزارها</span>
            </button>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 min-w-0 transition-all duration-300">
          <div
            className={cn(
              'mx-auto transition-all duration-300',
              isSidebarCollapsed ? 'max-w-6xl' : 'max-w-4xl'
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-850 bg-[#09090b] py-4 px-6 text-center text-xs text-zinc-400 font-mono">
        <span>OHMIC &copy; {new Date().getFullYear()} &middot; Park UI Dark System</span>
      </footer>
    </div>
  );
}
