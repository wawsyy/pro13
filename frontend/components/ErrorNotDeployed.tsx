import { ReactElement } from "react";

export function errorNotDeployed(chainId: number | undefined): ReactElement {
  return (
    <div className="mx-auto">
      <div className="rounded-lg bg-red-100 border-2 border-red-500 p-6">
        <h2 className="text-xl font-bold text-red-800 mb-2">
          Contract Not Deployed
        </h2>
        <p className="text-red-700">
          EncryptedOneTimeCode contract is not deployed on chainId={chainId}.
        </p>
        <p className="text-red-700 mt-2">
          Please deploy the contract first:
        </p>
        <code className="block mt-2 p-2 bg-red-50 rounded text-sm">
          npx hardhat deploy --network {chainId === 31337 ? "localhost" : "sepolia"}
        </code>
      </div>
    </div>
  );
}

