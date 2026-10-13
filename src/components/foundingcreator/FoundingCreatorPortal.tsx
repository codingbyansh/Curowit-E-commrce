import React, { useState, useEffect } from 'react';
import { FoundingCreatorLanding } from './FoundingCreatorLanding';
import { FoundingCreatorApply } from './FoundingCreatorApply';
import { FoundingCreatorStatus } from './FoundingCreatorStatus';
import { FoundingCreatorLogin } from './FoundingCreatorLogin';
import { FoundingCreatorDashboard } from './FoundingCreatorDashboard';

interface FoundingCreatorPortalProps {
  initialSubRoute?: string;
  onNavigateHome?: () => void;
}

export const FoundingCreatorPortal: React.FC<FoundingCreatorPortalProps> = ({
  initialSubRoute,
  onNavigateHome,
}) => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [initialStatusId, setInitialStatusId] = useState<string>('');

  useEffect(() => {
    // Parse route from window.location.pathname or initialSubRoute
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const idParam = searchParams.get('id') || '';

    if (idParam) setInitialStatusId(idParam);

    if (path === '/foundingcreator/apply' || initialSubRoute === 'apply') {
      setCurrentView('apply');
    } else if (path === '/foundingcreator/login' || initialSubRoute === 'login') {
      setCurrentView('login');
    } else if (path === '/foundingcreator/dashboard' || initialSubRoute === 'dashboard') {
      setCurrentView('dashboard');
    } else if (
      path === '/foundingcreator/application-status' ||
      path === '/foundingcreator/status' ||
      initialSubRoute === 'status'
    ) {
      setCurrentView('status');
    } else {
      setCurrentView('landing');
    }
  }, [initialSubRoute]);

  // Handle browser Back/Forward inside the founding creator portal subroutes
  useEffect(() => {
    const handlePortalPopState = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const idParam = searchParams.get('id') || '';
      if (idParam) setInitialStatusId(idParam);

      if (path === '/foundingcreator/apply') {
        setCurrentView('apply');
      } else if (path === '/foundingcreator/login') {
        setCurrentView('login');
      } else if (path === '/foundingcreator/dashboard') {
        setCurrentView('dashboard');
      } else if (
        path === '/foundingcreator/application-status' ||
        path === '/foundingcreator/status'
      ) {
        setCurrentView('status');
      } else if (path === '/foundingcreator' || path === '/foundingcreator/') {
        setCurrentView('landing');
      }
    };
    window.addEventListener('popstate', handlePortalPopState);
    return () => window.removeEventListener('popstate', handlePortalPopState);
  }, []);

  const handleNavigate = (target: string) => {
    if (target === 'home') {
      try {
        window.history.pushState(null, '', '/');
      } catch {}
      if (onNavigateHome) onNavigateHome();
      return;
    }

    if (target.startsWith('foundingcreator-status')) {
      const parts = target.split('?id=');
      if (parts[1]) setInitialStatusId(decodeURIComponent(parts[1]));
      setCurrentView('status');
      try {
        window.history.pushState(null, '', `/foundingcreator/application-status${parts[1] ? `?id=${parts[1]}` : ''}`);
      } catch {}
      return;
    }

    switch (target) {
      case 'foundingcreator-apply':
        setCurrentView('apply');
        try {
          window.history.pushState(null, '', '/foundingcreator/apply');
        } catch {}
        break;
      case 'foundingcreator-login':
        setCurrentView('login');
        try {
          window.history.pushState(null, '', '/foundingcreator/login');
        } catch {}
        break;
      case 'foundingcreator-dashboard':
        setCurrentView('dashboard');
        try {
          window.history.pushState(null, '', '/foundingcreator/dashboard');
        } catch {}
        break;
      case 'foundingcreator-status':
        setCurrentView('status');
        try {
          window.history.pushState(null, '', '/foundingcreator/application-status');
        } catch {}
        break;
      case 'foundingcreator':
      default:
        setCurrentView('landing');
        try {
          window.history.pushState(null, '', '/foundingcreator');
        } catch {}
        break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen">
      {currentView === 'landing' && <FoundingCreatorLanding onNavigate={handleNavigate} />}
      {currentView === 'apply' && <FoundingCreatorApply onNavigate={handleNavigate} />}
      {currentView === 'status' && (
        <FoundingCreatorStatus onNavigate={handleNavigate} initialId={initialStatusId} />
      )}
      {currentView === 'login' && <FoundingCreatorLogin onNavigate={handleNavigate} />}
      {currentView === 'dashboard' && <FoundingCreatorDashboard onNavigate={handleNavigate} />}
    </div>
  );
};
