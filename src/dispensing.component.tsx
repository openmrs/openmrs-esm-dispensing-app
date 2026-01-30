import React from 'react';
import classNames from 'classnames';
import {
  ExtensionSlot,
  isDesktop,
  useConfig,
  useLayoutType,
  useLeftNav,
  WorkspaceContainer,
} from '@openmrs/esm-framework';
import { type PharmacyConfig } from './config-schema';
import styles from './dispensing.scss';

export default function Dispensing() {
  const { leftNavMode } = useConfig<PharmacyConfig>();
  const layout = useLayoutType();

  const basePath = window.spaBase + '/dispensing';
  useLeftNav({ name: 'homepage-dashboard-slot', basePath, mode: leftNavMode });

  return (
    <div
      className={classNames([
        isDesktop(layout) ? styles.desktopContainer : '',
        leftNavMode === 'normal' ? styles.hasLeftNav : '',
      ])}>
      <ExtensionSlot name="dispensing-dashboard-slot" />
      <WorkspaceContainer key="dispensing" contextKey="dispensing" />
    </div>
  );
}
