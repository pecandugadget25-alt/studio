'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Kesalahan Izin Firestore',
        description: `Anda tidak memiliki izin untuk melakukan operasi '${error.context.operation}' pada path: ${error.context.path}`,
      });
      // Throwing so it appears in the Next.js dev overlay as per guidelines
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, [toast]);

  return null;
}
