export * from './foundingCreatorSync';
import { useState, useEffect } from 'react';
import {
  foundingCreatorSyncService,
  syncEventBus,
  StoreDocument,
  OnboardingStatus,
  SyncEventType,
} from './foundingCreatorSync';
import {
  CreatorProfile,
  CreatorApplication,
  CreatorProduct,
  CreatorOrderItem,
  CreatorPayout,
} from '../types/foundingCreator';

/**
 * React hook to reactively subscribe to Founding Creator Profile and Session changes
 */
export function useFoundingCreator() {
  const [creator, setCreator] = useState<CreatorProfile | null>(() =>
    foundingCreatorSyncService.getCurrentCreator()
  );

  useEffect(() => {
    const unsubscribe = syncEventBus.subscribe((event, payload) => {
      if (event === 'PROFILE_UPDATED') {
        const current = foundingCreatorSyncService.getCurrentCreator();
        setCreator(current);
      }
    });

    return unsubscribe;
  }, []);

  return { creator, setCreator };
}

/**
 * React hook to reactively subscribe to Store Documents for a Founding Creator
 */
export function useCreatorStoreDocuments(creatorId?: string) {
  const [documents, setDocuments] = useState<StoreDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDocuments = async () => {
    if (!creatorId) {
      setDocuments([]);
      return;
    }
    setIsLoading(true);
    try {
      const docs = await foundingCreatorSyncService.fetchStoreDocuments(creatorId);
      setDocuments(docs);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (creatorId) {
      loadDocuments();
    }

    const unsubscribe = syncEventBus.subscribe((event) => {
      if (event === 'DOCUMENTS_UPDATED') {
        loadDocuments();
      }
    });

    return unsubscribe;
  }, [creatorId]);

  return { documents, isLoading, reload: loadDocuments };
}

/**
 * React hook to reactively subscribe to Onboarding Status and Wizard Checklist
 */
export function useCreatorOnboardingStatus(creatorId?: string) {
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStatus = async () => {
    if (!creatorId) return;
    setIsLoading(true);
    try {
      const status = await foundingCreatorSyncService.fetchOnboardingStatus(creatorId);
      setOnboarding(status);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (creatorId) {
      loadStatus();
    }

    const unsubscribe = syncEventBus.subscribe((event) => {
      if (event === 'ONBOARDING_STATUS_CHANGED' || event === 'APPLICATION_UPDATED') {
        loadStatus();
      }
    });

    return unsubscribe;
  }, [creatorId]);

  return { onboarding, isLoading, reload: loadStatus };
}
