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
      <body className={`zama-bg text-foreground antialiased`}>
        <ErrorFilterScript />
        <div className="fixed inset-0 w-full h-full zama-bg z-[-20] min-w-[850px]"></div>
        <Providers>
          <main className="flex flex-col max-w-screen-lg mx-auto pb-20 min-w-[850px]">
            <nav className="flex w-full px-3 md:px-0 h-fit py-10 justify-between items-center">
              <Image
                src="/logo.svg"
                alt="Encrypted One-Time Code Logo"
                width={120}
                height={120}
              />
              <div className="flex items-center gap-4">
                <WalletButton />
              </div>
            </nav>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

