import { OneTimeCodeVerification } from "@/components/OneTimeCodeVerification";

export default function Home() {
  return (
    <main className="flex-1 w-full">
      <div className="hero-section text-center py-12 px-4 mb-8 animate-fadeIn">
        <h1 className="hero-title text-4xl md:text-5xl font-bold mb-4 animate-slideIn">
          Welcome to <span className="gradient-text bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Encrypted One-Time Code</span>
        </h1>
        <p className="hero-subtitle text-gray-600 max-w-2xl mx-auto text-lg animate-slideIn" style={{ animationDelay: '0.1s' }}>
          Verify one-time codes without exposing the code values using state-of-the-art Fully Homomorphic Encryption (FHE) technology
        </p>
      </div>

      <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 px-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        <div className="feature-card bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="feature-icon text-4xl mb-4">🔒</div>
          <h3 className="feature-title text-xl font-semibold mb-2 text-gray-800">Privacy-Preserving</h3>
          <p className="feature-description text-gray-600 text-sm">
            Verify codes without exposing either the user&apos;s input or the expected code value
          </p>
        </div>
        <div className="feature-card bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="feature-icon text-4xl mb-4">⚡</div>
          <h3 className="feature-title text-xl font-semibold mb-2 text-gray-800">FHEVM Powered</h3>
          <p className="feature-description text-gray-600 text-sm">
            Built on Zama&apos;s FHEVM for encrypted computations on-chain with maximum security
          </p>
        </div>
        <div className="feature-card bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="feature-icon text-4xl mb-4">🛡️</div>
          <h3 className="feature-title text-xl font-semibold mb-2 text-gray-800">Secure by Design</h3>
          <p className="feature-description text-gray-600 text-sm">
            End-to-end encryption ensures your data remains confidential throughout the verification process
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
        <OneTimeCodeVerification />
      </div>
    </main>
  );
}

