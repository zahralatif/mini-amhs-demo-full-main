'use client';

import { useCallback } from 'react';
import { useAuth } from './auth';
import { getJSON as baseGetJSON, postJSON as basePostJSON } from './api';

export function useApi() {
  const { token } = useAuth();

  const getJSON = useCallback(
    <T>(path: string) => {
      return baseGetJSON<T>(path, token);
    },
    [token]
  );

  const postJSON = useCallback(
    <T>(path: string, body: any) => {
      return basePostJSON<T>(path, body, token);
    },
    [token]
  );

  return { getJSON, postJSON };
}
