'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ResistorCalculatorView } from '@/components/resistor-calculator/ResistorCalculatorView';
import { VoltageDividerView } from '@/components/voltage-divider/VoltageDividerView';
import { SeriesCalculatorView } from '@/components/series-calculator/SeriesCalculatorView';

export default function HomePage() {
  const [activeToolId, setActiveToolId] = React.useState('voltage-divider');

  return (
    <AppShell activeToolId={activeToolId} onSelectTool={setActiveToolId}>
      {activeToolId === 'voltage-divider' ? (
        <VoltageDividerView />
      ) : activeToolId === 'series-resistor' ? (
        <SeriesCalculatorView />
      ) : (
        <ResistorCalculatorView />
      )}
    </AppShell>
  );
}

