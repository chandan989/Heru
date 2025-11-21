// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleHeruNotary
 * @dev Minimal digital notary for testing deployment to Hedera testnet
 */
contract SimpleHeruNotary {
    address public owner;
    address public trustedBackend;
    
    mapping(bytes32 => bool) public recordExists;
    
    event RecordCreated(bytes32 indexed batchId, address indexed creator);
    
    constructor(address _trustedBackend) {
        owner = msg.sender;
        trustedBackend = _trustedBackend;
    }
    
    function createRecord(bytes32 batchId) external {
        require(!recordExists[batchId], "Record already exists");
        recordExists[batchId] = true;
        emit RecordCreated(batchId, msg.sender);
    }
    
    function isValidRecord(bytes32 batchId) external view returns (bool) {
        return recordExists[batchId];
    }
}