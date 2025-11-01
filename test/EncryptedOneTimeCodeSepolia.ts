import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { EncryptedOneTimeCode } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("EncryptedOneTimeCodeSepolia", function () {
  let signers: Signers;
  let contract: EncryptedOneTimeCode;
  let contractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const contractDeployment = await deployments.get("EncryptedOneTimeCode");
      contractAddress = contractDeployment.address;
      contract = await ethers.getContractAt("EncryptedOneTimeCode", contractDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("set expected code and verify correct code", async function () {
    steps = 12;

    this.timeout(4 * 40000);

    const expectedCode = 1234;
    const userCode = 1234; // Same as expected

    progress(`Encrypting expected code '${expectedCode}'...`);
    const encryptedExpected = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(expectedCode)
      .encrypt();

    progress(
      `Call setExpectedCode(${expectedCode}) contract=${contractAddress} handle=${ethers.hexlify(encryptedExpected.handles[0])} signer=${signers.alice.address}...`,
    );
    let tx = await contract
      .connect(signers.alice)
      .setExpectedCode(encryptedExpected.handles[0], encryptedExpected.inputProof);
    await tx.wait();

    progress(`Checking if initialized...`);
    const isInitialized = await contract.isInitialized();
    expect(isInitialized).to.be.true;

    progress(`Encrypting user code '${userCode}'...`);
    const encryptedUserCode = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(userCode)
      .encrypt();

    progress(
      `Call verifyCode(${userCode}) contract=${contractAddress} handle=${ethers.hexlify(encryptedUserCode.handles[0])} signer=${signers.alice.address}...`,
    );
    tx = await contract
      .connect(signers.alice)
      .verifyCode(encryptedUserCode.handles[0], encryptedUserCode.inputProof);
    const receipt = await tx.wait();

    progress(`Transaction completed with status=${receipt?.status}`);
    expect(receipt?.status).to.eq(1);

    progress(`Verification completed successfully!`);
  });

  it("set expected code and verify incorrect code", async function () {
    steps = 12;

    this.timeout(4 * 40000);

    const expectedCode = 5678;
    const userCode = 9999; // Different from expected

    progress(`Encrypting expected code '${expectedCode}'...`);
    const encryptedExpected = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(expectedCode)
      .encrypt();

    progress(
      `Call setExpectedCode(${expectedCode}) contract=${contractAddress} handle=${ethers.hexlify(encryptedExpected.handles[0])} signer=${signers.alice.address}...`,
    );
    let tx = await contract
      .connect(signers.alice)
      .setExpectedCode(encryptedExpected.handles[0], encryptedExpected.inputProof);
    await tx.wait();

    progress(`Checking if initialized...`);
    const isInitialized = await contract.isInitialized();
    expect(isInitialized).to.be.true;

    progress(`Encrypting user code '${userCode}'...`);
    const encryptedUserCode = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(userCode)
      .encrypt();

    progress(
      `Call verifyCode(${userCode}) contract=${contractAddress} handle=${ethers.hexlify(encryptedUserCode.handles[0])} signer=${signers.alice.address}...`,
    );
    tx = await contract
      .connect(signers.alice)
      .verifyCode(encryptedUserCode.handles[0], encryptedUserCode.inputProof);
    const receipt = await tx.wait();

    progress(`Transaction completed with status=${receipt?.status}`);
    expect(receipt?.status).to.eq(1);

    progress(`Verification completed successfully!`);
  });
});

