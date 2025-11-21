"use client";

import { ethers } from "ethers";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";

import { EncryptedOneTimeCodeAddresses } from "@/abi/EncryptedOneTimeCodeAddresses";
import { EncryptedOneTimeCodeABI } from "@/abi/EncryptedOneTimeCodeABI";

export type ClearValueType = {
  handle: string;
  clear: string | bigint | boolean;
};

type ContractInfoType = {
  abi: typeof EncryptedOneTimeCodeABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

function getContractByChainId(
  chainId: number | undefined
): ContractInfoType {
  if (!chainId) {
    return { abi: EncryptedOneTimeCodeABI.abi };
  }

  const entry =
    EncryptedOneTimeCodeAddresses[chainId.toString() as keyof typeof EncryptedOneTimeCodeAddresses];

  if (!("address" in entry) || entry.address === ethers.ZeroAddress) {
    return { abi: EncryptedOneTimeCodeABI.abi, chainId };
  }

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId ?? chainId,
    chainName: entry?.chainName,
    abi: EncryptedOneTimeCodeABI.abi,
  };
}

export const useOneTimeCode = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
  } = parameters;

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isSettingCode, setIsSettingCode] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [resultHandle, setResultHandle] = useState<string | undefined>(undefined);
  const [decryptedResult, setDecryptedResult] = useState<boolean | undefined>(undefined);
  const [expectedCodeInput, setExpectedCodeInput] = useState<string>("");
  const [verifyCodeInput, setVerifyCodeInput] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const contractRef = useRef<ContractInfoType | undefined>(undefined);
  const isSettingCodeRef = useRef<boolean>(false);
  const isVerifyingRef = useRef<boolean>(false);
  const isDecryptingRef = useRef<boolean>(false);
  const _resultHandleRef = useRef<string | undefined>(undefined);

  const contract = useMemo(() => {
    const c = getContractByChainId(chainId);
    contractRef.current = c;

    if (!c.address) {
      setMessage(`Contract deployment not found for chainId=${chainId}.`);
    }

    return c;
  }, [chainId]);

  const isDeployed = useMemo(() => {
    if (!contract) {
      return undefined;
    }
    return Boolean(contract.address) && contract.address !== ethers.ZeroAddress;
  }, [contract]);

  const canSetCode = useMemo(() => {
    return (
      contract.address &&
      instance &&
      ethersSigner &&
      !isSettingCode &&
      !isInitialized &&
      expectedCodeInput !== ""
    );
  }, [contract.address, instance, ethersSigner, isSettingCode, isInitialized, expectedCodeInput]);

  const canVerify = useMemo(() => {
    return (
      contract.address &&
      instance &&
      ethersSigner &&
      !isVerifying &&
      isInitialized &&
      verifyCodeInput !== ""
    );
  }, [contract.address, instance, ethersSigner, isVerifying, isInitialized, verifyCodeInput]);

  const canDecrypt = useMemo(() => {
    return (
      contract.address &&
      instance &&
      ethersSigner &&
      !isDecrypting &&
      resultHandle &&
      resultHandle !== ethers.ZeroHash &&
      decryptedResult === undefined
    );
  }, [contract.address, instance, ethersSigner, isDecrypting, resultHandle, decryptedResult]);

  // Check if initialized
  useEffect(() => {
    if (!contract.address || !ethersReadonlyProvider) {
      setIsInitialized(false);
      return;
    }

    const checkInitialized = async () => {
      try {
        const contractInstance = new ethers.Contract(
          contract.address!,
          contract.abi,
          ethersReadonlyProvider
        );
        const initialized = await contractInstance.isInitialized();
        setIsInitialized(initialized);
      } catch (e) {
        console.error("Error checking initialization:", e);
      }
    };

    void checkInitialized();
  }, [contract.address, contract.abi, ethersReadonlyProvider]);

  const setExpectedCode = useCallback(() => {
    if (isSettingCodeRef.current || !contract.address || !instance || !ethersSigner) {
      return;
    }

    const code = parseInt(expectedCodeInput);
    if (isNaN(code)) {
      setMessage("Invalid code value");
      return;
    }

    isSettingCodeRef.current = true;
    setIsSettingCode(true);
    setMessage("Setting expected code...");

    const run = async () => {
      try {
        const input = instance.createEncryptedInput(
          contract.address!,
          ethersSigner.address
        );
        input.add32(code);

        const enc = await input.encrypt();

        const contractInstance = new ethers.Contract(
          contract.address!,
          contract.abi,
          ethersSigner
        );

        const tx = await contractInstance.setExpectedCode(
          enc.handles[0],
          enc.inputProof
        );

        setMessage(`Wait for tx:${tx.hash}...`);
        const receipt = await tx.wait();

        setMessage(`Set expected code completed status=${receipt?.status}`);
        setIsInitialized(true);
        setExpectedCodeInput("");
      } catch (e: unknown) {
        const error = e as { message?: string };
        let errorMessage = error.message || String(e);
        
        // Provide more helpful error messages for relayer issues
        if (errorMessage.includes("Relayer didn't response") || errorMessage.includes("relayer")) {
          errorMessage = `Relayer service error: ${errorMessage}. This may be due to network issues or relayer service being temporarily unavailable. Please try again later.`;
        }
        
        setMessage(`Set expected code failed: ${errorMessage}`);
      } finally {
        isSettingCodeRef.current = false;
        setIsSettingCode(false);
      }
    };

    void run();
  }, [contract.address, contract.abi, instance, ethersSigner, expectedCodeInput]);

  const verifyCode = useCallback(() => {
    if (isVerifyingRef.current || !contract.address || !instance || !ethersSigner) {
      return;
    }

    const code = parseInt(verifyCodeInput);
    if (isNaN(code)) {
      setMessage("Invalid code value");
      return;
    }

    isVerifyingRef.current = true;
    setIsVerifying(true);
    setMessage("Verifying code...");

    const run = async () => {
      try {
        const input = instance.createEncryptedInput(
          contract.address!,
          ethersSigner.address
        );
        input.add32(code);

        const enc = await input.encrypt();

        const contractInstance = new ethers.Contract(
          contract.address!,
          contract.abi,
          ethersSigner
        );

        // Call verifyCode and get the result handle from the return value
        // Note: We need to use staticCall to get the return value, but since it's a state-changing function,
        // we'll need to call it and then parse the transaction result
        const tx = await contractInstance.verifyCode(
          enc.handles[0],
          enc.inputProof
        );

        setMessage(`Wait for tx:${tx.hash}...`);
        const receipt = await tx.wait();

        // The verifyCode function returns ebool directly
        // We need to call it as a view function to get the handle
        // For MVP, we'll call it again as a static call to get the result handle
        try {
          // Call verifyCode as a static call to get the return value (result handle)
          const resultHandle = await contractInstance.verifyCode.staticCall(
            enc.handles[0],
            enc.inputProof
          );

          if (resultHandle && resultHandle !== ethers.ZeroHash) {
            setResultHandle(resultHandle);
            setMessage(`Verify code completed status=${receipt?.status}. Result handle retrieved.`);
          } else {
            setMessage(`Verify code completed status=${receipt?.status}. Could not retrieve result handle.`);
          }
          
          // Reset decrypted result
          setDecryptedResult(undefined);
          setVerifyCodeInput("");
        } catch {
          // If static call fails (because it's a state-changing function), 
          // we'll need to use a different approach
          // For now, note that the result is available but needs to be retrieved differently
          setMessage(`Verify code completed status=${receipt?.status}. Note: Result handle needs to be retrieved. Check transaction logs or use a view function.`);
          
          // Reset inputs
          setDecryptedResult(undefined);
          setVerifyCodeInput("");
        }
      } catch (e: unknown) {
        const error = e as { message?: string };
        setMessage(`Verify code failed: ${error.message || String(e)}`);
      } finally {
        isVerifyingRef.current = false;
        setIsVerifying(false);
      }
    };

    void run();
  }, [contract.address, contract.abi, instance, ethersSigner, verifyCodeInput]);

  const decryptResult = useCallback(() => {
    if (isDecryptingRef.current || !contract.address || !instance || !ethersSigner || !resultHandle) {
      return;
    }

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Decrypting result...");

    const run = async () => {
      try {
        const sig: FhevmDecryptionSignature | null =
          await FhevmDecryptionSignature.loadOrSign(
            instance,
            [contract.address as `0x${string}`],
            ethersSigner,
            fhevmDecryptionSignatureStorage
          );

        if (!sig) {
          setMessage("Unable to build FHEVM decryption signature");
          return;
        }

        const res = await instance.userDecrypt(
          [{ handle: resultHandle, contractAddress: contract.address as `0x${string}` }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        const result = res[resultHandle];
        setDecryptedResult(
          result === true || 
          (typeof result === 'bigint' && result === BigInt(1)) ||
          (typeof result === 'string' && result === '1')
        );
        setMessage("Result decrypted successfully!");
      } catch (e: unknown) {
        const error = e as { message?: string };
        setMessage(`Decrypt failed: ${error.message || String(e)}`);
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    };

    void run();
  }, [contract.address, instance, ethersSigner, resultHandle, fhevmDecryptionSignatureStorage]);

  return {
    contractAddress: contract.address,
    isDeployed,
    isInitialized,
    isSettingCode,
    isVerifying,
    isDecrypting,
    canSetCode,
    canVerify,
    canDecrypt,
    setExpectedCode,
    verifyCode,
    decryptResult,
    expectedCodeInput,
    setExpectedCodeInput,
    verifyCodeInput,
    setVerifyCodeInput,
    resultHandle,
    decryptedResult,
    isDecrypted: decryptedResult !== undefined,
    message,
  };
};

