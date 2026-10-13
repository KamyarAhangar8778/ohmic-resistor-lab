'use client';

import * as React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PairTableSortKey, SortDirection } from '@/types/voltage-divider';

import { cn } from '@/lib/utils';

interface TableSortHeaderProps {
  label: string;
  columnKey: PairTableSortKey;
  sortKey: PairTableSortKey;
  sortDir: SortDirection;
  onSort: (key: PairTableSortKey) => void;
  align?: 'right' | 'center' | 'left';
  className?: string;
}

export function TableSortHeader({
  label,
  columnKey,
  sortKey,
  sortDir,
  onSort,
  align = 'right',
  className,
}: TableSortHeaderProps) {
  const isSorted = sortKey === columnKey;
  return (
    <th
      scope="col"
      tabIndex={0}
      aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      onClick={() => onSort(columnKey)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort(columnKey);
        }
      }}
      className={cn(
        'py-2.5 px-3 cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-emerald-500/50 select-none group',
        isSorted ? 'text-zinc-100 font-semibold bg-zinc-800/40' : 'text-zinc-400 font-medium hover:text-zinc-200 hover:bg-zinc-850/30',
        align === 'center' ? 'text-center' : align === 'left' ? 'text-left' : 'text-right',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center gap-1.5',
          align === 'center' ? 'justify-center' : align === 'left' ? 'justify-start' : 'justify-start'
        )}
      >
        <span>{label}</span>
        <SortIndicator activeKey={sortKey} currentKey={columnKey} dir={sortDir} />
      </div>
    </th>
  );
}

function SortIndicator({
  activeKey,
  currentKey,
  dir,
}: {
  activeKey: PairTableSortKey;
  currentKey: PairTableSortKey;
  dir: SortDirection;
}) {
  if (activeKey !== currentKey) {
    return <ArrowUpDown className="h-3 w-3 text-zinc-600 opacity-60" />;
  }
  return dir === 'asc' ? (
    <ArrowUp className="h-3 w-3 text-emerald-400" />
  ) : (
    <ArrowDown className="h-3 w-3 text-emerald-400" />
  );
}
