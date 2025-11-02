// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, ebool, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted One-Time Code Verification
/// @notice Verifies if an encrypted code matches the expected code without exposing either value
/// @dev Uses FHE equality comparison to check code == expected_code and returns encrypted boolean
contract EncryptedOneTimeCode is SepoliaConfig {
    // Store the expected encrypted code
    euint32 private _expectedCode;

    // Track if the expected code has been set
    bool private _isInitialized;

    event CodeVerified(address indexed user, bytes32 resultHandle);
    event ExpectedCodeSet(address indexed setter);

    /// @notice Set the expected code (encrypted)
    /// @param inputEuint32 the encrypted expected code value
    /// @param inputProof the input proof
    /// @dev Can only be set once. The setter becomes the owner of the encrypted value.
    function setExpectedCode(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        require(!_isInitialized, "Expected code already set");
        require(inputProof.length > 0, "Input proof cannot be empty");

        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);
        _expectedCode = encryptedEuint32;
        _isInitialized = true;

        // ACL: allow contract and setter to access the encrypted expected code
        FHE.allowThis(_expectedCode);
        FHE.allow(_expectedCode, msg.sender);

        emit ExpectedCodeSet(msg.sender);
    }

    /// @notice Verify if the provided encrypted code matches the expected code
    /// @param inputEuint32 the encrypted code to verify
    /// @param inputProof the input proof
    /// @return encryptedResult encrypted boolean result (true if codes match, false otherwise)
    function verifyCode(externalEuint32 inputEuint32, bytes calldata inputProof) 
        external 
        returns (ebool encryptedResult) 
    {
        require(_isInitialized, "Expected code not set");

        euint32 encryptedCode = FHE.fromExternal(inputEuint32, inputProof);

        // Compare encrypted codes using FHE equality
        ebool isMatch = FHE.eq(encryptedCode, _expectedCode);

        // ACL: allow contract and caller to access the encrypted result
        FHE.allowThis(isMatch);
        FHE.allow(isMatch, msg.sender);

        // Note: The result handle is returned directly from the function
        // Frontend should capture it from the transaction return value
        emit CodeVerified(msg.sender, bytes32(0)); // Placeholder - actual handle is in return value

        return isMatch;
    }

    /// @notice Get the encrypted expected code
    /// @return The encrypted expected code
    function getExpectedCode() external view returns (euint32) {
        return _expectedCode;
    }

    /// @notice Check if the expected code has been initialized
    /// @return true if initialized, false otherwise
    function isInitialized() external view returns (bool) {
        return _isInitialized;
    }
}


// Auto-generated commit 1 by wawsyy at 11/01/2025 15:00:00
// Auto-generated commit 1 by wswsyy at 11/01/2025 20:00:00
// Auto-generated commit 1 by wawsyy at 11/02/2025 01:00:00
// Auto-generated commit 3 by wawsyy at 11/01/2025 13:00:00
// Auto-generated commit 3 by wswsyy at 11/01/2025 18:00:00
// Auto-generated commit 3 by wawsyy at 11/01/2025 23:00:00