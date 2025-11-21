// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title HeruNotary
 * @dev Digital notary for Hedera-based medical supply chain
 * Primary function: Create immutable shipment records 
 * Secondary function: Optional automated payment escrow
 */
contract HeruNotary is Ownable, ReentrancyGuard {
    // Trusted backend address (can finalize shipments)
    address public trustedBackend;
    
    // Shipment record structure
    struct ShipmentRecord {
        bytes32 batchId;
        address payer;
        address recipient;  
        uint256 escrowAmount;
        bool isCompleted;
        bool isCompliant;
        uint32 createdAt;
        string htsTokenId;    // HTS NFT token ID
        string hcsTopicId;    // HCS topic for temperature logs
    }
    
    // Mappings
    mapping(bytes32 => address) public batchToRecipient;
    mapping(bytes32 => uint256) public batchEscrowAmount;
    mapping(bytes32 => ShipmentRecord) public shipments;
    
    // Events
    event ShipmentRecordCreated(
        bytes32 indexed batchId,
        address payer,
        address recipient,
        string htsTokenId
    );
    
    event ShipmentFunded(
        bytes32 indexed batchId,
        uint256 amount,
        address funder
    );
    
    event ShipmentRecordFinalized(
        bytes32 indexed batchId,
        bool isCompliant
    );
    
    modifier onlyTrustedBackend() {
        require(msg.sender == trustedBackend, "Only trusted backend can call this");
        _;
    }
    
    constructor(address _trustedBackend) {
        require(_trustedBackend != address(0), "Invalid backend address");
        trustedBackend = _trustedBackend;
    }
    
    /**
     * @dev Create an immutable shipment record (free operation)
     * @param batchId Unique batch identifier
     * @param recipient Address receiving the shipment
     * @param htsTokenId HTS token ID for the batch NFT
     * @param hcsTopicId HCS topic ID for temperature logging
     */
    function createShipmentRecord(
        bytes32 batchId,
        address recipient,
        string calldata htsTokenId,
        string calldata hcsTopicId
    ) external {
        require(recipient != address(0), "Invalid recipient");
        require(shipments[batchId].createdAt == 0, "Batch already exists");
        
        shipments[batchId] = ShipmentRecord({
            batchId: batchId,
            payer: msg.sender,
            recipient: recipient,
            escrowAmount: 0,
            isCompleted: false,
            isCompliant: false,
            createdAt: uint32(block.timestamp),
            htsTokenId: htsTokenId,
            hcsTopicId: hcsTopicId
        });
        
        batchToRecipient[batchId] = recipient;
        
        emit ShipmentRecordCreated(batchId, msg.sender, recipient, htsTokenId);
    }
    
    /**
     * @dev Fund a shipment with escrow (optional operation)
     * @param batchId Batch to fund
     */
    function fundShipment(bytes32 batchId) external payable nonReentrant {
        require(shipments[batchId].createdAt != 0, "Batch not found");
        require(!shipments[batchId].isCompleted, "Batch already completed");
        require(msg.value > 0, "Must send funds");
        
        shipments[batchId].escrowAmount += msg.value;
        batchEscrowAmount[batchId] += msg.value;
        
        emit ShipmentFunded(batchId, msg.value, msg.sender);
    }
    
    /**
     * @dev Finalize shipment based on compliance (trusted backend only)
     * @param batchId Batch to finalize
     * @param isCompliant Whether the shipment was compliant
     */
    function finalizeShipment(bytes32 batchId, bool isCompliant) external onlyTrustedBackend nonReentrant {
        require(shipments[batchId].createdAt != 0, "Batch not found");
        require(!shipments[batchId].isCompleted, "Already finalized");
        
        shipments[batchId].isCompleted = true;
        shipments[batchId].isCompliant = isCompliant;
        
        // Handle escrow payment if funded
        if (shipments[batchId].escrowAmount > 0) {
            if (isCompliant) {
                // Release payment to recipient
                address recipient = shipments[batchId].recipient;
                uint256 amount = shipments[batchId].escrowAmount;
                shipments[batchId].escrowAmount = 0;
                batchEscrowAmount[batchId] = 0;
                
                (bool success, ) = recipient.call{value: amount}("");
                require(success, "Payment failed");
            } else {
                // Return payment to payer
                address payer = shipments[batchId].payer;
                uint256 amount = shipments[batchId].escrowAmount;
                shipments[batchId].escrowAmount = 0;
                batchEscrowAmount[batchId] = 0;
                
                (bool success, ) = payer.call{value: amount}("");
                require(success, "Refund failed");
            }
        }
        
        emit ShipmentRecordFinalized(batchId, isCompliant);
    }
    
    /**
     * @dev Get shipment record details
     * @param batchId Batch to query
     */
    function getShipment(bytes32 batchId) external view returns (
        bytes32,
        address, 
        address,
        uint256,
        bool,
        bool,
        uint32,
        string memory,
        string memory
    ) {
        ShipmentRecord memory record = shipments[batchId];
        return (
            record.batchId,
            record.payer,
            record.recipient,
            record.escrowAmount,
            record.isCompleted,
            record.isCompliant,
            record.createdAt,
            record.htsTokenId,
            record.hcsTopicId
        );
    }
    
    /**
     * @dev Update trusted backend address (owner only)
     * @param newBackend New backend address
     */
    function updateTrustedBackend(address newBackend) external onlyOwner {
        require(newBackend != address(0), "Invalid backend address");
        trustedBackend = newBackend;
    }
}