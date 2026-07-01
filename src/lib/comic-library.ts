export type ComicLibraryItem = {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  pageCount: number;
  imageHint: string;
};

export const COMIC_LIBRARY: ComicLibraryItem[] = [
  {
    id: 'komik-1',
    slug: 'candi-jawi',
    title: 'Bangun Ruang Candi Jawi',
    coverImage: '/comics/candi-jawi/cover.webp',
    pageCount: 37,
    imageHint: 'candi jawi',
  },
  {
    id: 'komik-2',
    slug: 'candi-penataran',
    title: 'Bangun Ruang Candi Penataran',
    coverImage: '/comics/candi-penataran/cover.webp',
    pageCount: 32,
    imageHint: 'candi penataran',
  },
  {
    id: 'komik-3',
    slug: 'gajah-mungkur',
    title: 'Bangun Ruang Gajah Mungkur',
    coverImage: '/comics/gajah-mungkur/cover.webp',
    pageCount: 28,
    imageHint: 'gajah mungkur',
  },
  {
    id: 'komik-4',
    slug: 'jembatan-merah',
    title: 'Bangun Ruang Jembatan Merah',
    coverImage: '/comics/jembatan-merah/cover.webp',
    pageCount: 26,
    imageHint: 'jembatan merah',
  },
  {
    id: 'komik-5',
    slug: 'keraton-sumenep',
    title: 'Bangun Ruang Keraton Sumenep',
    coverImage: '/comics/keraton-sumenep/cover.webp',
    pageCount: 34,
    imageHint: 'keraton sumenep',
  },
];
