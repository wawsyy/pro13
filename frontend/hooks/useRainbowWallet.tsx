"use client";

import { useAccount, useChainId, useConnect, useDisconnect, useWalletClient } from "wagmi";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export function useRainbowWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();

  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined);
  const [ethersProvider, setEthersProvider] = useState<ethers.BrowserProvider | undefined>(undefined);

  useEffect(() => {
    if (walletClient && isConnected) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const provider = new ethers.BrowserProvider(walletClient as any);
      void provider.getSigner().then((signer) => {
        setEthersSigner(signer);
        setEthersProvider(provider);
      });
    } else {
      setEthersSigner(undefined);
      setEthersProvider(undefined);
    }
  }, [walletClient, isConnected]);

  const connectWallet = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  // Return walletClient as EIP-1193 provider for FHEVM
  const eip1193Provider = walletClient as ethers.Eip1193Provider | undefined;

  return {
    address,
    isConnected,
    chainId,
    connect: connectWallet,
    disconnect,
    ethersSigner,
    ethersProvider,
    eip1193Provider, // EIP-1193 provider for FHEVM
  };
}

