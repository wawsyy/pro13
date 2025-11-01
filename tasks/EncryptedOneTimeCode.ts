import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the EncryptedOneTimeCode contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the EncryptedOneTimeCode contract
 *
 *   npx hardhat --network localhost task:set-expected-code --code 1234
 *   npx hardhat --network localhost task:verify-code --code 1234
 *   npx hardhat --network localhost task:decrypt-result
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the EncryptedOneTimeCode contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the EncryptedOneTimeCode contract
 *
 *   npx hardhat --network sepolia task:set-expected-code --code 1234
 *   npx hardhat --network sepolia task:verify-code --code 1234
 *   npx hardhat --network sepolia task:decrypt-result
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the EncryptedOneTimeCode address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const contract = await deployments.get("EncryptedOneTimeCode");

  console.log("EncryptedOneTimeCode address is " + contract.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:set-expected-code --code 1234
 *   - npx hardhat --network sepolia task:set-expected-code --code 1234
 */
task("task:set-expected-code", "Sets the expected code in the contract")
  .addOptionalParam("address", "Optionally specify the contract address")
  .addParam("code", "The expected code value")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const code = parseInt(taskArguments.code);
    if (!Number.isInteger(code)) {
      throw new Error(`Argument --code is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedOneTimeCode");
    console.log(`EncryptedOneTimeCode: ${contractDeployment.address}`);

    const signers = await ethers.getSigners();

    const contract = await ethers.getContractAt("EncryptedOneTimeCode", contractDeployment.address);

    // Encrypt the code value
    const encryptedCode = await fhevm
      .createEncryptedInput(contractDeployment.address, signers[0].address)
      .add32(code)
      .encrypt();

    const tx = await contract
      .connect(signers[0])
      .setExpectedCode(encryptedCode.handles[0], encryptedCode.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`EncryptedOneTimeCode setExpectedCode(${code}) succeeded!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:verify-code --code 1234
 *   - npx hardhat --network sepolia task:verify-code --code 1234
 */
task("task:verify-code", "Verifies a code against the expected code")
  .addOptionalParam("address", "Optionally specify the contract address")
  .addParam("code", "The code to verify")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const code = parseInt(taskArguments.code);
    if (!Number.isInteger(code)) {
      throw new Error(`Argument --code is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedOneTimeCode");
    console.log(`EncryptedOneTimeCode: ${contractDeployment.address}`);

    const signers = await ethers.getSigners();

    const contract = await ethers.getContractAt("EncryptedOneTimeCode", contractDeployment.address);

    // Encrypt the code value
    const encryptedCode = await fhevm
      .createEncryptedInput(contractDeployment.address, signers[0].address)
      .add32(code)
      .encrypt();

    const tx = await contract
      .connect(signers[0])
      .verifyCode(encryptedCode.handles[0], encryptedCode.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`EncryptedOneTimeCode verifyCode(${code}) succeeded!`);
    console.log("Use task:decrypt-result to see the verification result");
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-result
 *   - npx hardhat --network sepolia task:decrypt-result
 */
task("task:decrypt-result", "Decrypts the last verification result")
  .addOptionalParam("address", "Optionally specify the contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const contractDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedOneTimeCode");
    console.log(`EncryptedOneTimeCode: ${contractDeployment.address}`);

    const signers = await ethers.getSigners();

    const contract = await ethers.getContractAt("EncryptedOneTimeCode", contractDeployment.address);

    // Note: This task assumes the result handle is stored somewhere
    // In a real implementation, you would need to track the result handle
    // For now, this is a placeholder that shows the pattern
    console.log("Note: This task requires tracking the result handle from verifyCode()");
    console.log("In the frontend, the result handle is returned and can be decrypted there");
  });

