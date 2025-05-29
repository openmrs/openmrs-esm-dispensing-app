import React, { useEffect } from 'react';
import { ExtensionSlot, setLeftNav, unsetLeftNav, WorkspaceContainer } from '@openmrs/esm-framework';

export default function Dispensing() {
  useEffect(() => {
    const basePath = window.spaBase + '/dispensing';
    setLeftNav({ name: 'homepage-dashboard-slot', basePath, mode: 'collapsed' });
    return () => unsetLeftNav('homepage-dashboard-slot');
  }, []);

  return (
    <>
      <ExtensionSlot name="dispensing-dashboard-slot" />
      <WorkspaceContainer key="dispensing" contextKey="dispensing" />
    </>
  );
}
