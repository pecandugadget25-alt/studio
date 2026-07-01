
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseProvider } from "@/firebase/provider";
import { AppBar } from "@/components/AppBar";
import { DynamicNav } from "@/components/DynamicNav";

export const metadata: Metadata = {
  title: 'ETHNO-ARITH | Pembelajaran Numerasi Berbasis Budaya',
  description: 'Meningkatkan kemampuan numerasi siswa melalui etnomatematika dan Augmented Reality.',
  icons: {
    icon: '/images/ethno-arith-logo.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-body antialiased selection:bg-primary/20">
        <FirebaseProvider>
          <div className="app-container">
            <DynamicAppBar />
            <main className="min-h-screen w-full min-w-0">
              {children}
            </main>
            <DynamicNav />
          </div>
        </FirebaseProvider>
        <Toaster />
      </body>
    </html>
  );
}

// Internal component to handle App Bar visibility
function DynamicAppBar() {
  return <AppBar />;
}
