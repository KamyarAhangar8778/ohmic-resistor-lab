'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ResistorCalculatorView } from '@/components/resistor-calculator/ResistorCalculatorView';
import { VoltageDividerView } from '@/components/voltage-divider/VoltageDividerView';

export default function HomePage() {
  const [activeToolId, setActiveToolId] = React.useState('voltage-divider');

  return (
    <AppShell activeToolId={activeToolId} onSelectTool={setActiveToolId}>
      {activeToolId === 'voltage-divider' ? (
        <VoltageDividerView />
      ) : (
        <ResistorCalculatorView />
      )}
    </AppShell>
  );
}

