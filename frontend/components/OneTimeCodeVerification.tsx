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
    connect,
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
    eip1193Provider: ethersProvider as any,
    chainId,
    ethersSigner,
    ethersReadonlyProvider: ethersProvider,
  });

  const buttonClass =
    "inline-flex items-center justify-center rounded-xl bg-black px-4 py-4 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const titleClass = "font-semibold text-black text-lg mt-4";

  // Prevent hydration mismatch by only rendering wallet-dependent content on client
  if (!mounted) {
    return (
      <div className="mx-auto flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold">Loading...</h2>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="mx-auto flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
        <ConnectButton />
      </div>
    );
  }

  if (oneTimeCode.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="grid w-full gap-4">
      <div className="col-span-full mx-20 bg-black text-white">
        <p className="font-semibold text-3xl m-5">
          Encrypted One-Time Code Verification
        </p>
      </div>

      <div className="col-span-full mx-20 mt-4 px-5 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Chain Information</p>
        {printProperty("ChainId", chainId)}
        {printProperty("Address", address || "No address")}
        {printProperty("Signer", ethersSigner ? ethersSigner.address : "No signer")}

        <p className={titleClass}>Contract</p>
        {printProperty("Contract Address", oneTimeCode.contractAddress)}
        {printProperty("isDeployed", oneTimeCode.isDeployed)}
        {printProperty("isInitialized", oneTimeCode.isInitialized)}
      </div>

      <div className="col-span-full mx-20">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white border-2 border-black pb-4 px-4">
            <p className={titleClass}>FHEVM Instance</p>
            {printProperty("Fhevm Instance", fhevmInstance ? "OK" : "undefined")}
            {printProperty("Fhevm Status", fhevmStatus)}
            {fhevmError ? (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 text-sm font-semibold">FHEVM Error:</p>
                <p className="text-red-600 text-xs mt-1">{fhevmError.message || String(fhevmError)}</p>
                {fhevmStatus === "error" && (
                  <div className="text-red-500 text-xs mt-1 space-y-1">
                    {chainId === 11155111 ? (
                      <>
                        <p>‚ö†Ô∏è Sepolia network requires Zama Relayer service.</p>
                        <p>Possible issues:</p>
                        <ul className="list-disc list-inside ml-2">
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
                <div className="mt-2 text-xs text-gray-600">
                  <p>üí° Tip: Check your network connection and try refreshing the page.</p>
                </div>
              </div>
            ) : (
              printProperty("Fhevm Error", "No Error")
            )}
          </div>
          <div className="rounded-lg bg-white border-2 border-black pb-4 px-4">
            <p className={titleClass}>Status</p>
            {printProperty("isSettingCode", oneTimeCode.isSettingCode)}
            {printProperty("isVerifying", oneTimeCode.isVerifying)}
            {printProperty("isDecrypting", oneTimeCode.isDecrypting)}
            {printProperty("canSetCode", oneTimeCode.canSetCode)}
            {printProperty("canVerify", oneTimeCode.canVerify)}
            {printProperty("canDecrypt", oneTimeCode.canDecrypt)}
          </div>
        </div>
      </div>

      {/* Set Expected Code Section */}
      {!oneTimeCode.isInitialized && (
        <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
          <p className={titleClass}>Set Expected Code</p>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Expected Code</label>
              <input
                type="number"
                value={oneTimeCode.expectedCodeInput}
                onChange={(e) => oneTimeCode.setExpectedCodeInput(e.target.value)}
                className="w-full px-4 py-2 border-2 border-black rounded"
                placeholder="Enter expected code"
              />
            </div>
            <button
              className={buttonClass}
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
        <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
          <p className={titleClass}>Verify Code</p>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Enter Code to Verify</label>
              <input
                type="number"
                value={oneTimeCode.verifyCodeInput}
                onChange={(e) => oneTimeCode.setVerifyCodeInput(e.target.value)}
                className="w-full px-4 py-2 border-2 border-black rounded"
                placeholder="Enter code to verify"
              />
            </div>
            <button
              className={buttonClass}
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
        <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
          <p className={titleClass}>Verification Result</p>
          {printProperty("Result Handle", oneTimeCode.resultHandle)}
          {printProperty(
            "Decrypted Result",
            oneTimeCode.isDecrypted
              ? oneTimeCode.decryptedResult !== undefined
                ? oneTimeCode.decryptedResult
                  ? "‚ú?Match (true)"
                  : "‚ú?No Match (false)"
                : "Not decrypted"
              : "Not decrypted"
          )}
          <button
            className={buttonClass + " mt-4"}
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

      <div className="col-span-full mx-20 p-4 rounded-lg bg-white border-2 border-black">
        {printProperty("Message", oneTimeCode.message)}
      </div>
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
    <p className="text-black">
      {name}:{" "}
      <span className="font-mono font-semibold text-black">{displayValue}</span>
    </p>
  );
}

function printBooleanProperty(name: string, value: boolean) {
  if (value) {
    return (
      <p className="text-black">
        {name}:{" "}
        <span className="font-mono font-semibold text-green-500">true</span>
      </p>
    );
  }

  return (
    <p className="text-black">
      {name}:{" "}
      <span className="font-mono font-semibold text-red-500">false</span>
    </p>
  );
}


// Auto-generated commit 1 by wswsyy at 11/01/2025 16:00:00
// Auto-generated commit 1 by wawsyy at 11/01/2025 21:00:00
// Auto-generated commit 1 by wswsyy at 11/02/2025 02:00:00
// Auto-generated commit 3 by wswsyy at 11/01/2025 14:00:00
// Auto-generated commit 3 by wawsyy at 11/01/2025 19:00:00
// Auto-generated commit 3 by wswsyy at 11/02/2025 00:00:00
// Auto-generated commit 3 by wawsyy at 11/02/2025 05:00:00