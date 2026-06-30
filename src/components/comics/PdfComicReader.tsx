'use client';

import { useEffect, useMemo, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CinaraiSessionData } from '@/components/cinarai/types';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
}

interface PdfComicReaderProps {
  pdfUrl: string;
  session: CinaraiSessionData;
  onPageChange: (page: number, totalPages: number, readingCompleted: boolean) => void;
  onReadingComplete: (page: number, totalPages: number, readingCompleted: boolean) => void;
}

export function PdfComicReader({ pdfUrl, session, onPageChange, onReadingComplete }: PdfComicReaderProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(Math.max(1, session.currentPage ?? 1));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPageNumber(Math.max(1, session.currentPage ?? 1));
  }, [session.currentPage]);

  const totalPages = numPages ?? session.totalPages ?? 1;
  const readingCompleted = Boolean(session.readingCompleted);
  const progressPercent = totalPages > 0 ? Math.round((pageNumber / totalPages) * 100) : 0;
  const isAtLastPage = totalPages > 0 && pageNumber >= totalPages;

  const handlePageChange = (nextPage: number) => {
    const boundedPage = Math.min(Math.max(1, nextPage), totalPages || 1);
    const reachedEnd = boundedPage >= totalPages;
    setPageNumber(boundedPage);
    onPageChange(boundedPage, totalPages || 1, reachedEnd);
  };

  const handleDocumentLoadSuccess = (pdf: { numPages: number }) => {
    const nextTotalPages = pdf.numPages || 1;
    setNumPages(nextTotalPages);
    setIsLoading(false);
    const boundedPage = Math.min(pageNumber, nextTotalPages);
    setPageNumber(boundedPage);
    onPageChange(boundedPage, nextTotalPages, boundedPage >= nextTotalPages);
  };

  const handleContinueToContextualization = () => {
    const completedPage = Math.max(1, Math.min(pageNumber, totalPages || 1));
    onPageChange(completedPage, totalPages || 1, true);
    onReadingComplete(completedPage, totalPages || 1, true);
  };

  const goToPrevious = () => {
    if (pageNumber > 1) {
      handlePageChange(pageNumber - 1);
    }
  };

  const goToNext = () => {
    if (pageNumber < totalPages) {
      handlePageChange(pageNumber + 1);
    }
  };

  const statusText = useMemo(() => {
    if (readingCompleted) return 'Komik selesai dibaca';
    if (isAtLastPage) return 'Halaman terakhir tercapai';
    return 'Baca satu halaman per satu';
  }, [isAtLastPage, readingCompleted]);

  return (
    <div className="space-y-4">
      <Card className="rounded-[1.75rem] border-none bg-white p-4 shadow-lg shadow-orange-100/70">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BookOpen className="h-4 w-4 text-primary" />
          Pembaca Komik PDF
        </div>
        <p className="mt-2 text-sm text-slate-600">Satu halaman per satu halaman. Kamu tidak bisa scroll terus-menerus.</p>
      </Card>

      <Card className="rounded-[1.75rem] border-none bg-slate-50 p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          <span>Reading Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="mt-3 h-3" />
        <div className="mt-3 flex items-center justify-between text-sm font-semibold text-slate-700">
          <span>Page {pageNumber} / {totalPages}</span>
          <span>{statusText}</span>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[2rem] border-none bg-white p-3 shadow-lg shadow-slate-200/80">
        <div className="flex min-h-[420px] items-center justify-center rounded-[1.5rem] border border-slate-100 bg-slate-50 p-2">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-sm font-semibold text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              Memuat halaman komik…
            </div>
          ) : error ? (
            <div className="text-center text-sm text-red-500">{error}</div>
          ) : (
            <div className="w-full overflow-hidden rounded-[1.25rem] bg-white p-2">
              <Document file={pdfUrl} onLoadSuccess={handleDocumentLoadSuccess} onLoadError={() => setError('Gagal memuat PDF komik.')} loading={<div className="flex items-center justify-center py-8 text-sm text-slate-500">Memuat PDF…</div>}>
                <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} className="mx-auto" />
              </Document>
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" className="h-14 rounded-[1.5rem] border-slate-200 bg-white text-base font-semibold text-slate-700 shadow-sm" onClick={goToPrevious} disabled={pageNumber <= 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button className="h-14 rounded-[1.5rem] bg-primary text-base font-semibold text-white shadow-lg shadow-orange-100/70" onClick={goToNext} disabled={pageNumber >= totalPages}>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Card className="rounded-[1.75rem] border-none bg-gradient-to-br from-emerald-50 to-cyan-50 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span>{readingCompleted ? 'Comic completed' : isAtLastPage ? 'Comic completed' : 'Baca sampai selesai untuk lanjut ke Contextualization'}</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{readingCompleted ? 'Kamu sudah menyelesaikan komik. Kamu bisa melanjutkan ke Contextualization.' : 'Selesaikan semua halaman untuk membuka tahap berikutnya.'}</span>
        </div>
        <Button className="mt-4 h-12 w-full rounded-[1.5rem] bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-700" onClick={handleContinueToContextualization} disabled={!isAtLastPage && !readingCompleted}>
          Continue to Contextualization
        </Button>
      </Card>
    </div>
  );
}
