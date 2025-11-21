/**
 * Heru Smart Contract Service - REAL CONTRACT INTEGRATION
 * Connects to deployed HeruEnhanced contract on Hedera
 * Contract: 0.0.6904249
 */

import { 
  Client, 
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractFunctionParameters,
  Hbar,
  AccountId,
  PrivateKey,
  ContractId
} from "@hashgraph/sdk";

// Contract configuration
const CONTRACT_CONFIG = {
  contractId: "0.0.6904249",
  contractAddress: "0x00000000000000000000000000000000006959b9",
  network: "testnet",
  // From .env
  operatorId: import.meta.env.VITE_HEDERA_ACCOUNT_ID,
  operatorKey: import.meta.env.VITE_HEDERA_PRIVATE_KEY,
};

export interface ShipmentData {
  batchId: string;
  distributorAddress: string;
  htsTokenId: string;
  hcsTopicId: string;
  escrowAmount: number; // in HBAR
}

export interface AIAlertData {
  batchId: string;
  spoilageRisk: number; // 0-100
  alertType: string; // "TEMPERATURE", "HUMIDITY", "LOCATION"
  freezeDurationMinutes: number;
}

export interface CarbonCreditData {
  batchId: string;
  carbonSaved: number; // kg CO2
  verificationHash: string;
}

export interface ContractShipment {
  batchId: string;
  payer: string;
  distributor: string;
  escrowAmount: string;
  rewardAmount: string;
  isCompleted: boolean;
  isCompliant: boolean;
  rewardFrozen: boolean;
  createdAt: number;
  htsTokenId: string;
  hcsTopicId: string;
  carbonScore: string;
  carbonCreditMinted: boolean;
}

class HeruContractService {
  private client: Client | null = null;
  private contractId: ContractId | null = null;
  private isInitialized = false;

  /**
   * Initialize Hedera client and contract connection
   */
  async initialize(): Promise<boolean> {
    if (!CONTRACT_CONFIG.operatorId || !CONTRACT_CONFIG.operatorKey) {
      console.warn('⚠️ No Hedera credentials - contract service disabled');
      return false;
    }

    try {
      console.log('🔗 Initializing Heru Contract Service...');
      
      // Create Hedera client
      this.client = Client.forTestnet();
      this.client.setOperator(
        AccountId.fromString(CONTRACT_CONFIG.operatorId),
        PrivateKey.fromString(CONTRACT_CONFIG.operatorKey)
      );

      // Set contract ID
      this.contractId = ContractId.fromString(CONTRACT_CONFIG.contractId);

      console.log('✅ Contract Service Connected!');
      console.log(`📋 Contract ID: ${CONTRACT_CONFIG.contractId}`);
      console.log(`🔗 View on HashScan: https://hashscan.io/testnet/contract/${CONTRACT_CONFIG.contractId}`);

      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize contract service:', error);
      return false;
    }
  }

  /**
   * Create shipment with escrow on smart contract
   */
  async createShipment(data: ShipmentData): Promise<string> {
    if (!this.client || !this.contractId) {
      throw new Error('Contract service not initialized');
    }

    try {
      console.log('📝 Creating shipment on smart contract...');
      console.log('Batch ID:', data.batchId);
      console.log('Escrow Amount:', data.escrowAmount, 'HBAR');

      // Prepare function parameters
      const functionParams = new ContractFunctionParameters()
        .addString(data.batchId)
        .addAddress(data.distributorAddress)
        .addString(data.htsTokenId)
        .addString(data.hcsTopicId);

      // Execute contract function
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(300000) // Gas limit
        .setPayableAmount(new Hbar(data.escrowAmount)) // Send HBAR to contract
        .setFunction("createShipment", functionParams)
        .setMaxTransactionFee(new Hbar(2));

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      const transactionId = txResponse.transactionId.toString();

      console.log('✅ Shipment created on contract!');
      console.log(`Transaction: ${transactionId}`);
      console.log(`Status: ${receipt.status.toString()}`);
      console.log(`View: https://hashscan.io/testnet/transaction/${transactionId}`);

      return transactionId;

    } catch (error) {
      console.error('❌ Failed to create shipment on contract:', error);
      throw error;
    }
  }

  /**
   * Trigger AI alert (freezes payment)
   */
  async triggerAIAlert(data: AIAlertData): Promise<string> {
    if (!this.client || !this.contractId) {
      throw new Error('Contract service not initialized');
    }

    try {
      console.log('🤖 Triggering AI alert on contract...');
      console.log('Batch:', data.batchId);
      console.log('Risk:', data.spoilageRisk + '%');

      const functionParams = new ContractFunctionParameters()
        .addString(data.batchId)
        .addUint256(data.spoilageRisk)
        .addString(data.alertType)
        .addUint256(data.freezeDurationMinutes);

      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(200000)
        .setFunction("triggerAIAlert", functionParams)
        .setMaxTransactionFee(new Hbar(2));

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      const transactionId = txResponse.transactionId.toString();

      console.log('✅ AI Alert triggered!');
      console.log(`🔒 Payment frozen for ${data.freezeDurationMinutes} minutes`);
      console.log(`Transaction: ${transactionId}`);

      return transactionId;

    } catch (error) {
      console.error('❌ Failed to trigger AI alert:', error);
      throw error;
    }
  }

  /**
   * Acknowledge alert (unfreezes payment)
   */
  async acknowledgeAlert(batchId: string): Promise<string> {
    if (!this.client || !this.contractId) {
      throw new Error('Contract service not initialized');
    }

    try {
      console.log('✅ Acknowledging alert on contract...');

      const functionParams = new ContractFunctionParameters()
        .addString(batchId);

      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(150000)
        .setFunction("acknowledgeAlert", functionParams)
        .setMaxTransactionFee(new Hbar(2));

      const txResponse = await transaction.execute(this.client);
      const transactionId = txResponse.transactionId.toString();

      console.log('✅ Alert acknowledged!');
      console.log(`🔓 Payment unfrozen`);

      return transactionId;

    } catch (error) {
      console.error('❌ Failed to acknowledge alert:', error);
      throw error;
    }
  }

  /**
   * Mint carbon credit NFT for eco-friendly delivery
   */
  async mintCarbonCredit(data: CarbonCreditData): Promise<string> {
    if (!this.client || !this.contractId) {
      throw new Error('Contract service not initialized');
    }

    try {
      console.log('🌱 Minting Carbon Credit NFT...');
      console.log('Carbon Saved:', data.carbonSaved, 'kg CO2');

      const functionParams = new ContractFunctionParameters()
        .addString(data.batchId)
        .addUint256(data.carbonSaved)
        .addString(data.verificationHash);

      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(250000)
        .setFunction("mintCarbonCredit", functionParams)
        .setMaxTransactionFee(new Hbar(2));

      const txResponse = await transaction.execute(this.client);
      const transactionId = txResponse.transactionId.toString();

      console.log('✅ Carbon Credit NFT Minted!');
      console.log(`🎁 Distributor received 5 HBAR bonus`);
      console.log(`Transaction: ${transactionId}`);

      return transactionId;

    } catch (error) {
      console.error('❌ Failed to mint carbon credit:', error);
      throw error;
    }
  }

  /**
   * Finalize shipment (releases or refunds payment)
   */
  async finalizeShipment(batchId: string, isCompliant: boolean): Promise<string> {
    if (!this.client || !this.contractId) {
      throw new Error('Contract service not initialized');
    }

    try {
      console.log('🏁 Finalizing shipment on contract...');
      console.log('Batch:', batchId);
      console.log('Compliant:', isCompliant);

      const functionParams = new ContractFunctionParameters()
        .addString(batchId)
        .addBool(isCompliant);

      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(200000)
        .setFunction("finalizeShipment", functionParams)
        .setMaxTransactionFee(new Hbar(2));

      const txResponse = await transaction.execute(this.client);
      const transactionId = txResponse.transactionId.toString();

      console.log('✅ Shipment finalized!');
      console.log(isCompliant ? '💰 Payment released to distributor' : '💸 Payment refunded to hospital');
      console.log(`Transaction: ${transactionId}`);

      return transactionId;

    } catch (error) {
      console.error('❌ Failed to finalize shipment:', error);
      throw error;
    }
  }

  /**
   * Get shipment details from contract
   */
  async getShipment(batchId: string): Promise<ContractShipment | null> {
    if (!this.client || !this.contractId) {
      throw new Error('Contract service not initialized');
    }

    try {
      console.log('🔍 Querying shipment from contract...');

      const functionParams = new ContractFunctionParameters()
        .addString(batchId);

      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction("getShipmentStatus", functionParams);

      const result = await query.execute(this.client);

      // Parse result (adjust based on actual return structure)
      const exists = result.getBool(0);
      if (!exists) {
        console.log('❌ Shipment not found on contract');
        return null;
      }

      const shipment: ContractShipment = {
        batchId: batchId,
        payer: '', // Would need to parse from result
        distributor: '', 
        escrowAmount: '0',
        rewardAmount: '0',
        isCompleted: result.getBool(1),
        isCompliant: result.getBool(2),
        rewardFrozen: result.getBool(3),
        createdAt: 0,
        htsTokenId: '',
        hcsTopicId: '',
        carbonScore: result.getUint256(4).toString(),
        carbonCreditMinted: result.getBool(5)
      };

      console.log('✅ Shipment data retrieved:', shipment);
      return shipment;

    } catch (error) {
      console.error('❌ Failed to query shipment:', error);
      return null;
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.client !== null && this.contractId !== null;
  }

  /**
   * Get contract info
   */
  getContractInfo() {
    return {
      contractId: CONTRACT_CONFIG.contractId,
      contractAddress: CONTRACT_CONFIG.contractAddress,
      network: CONTRACT_CONFIG.network,
      isInitialized: this.isInitialized,
      explorerUrl: `https://hashscan.io/testnet/contract/${CONTRACT_CONFIG.contractId}`
    };
  }
}

// Export singleton instance
export const heruContractService = new HeruContractService();
export default HeruContractService;

