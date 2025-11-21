// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title Heru Enhanced - AI + ESG + DePIN Smart Contract
 * @dev Powers AI alerts, Carbon Credit NFTs, and DePIN sensor payments
 * @author Heru Team - Hedera Africa Hackathon 2025
 */
contract HeruEnhanced is Ownable, ReentrancyGuard, ERC721 {
    // ========== STATE VARIABLES ==========
    uint256 public defaultDeliveryReward = 10 ether; // 10 HBAR
    uint256 public sensorPaymentRate = 0.01 ether; // 0.01 HBAR per valid reading
    uint256 public carbonCreditValue = 5 ether; // 5 HBAR value for carbon credit NFT
    
    address public trustedAI; // AI prediction service address
    address public guardian; // Guardian verification service
    address public depinOracle; // DePIN sensor validation oracle
    
    uint256 private _nextCarbonTokenId = 1;
    
    // ========== STRUCTS ==========
    struct Shipment {
        string batchId;
        address payer; // Hospital
        address distributor; // Delivery company
        uint256 escrowAmount;
        uint256 rewardAmount;
        bool isCompleted;
        bool isCompliant;
        bool rewardFrozen; // AI can freeze reward for urgent action
        uint32 createdAt;
        string htsTokenId;
        string hcsTopicId;
        uint256 carbonScore; // Carbon impact score
        bool carbonCreditMinted; // Has carbon credit been minted?
    }
    
    struct AIAlert {
        string batchId;
        uint256 spoilageRisk; // 0-100 percentage
        string alertType; // "TEMPERATURE", "HUMIDITY", "LOCATION"
        uint256 triggeredAt;
        bool acknowledged; // Has distributor acknowledged?
        uint256 rewardFrozenUntil; // Timestamp when reward unfreezes
    }
    
    struct CarbonCredit {
        uint256 tokenId;
        string batchId;
        address distributor;
        uint256 carbonSaved; // kg CO2 equivalent
        uint256 mintedAt;
        string verificationHash; // Guardian verification
    }
    
    struct SensorReading {
        address sensorOperator;
        string batchId;
        uint256 timestamp;
        bool verified; // Oracle verified as valid
        bool paid; // Has been paid
    }
    
    // ========== MAPPINGS ==========
    mapping(string => Shipment) public shipments;
    mapping(string => AIAlert) public activeAlerts;
    mapping(uint256 => CarbonCredit) public carbonCredits;
    mapping(bytes32 => SensorReading) public sensorReadings; // hash(sensorId + timestamp) -> reading
    mapping(address => uint256) public sensorEarnings;
    mapping(address => uint256) public carbonCreditBalance; // Number of carbon credits owned
    
    // ========== EVENTS ==========
    event ShipmentCreated(string indexed batchId, address indexed payer, address indexed distributor, uint256 escrowAmount);
    event AIAlertTriggered(string indexed batchId, uint256 spoilageRisk, string alertType, uint256 rewardFrozenUntil);
    event AlertAcknowledged(string indexed batchId, address distributor, uint256 acknowledgedAt);
    event CarbonCreditMinted(uint256 indexed tokenId, string batchId, address distributor, uint256 carbonSaved);
    event SensorPaymentSent(address indexed sensorOperator, string batchId, uint256 amount);
    event RewardUnfrozen(string indexed batchId, address distributor);
    
    // ========== CONSTRUCTOR ==========
    constructor(
        address _trustedAI,
        address _guardian,
        address _depinOracle
    ) Ownable(msg.sender) ERC721("Heru Carbon Credits", "HCC") {
        require(_trustedAI != address(0), "Invalid AI address");
        require(_guardian != address(0), "Invalid Guardian address");
        require(_depinOracle != address(0), "Invalid DePIN oracle address");
        
        trustedAI = _trustedAI;
        guardian = _guardian;
        depinOracle = _depinOracle;
    }
    
    // ========== MODIFIERS ==========
    modifier onlyAI() {
        require(msg.sender == trustedAI, "Only AI can trigger alerts");
        _;
    }
    
    modifier onlyGuardian() {
        require(msg.sender == guardian, "Only Guardian can verify");
        _;
    }
    
    modifier onlyDePINOracle() {
        require(msg.sender == depinOracle, "Only DePIN oracle can validate");
        _;
    }
    
    // ========== CORE FUNCTIONS ==========
    
    /**
     * @dev Create shipment escrow (hospital pays)
     */
    function createShipment(
        string memory _batchId,
        address _distributor,
        string memory _htsTokenId,
        string memory _hcsTopicId
    ) external payable {
        require(bytes(_batchId).length > 0, "Batch ID cannot be empty");
        require(_distributor != address(0), "Invalid distributor address");
        require(msg.value >= defaultDeliveryReward, "Insufficient escrow amount");
        require(bytes(shipments[_batchId].batchId).length == 0, "Shipment already exists");
        
        shipments[_batchId] = Shipment({
            batchId: _batchId,
            payer: msg.sender,
            distributor: _distributor,
            escrowAmount: msg.value,
            rewardAmount: defaultDeliveryReward,
            isCompleted: false,
            isCompliant: false,
            rewardFrozen: false,
            createdAt: uint32(block.timestamp),
            htsTokenId: _htsTokenId,
            hcsTopicId: _hcsTopicId,
            carbonScore: 0,
            carbonCreditMinted: false
        });
        
        emit ShipmentCreated(_batchId, msg.sender, _distributor, msg.value);
    }
    
    /**
     * @dev AI FEATURE: Trigger alert and freeze reward
     */
    function triggerAIAlert(
        string memory _batchId,
        uint256 _spoilageRisk,
        string memory _alertType,
        uint256 _freezeDurationMinutes
    ) external onlyAI {
        require(bytes(shipments[_batchId].batchId).length > 0, "Shipment does not exist");
        require(!shipments[_batchId].isCompleted, "Shipment already completed");
        require(_spoilageRisk > 50, "Risk too low to freeze reward"); // Only freeze for >50% risk
        
        Shipment storage shipment = shipments[_batchId];
        shipment.rewardFrozen = true;
        
        uint256 unfreezeTime = block.timestamp + (_freezeDurationMinutes * 60);
        
        activeAlerts[_batchId] = AIAlert({
            batchId: _batchId,
            spoilageRisk: _spoilageRisk,
            alertType: _alertType,
            triggeredAt: block.timestamp,
            acknowledged: false,
            rewardFrozenUntil: unfreezeTime
        });
        
        emit AIAlertTriggered(_batchId, _spoilageRisk, _alertType, unfreezeTime);
    }
    
    /**
     * @dev Distributor acknowledges alert and unfreezes reward early
     */
    function acknowledgeAlert(string memory _batchId) external {
        require(bytes(activeAlerts[_batchId].batchId).length > 0, "No active alert");
        require(msg.sender == shipments[_batchId].distributor, "Only distributor can acknowledge");
        require(!activeAlerts[_batchId].acknowledged, "Already acknowledged");
        
        activeAlerts[_batchId].acknowledged = true;
        shipments[_batchId].rewardFrozen = false; // Unfreeze reward immediately
        
        emit AlertAcknowledged(_batchId, msg.sender, block.timestamp);
        emit RewardUnfrozen(_batchId, msg.sender);
    }
    
    /**
     * @dev ESG FEATURE: Mint Carbon Credit NFT for green delivery
     */
    function mintCarbonCredit(
        string memory _batchId,
        uint256 _carbonSaved,
        string memory _verificationHash
    ) external onlyGuardian {
        require(bytes(shipments[_batchId].batchId).length > 0, "Shipment does not exist");
        require(!shipments[_batchId].carbonCreditMinted, "Carbon credit already minted");
        require(_carbonSaved > 0, "Must have positive carbon savings");
        
        uint256 tokenId = _nextCarbonTokenId++;
        address distributor = shipments[_batchId].distributor;
        
        // Mint NFT to distributor
        _safeMint(distributor, tokenId);
        
        carbonCredits[tokenId] = CarbonCredit({
            tokenId: tokenId,
            batchId: _batchId,
            distributor: distributor,
            carbonSaved: _carbonSaved,
            mintedAt: block.timestamp,
            verificationHash: _verificationHash
        });
        
        shipments[_batchId].carbonScore = _carbonSaved;
        shipments[_batchId].carbonCreditMinted = true;
        carbonCreditBalance[distributor]++;
        
        // Bonus payment for carbon-negative delivery
        payable(distributor).transfer(carbonCreditValue);
        
        emit CarbonCreditMinted(tokenId, _batchId, distributor, _carbonSaved);
    }
    
    /**
     * @dev DePIN FEATURE: Pay sensor operators for valid readings
     */
    function paySensorReading(
        address _sensorOperator,
        string memory _batchId,
        uint256 _timestamp,
        bytes32 _readingHash
    ) external onlyDePINOracle {
        require(_sensorOperator != address(0), "Invalid sensor operator");
        require(!sensorReadings[_readingHash].paid, "Already paid");
        
        sensorReadings[_readingHash] = SensorReading({
            sensorOperator: _sensorOperator,
            batchId: _batchId,
            timestamp: _timestamp,
            verified: true,
            paid: true
        });
        
        sensorEarnings[_sensorOperator] += sensorPaymentRate;
        payable(_sensorOperator).transfer(sensorPaymentRate);
        
        emit SensorPaymentSent(_sensorOperator, _batchId, sensorPaymentRate);
    }
    
    /**
     * @dev Finalize shipment (Guardian calls after compliance check)
     */
    function finalizeShipment(
        string memory _batchId,
        bool _isCompliant
    ) external nonReentrant onlyGuardian {
        Shipment storage shipment = shipments[_batchId];
        require(bytes(shipment.batchId).length > 0, "Shipment does not exist");
        require(!shipment.isCompleted, "Shipment already completed");
        require(!shipment.rewardFrozen, "Reward is frozen - resolve alert first");
        
        shipment.isCompleted = true;
        shipment.isCompliant = _isCompliant;
        
        if (_isCompliant) {
            // Pay distributor
            payable(shipment.distributor).transfer(shipment.rewardAmount);
            
            // Return excess to hospital
            if (shipment.escrowAmount > shipment.rewardAmount) {
                payable(shipment.payer).transfer(shipment.escrowAmount - shipment.rewardAmount);
            }
        } else {
            // Refund hospital for non-compliant delivery
            payable(shipment.payer).transfer(shipment.escrowAmount);
        }
    }
    
    /**
     * @dev Auto-unfreeze rewards after time expires
     */
    function unfreezeExpiredReward(string memory _batchId) external {
        AIAlert storage alert = activeAlerts[_batchId];
        require(bytes(alert.batchId).length > 0, "No alert exists");
        require(block.timestamp >= alert.rewardFrozenUntil, "Freeze period not expired");
        require(!alert.acknowledged, "Already acknowledged");
        
        shipments[_batchId].rewardFrozen = false;
        emit RewardUnfrozen(_batchId, shipments[_batchId].distributor);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function getShipmentStatus(string memory _batchId) external view returns (
        bool exists,
        bool isCompleted,
        bool isCompliant,
        bool rewardFrozen,
        uint256 carbonScore,
        bool carbonCreditMinted
    ) {
        Shipment memory shipment = shipments[_batchId];
        exists = bytes(shipment.batchId).length > 0;
        
        return (
            exists,
            shipment.isCompleted,
            shipment.isCompliant,
            shipment.rewardFrozen,
            shipment.carbonScore,
            shipment.carbonCreditMinted
        );
    }
    
    function getActiveAlert(string memory _batchId) external view returns (AIAlert memory) {
        return activeAlerts[_batchId];
    }
    
    function getCarbonCredit(uint256 _tokenId) external view returns (CarbonCredit memory) {
        return carbonCredits[_tokenId];
    }
    
    function getSensorEarnings(address _sensorOperator) external view returns (uint256) {
        return sensorEarnings[_sensorOperator];
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function updateAddresses(
        address _trustedAI,
        address _guardian,
        address _depinOracle
    ) external onlyOwner {
        trustedAI = _trustedAI;
        guardian = _guardian;
        depinOracle = _depinOracle;
    }
    
    function updateRates(
        uint256 _deliveryReward,
        uint256 _sensorPayment,
        uint256 _carbonCreditValue
    ) external onlyOwner {
        defaultDeliveryReward = _deliveryReward;
        sensorPaymentRate = _sensorPayment;
        carbonCreditValue = _carbonCreditValue;
    }
    
    // Fund contract for DePIN payments
    receive() external payable {}
    
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }
}