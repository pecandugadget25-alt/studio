
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { COMIC_LIBRARY } from '@/lib/comic-library';

export default function ModulesPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
      <h1 className="font-headline text-2xl font-bold text-slate-900 sm:text-3xl">
        Pilih Materi
      </h1>

      <div className="mt-6 space-y-4">
        {COMIC_LIBRARY.map((comic) => (
          <article
            key={comic.id}
            className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:flex-row"
          >
            <div className="relative aspect-[4/3] w-full shrink-0 bg-slate-100 sm:h-44 sm:w-56">
              <Image
                src={comic.coverImage}
                alt={comic.title}
                fill
                sizes="(min-width: 640px) 224px, calc(100vw - 32px)"
                className="object-cover"
                priority={comic.id === 'komik-1'}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between gap-5 p-5 sm:p-6">
              <h2 className="text-xl font-semibold leading-snug text-slate-900">
                {comic.title}
              </h2>

              <Button asChild className="h-11 w-full rounded-lg font-semibold sm:w-fit">
                <Link href={`/comics/${comic.id}`}>Mulai Belajar</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
