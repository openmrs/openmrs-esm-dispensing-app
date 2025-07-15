import React, { useMemo } from 'react';
import classNames from 'classnames';
import { BrowserRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';

const DispensingDashboardLink = () => {
  return (
    <BrowserRouter>
      <DashboardExtension />
    </BrowserRouter>
  );
};

export default DispensingDashboardLink;

function DashboardExtension() {
  const { t } = useTranslation();
  const spaBasePath = `${window.spaBase}/home`;

  const navLink = useMemo(() => {
    const pathArray = location.pathname.split('/home');
    const lastElement = pathArray[pathArray.length - 1];
    return decodeURIComponent(lastElement);
  }, []);

  return (
    <ConfigurableLink
      className={classNames('cds--side-nav__link', {
        'active-left-nav-link': navLink.match('dispensing'),
      })}
      to={`${spaBasePath}/dispensing`}>
      {t('dispensing', 'Dispensing')}
    </ConfigurableLink>
  );
}
