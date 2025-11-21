"use client";

import { useEffect, useState } from "react";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useRainbowWallet } from "@/hooks/useRainbowWallet";
import { useOneTimeCode } from "@/hooks/useOneTimeCode";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const OneTimeCodeVerification = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    address,
    isConnected,
    chainId,
    ethersSigner,
    ethersProvider,
    eip1193Provider,
  } = useRainbowWallet();

  // FHEVM instance - only enable when wallet is connected and provider is available
  // Use eip1193Provider (walletClient) for FHEVM, not ethersProvider
  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider: eip1193Provider,
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: mounted && isConnected && !!eip1193Provider,
  });

  // One-Time Code hook
  const oneTimeCode = useOneTimeCode({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eip1193Provider: ethersProvider as unknown as any,
    chainId,
    ethersSigner,
    ethersReadonlyProvider: ethersProvider,
  });

  const buttonClass =
    "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg " +
    "transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

  const titleClass = "font-semibold text-gray-800 text-xl mb-4 pb-2 border-b border-gray-200";

  // Prevent hydration mismatch by only rendering wallet-dependent content on client
  if (!mounted) {
    return (
      <div className="mx-auto flex flex-col items-center gap-4 py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="mx-auto flex flex-col items-center gap-6 py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to start using encrypted one-time code verification</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (oneTimeCode.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="grid w-full gap-6 max-w-6xl mx-auto px-4">
      <div className="col-span-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
        <h2 className="font-bold text-3xl mb-2">
          Encrypted One-Time Code Verification
        </h2>
        <p className="text-purple-100 text-sm">Secure verification powered by FHEVM</p>
      </div>

      {/* Debug information cards - hidden for cleaner UI */}
      {/* eslint-disable-next-line no-constant-binary-expression */}
      {false && (
        <>
          <div className="col-span-full bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <p className={titleClass}>Chain Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {printProperty("ChainId", chainId)}
              {printProperty("Address", address || "No address")}
              {printProperty("Signer", ethersSigner?.address || "No signer")}
            </div>

            <p className={titleClass}>Contract</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {printProperty("Contract Address", oneTimeCode.contractAddress)}
              {printProperty("isDeployed", oneTimeCode.isDeployed)}
              {printProperty("isInitialized", oneTimeCode.isInitialized)}
            </div>
          </div>

          <div className="col-span-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-white shadow-lg border border-gray-200 p-6">
                <p className={titleClass}>FHEVM Instance</p>
                {printProperty("Fhevm Instance", fhevmInstance ? "OK" : "undefined")}
                {printProperty("Fhevm Status", fhevmStatus)}
                {fhevmError ? (
                  <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <p className="text-red-800 text-sm font-semibold mb-2">FHEVM Error:</p>
                    <p className="text-red-600 text-xs mb-3">{fhevmError?.message || String(fhevmError || 'Unknown error')}</p>
                    {fhevmStatus === "error" && (
                      <div className="text-red-500 text-xs space-y-1">
                        {chainId === 11155111 ? (
                          <>
                            <p className="font-semibold mb-1">⚠️ Sepolia network requires Zama Relayer service.</p>
                            <p className="mb-1">Possible issues:</p>
                            <ul className="list-disc list-inside ml-2 space-y-1">
                              <li>Relayer service temporarily unavailable</li>
                              <li>Network connection issues</li>
                              <li>Please try again later or use localhost for testing</li>
                            </ul>
                          </>
                        ) : (
                          <p>Note: This may be a network issue. The app will work in mock mode on localhost.</p>
                        )}
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-red-200 text-xs text-gray-600">
                      <p>💡 Tip: Check your network connection and try refreshing the page.</p>
                    </div>
                  </div>
                ) : (
                  printProperty("Fhevm Error", "No Error")
                )}
              </div>
              <div className="rounded-xl bg-white shadow-lg border border-gray-200 p-6">
                <p className={titleClass}>Status</p>
                <div className="grid grid-cols-2 gap-3">
                  {printProperty("isSettingCode", oneTimeCode.isSettingCode)}
                  {printProperty("isVerifying", oneTimeCode.isVerifying)}
                  {printProperty("isDecrypting", oneTimeCode.isDecrypting)}
                  {printProperty("canSetCode", oneTimeCode.canSetCode)}
                  {printProperty("canVerify", oneTimeCode.canVerify)}
                  {printProperty("canDecrypt", oneTimeCode.canDecrypt)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Set Expected Code Section */}
      {!oneTimeCode.isInitialized && (
        <div className="col-span-full bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <p className={titleClass}>Set Expected Code</p>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium mb-2 text-gray-700">Expected Code</label>
              <input
                type="number"
                value={oneTimeCode.expectedCodeInput}
                onChange={(e) => oneTimeCode.setExpectedCodeInput(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                placeholder="Enter expected code"
              />
            </div>
            <button
              className={buttonClass + " w-full md:w-auto"}
              disabled={!oneTimeCode.canSetCode}
              onClick={oneTimeCode.setExpectedCode}
            >
              {oneTimeCode.canSetCode
                ? "Set Expected Code"
                : oneTimeCode.isSettingCode
                  ? "Setting..."
                  : "Cannot set code"}
            </button>
          </div>
        </div>
      )}

      {/* Verify Code Section */}
      {oneTimeCode.isInitialized && (
        <div className="col-span-full bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <p className={titleClass}>Verify Code</p>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium mb-2 text-gray-700">Enter Code to Verify</label>
              <input
                type="number"
                value={oneTimeCode.verifyCodeInput}
                onChange={(e) => oneTimeCode.setVerifyCodeInput(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                placeholder="Enter code to verify"
              />
            </div>
            <button
              className={buttonClass + " w-full md:w-auto"}
              disabled={!oneTimeCode.canVerify}
              onClick={oneTimeCode.verifyCode}
            >
              {oneTimeCode.canVerify
                ? "Verify Code"
                : oneTimeCode.isVerifying
                  ? "Verifying..."
                  : "Cannot verify"}
            </button>
          </div>
        </div>
      )}

      {/* Result Section */}
      {oneTimeCode.resultHandle && (
        <div className="col-span-full bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <p className={titleClass}>Verification Result</p>
          <div className="space-y-3 mb-4">
            {printProperty("Result Handle", oneTimeCode.resultHandle)}
            {printProperty(
              "Decrypted Result",
              oneTimeCode.isDecrypted
                ? oneTimeCode.decryptedResult !== undefined
                  ? oneTimeCode.decryptedResult
                    ? "✓ Match (true)"
                    : "✗ No Match (false)"
                  : "Not decrypted"
                : "Not decrypted"
            )}
          </div>
          <button
            className={buttonClass + " w-full"}
            disabled={!oneTimeCode.canDecrypt}
            onClick={oneTimeCode.decryptResult}
          >
            {oneTimeCode.canDecrypt
              ? "Decrypt Result"
              : oneTimeCode.isDecrypted
                ? "Already Decrypted"
                : oneTimeCode.isDecrypting
                  ? "Decrypting..."
                  : "Nothing to decrypt"}
          </button>
        </div>
      )}

      {oneTimeCode.message && (
        <div className="col-span-full bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💬</span>
            <p className="font-semibold text-gray-800">Status Message</p>
          </div>
          <p className="text-gray-600">{oneTimeCode.message}</p>
        </div>
      )}
    </div>
  );
};

function printProperty(name: string, value: unknown) {
  let displayValue: string;

  if (typeof value === "boolean") {
    return printBooleanProperty(name, value);
  } else if (typeof value === "string" || typeof value === "number") {
    displayValue = String(value);
  } else if (typeof value === "bigint") {
    displayValue = String(value);
  } else if (value === null) {
    displayValue = "null";
  } else if (value === undefined) {
    displayValue = "undefined";
  } else if (value instanceof Error) {
    displayValue = value.message;
  } else {
    displayValue = JSON.stringify(value);
  }
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-600">{name}:</span>
      <span className="font-mono text-sm font-semibold text-gray-800 break-all text-right">{displayValue}</span>
    </div>
  );
}

function printBooleanProperty(name: string, value: boolean) {
  if (value) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm font-medium text-gray-600">{name}:</span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ true
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-600">{name}:</span>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ✗ false
      </span>
    </div>
  );
}