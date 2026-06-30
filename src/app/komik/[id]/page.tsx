'use client';

import { use } from 'react';
import { CinaraiComicLearning } from '@/components/comics/CinaraiComicLearning';

export default function ComicReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CinaraiComicLearning comicId={id} />;
}
