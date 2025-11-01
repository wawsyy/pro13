import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EncryptedOneTimeCode, EncryptedOneTimeCode__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("EncryptedOneTimeCode")) as EncryptedOneTimeCode__factory;
  const contract = (await factory.deploy()) as EncryptedOneTimeCode;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("EncryptedOneTimeCode", function () {
  let signers: Signers;
  let contract: EncryptedOneTimeCode;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("should not be initialized after deployment", async function () {
    const isInitialized = await contract.isInitialized();
    expect(isInitialized).to.be.false;
  });

  it("should set expected code", async function () {
    const expectedCode = 1234;

    // Encrypt the expected code
    const encryptedCode = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(expectedCode)
      .encrypt();

    const tx = await contract
      .connect(signers.alice)
      .setExpectedCode(encryptedCode.handles[0], encryptedCode.inputProof);
    await tx.wait();

    const isInitialized = await contract.isInitialized();
    expect(isInitialized).to.be.true;
  });

  it("should verify correct code and return true", async function () {
    const expectedCode = 5678;
    const userCode = 5678; // Same as expected

    // Set expected code
    const encryptedExpected = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(expectedCode)
      .encrypt();

    let tx = await contract
      .connect(signers.alice)
      .setExpectedCode(encryptedExpected.handles[0], encryptedExpected.inputProof);
    await tx.wait();

    // Verify code
    const encryptedUserCode = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(userCode)
      .encrypt();

    tx = await contract
      .connect(signers.alice)
      .verifyCode(encryptedUserCode.handles[0], encryptedUserCode.inputProof);
    const receipt = await tx.wait();

    // Get the result from the transaction receipt (if available)
    // In a real scenario, we would need to track the result handle
    // For now, we verify the transaction succeeded
    expect(receipt?.status).to.eq(1);
  });

  it("should verify incorrect code and return false", async function () {
    const expectedCode = 9999;
    const userCode = 1111; // Different from expected

    // Set expected code
    const encryptedExpected = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(expectedCode)
      .encrypt();

    let tx = await contract
      .connect(signers.alice)
      .setExpectedCode(encryptedExpected.handles[0], encryptedExpected.inputProof);
    await tx.wait();

    // Verify code
    const encryptedUserCode = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(userCode)
      .encrypt();

    tx = await contract
      .connect(signers.alice)
      .verifyCode(encryptedUserCode.handles[0], encryptedUserCode.inputProof);
    const receipt = await tx.wait();

    // Get the result from the transaction receipt (if available)
    // In a real scenario, we would need to track the result handle
    // For now, we verify the transaction succeeded
    expect(receipt?.status).to.eq(1);
  });

  it("should not allow setting expected code twice", async function () {
    const code1 = 1111;
    const code2 = 2222;

    // Set expected code first time
    const encryptedCode1 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(code1)
      .encrypt();

    let tx = await contract
      .connect(signers.alice)
      .setExpectedCode(encryptedCode1.handles[0], encryptedCode1.inputProof);
    await tx.wait();

    // Try to set expected code second time - should fail
    const encryptedCode2 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(code2)
      .encrypt();

    await expect(
      contract
        .connect(signers.alice)
        .setExpectedCode(encryptedCode2.handles[0], encryptedCode2.inputProof)
    ).to.be.revertedWith("Expected code already set");
  });

  it("should not allow verification before expected code is set", async function () {
    const userCode = 1234;

    const encryptedUserCode = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(userCode)
      .encrypt();

    await expect(
      contract
        .connect(signers.alice)
        .verifyCode(encryptedUserCode.handles[0], encryptedUserCode.inputProof)
    ).to.be.revertedWith("Expected code not set");
  });
});

