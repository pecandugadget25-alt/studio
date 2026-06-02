'use client';

import { useEffect, useState } from 'react';
import { Query, onSnapshot, DocumentData, QuerySnapshot, CollectionReference } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...(doc.data() as T),
          id: doc.id
        }));
        setData(items);
        setLoading(false);
        setError(null);
      },
      async (serverError: any) => {
        // Ekstrak path dari query jika memungkinkan
        let path = 'unknown collection';
        if ((query as any).path) {
          path = (query as any).path;
        } else if ((query as any)._query?.path?.segments) {
          path = (query as any)._query.path.segments.join('/');
        }

        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
        } satisfies SecurityRuleContext);

        // Hanya emit jika ini bukan error 'missing-index' yang sedang ditangani secara internal
        if (serverError.code === 'permission-denied') {
          errorEmitter.emit('permission-error', permissionError);
        }
        
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
