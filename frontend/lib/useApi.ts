'use client';

import { useCallback } from 'react';
import { useAuth } from './auth';
import { getJSON as baseGetJSON, postJSON as basePostJSON } from './api';

export function useApi() {
  const { token } = useAuth();

  const getJSON = useCallback(
    <T>(path: string) => {
      return baseGetJSON<T>(path, token || undefined);
    },
    [token]
  );

  const postJSON = useCallback(
    <TIn, TOut>(path: string, body: TIn) => {
      return basePostJSON<TIn, TOut>(path, body, token || undefined);
    },
    [token]
  );

  return { getJSON, postJSON };
}
