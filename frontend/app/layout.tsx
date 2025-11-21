import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Image from "next/image";
import { WalletButton } from "@/components/WalletButton";
import { ErrorFilterScript } from "@/components/ErrorFilterScript";

export const metadata: Metadata = {
  title: "Encrypted One-Time Code Verification",
  description: "Verify one-time codes without exposing the code values using FHEVM",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                const originalError = console.error;
                const patterns = [
                  /Base Account SDK.*Cross-Origin-Opener-Policy/i,
                  /Base Account SDK requires.*header.*not be set to.*same-origin/i,
                  /checkCrossOriginOpenerPolicy/i,
                  /@base-org\\/account/i,
                  /9e883_.*@base-org.*account/i
                ];
                console.error = function(...args) {
                  const text = args.map(a => String(a)).join(' ');
                  if (patterns.some(p => p.test(text))) return;
                  originalError.apply(console, args);
                };
              })();
            `,
          }}
        />
      </head>
      <body className={`zama-bg text-foreground antialiased`}>
        <ErrorFilterScript />
        <div className="fixed inset-0 w-full h-full zama-bg z-[-20]"></div>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex w-full h-fit py-4 justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/logo.svg"
                      alt="Encrypted One-Time Code Logo"
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                    <div>
                      <h1 className="text-lg font-bold text-gray-800">Encrypted OTC</h1>
                      <p className="text-xs text-gray-500">FHE Verification</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <WalletButton />
                  </div>
                </div>
              </div>
            </nav>
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="text-center text-sm text-gray-600">
                  <p>Built with ❤️ using <span className="font-semibold">Zama FHEVM</span> technology</p>
                  <p className="mt-1 text-xs text-gray-500">© 2024 Encrypted One-Time Code Verification. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}

