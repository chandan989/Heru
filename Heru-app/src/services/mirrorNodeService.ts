/**
 * Mirror Node Service - Access ALL Heru Transactions
 * This service demonstrates where all your transactions are stored
 */

interface TransactionRecord {
  transactionId: string;
  type: string;
  timestamp: string;
  result: string;
  entityId?: string;
  memo?: string;
  fee: string;
}

interface MedicineBatchTransactions {
  batchId: string;
  nftTransaction?: TransactionRecord;
  topicTransaction?: TransactionRecord;
  contractTransactions: TransactionRecord[];
  temperatureMessages: Array<{
    consensusTimestamp: string;
    message: string;
    sequenceNumber: number;
    topicId: string;
  }>;
}

class MirrorNodeService {
  private baseUrl = 'https://testnet.mirrornode.hedera.com/api/v1';

  /**
   * Get ALL transactions for your account
   * Shows complete transaction history
   */
  async getAccountTransactions(accountId: string): Promise<TransactionRecord[]> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/transactions?limit=100`);
      const data = await response.json();
      
      return data.transactions.map((tx: any) => ({
        transactionId: tx.transaction_id,
        type: this.getTransactionType(tx.name),
        timestamp: new Date(tx.consensus_timestamp * 1000).toISOString(),
        result: tx.result,
        entityId: tx.entity_id,
        memo: tx.memo_base64 ? atob(tx.memo_base64) : undefined,
        fee: (tx.charged_tx_fee / 100000000).toFixed(8) + ' ℏ' // Convert tinybars to HBAR
      }));
    } catch (error) {
      console.error('Failed to fetch account transactions:', error);
      return [];
    }
  }

  /**
   * Get ALL contract transactions
   * Shows every smart contract interaction
   */
  async getContractTransactions(contractId: string): Promise<TransactionRecord[]> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts/${contractId}/results?limit=100`);
      const data = await response.json();
      
      return data.results.map((result: any) => ({
        transactionId: result.transaction_id,
        type: 'CONTRACT_CALL',
        timestamp: new Date(result.timestamp * 1000).toISOString(),
        result: result.result,
        fee: (result.gas_used * result.gas_price / 100000000).toFixed(8) + ' ℏ'
      }));
    } catch (error) {
      console.error('Failed to fetch contract transactions:', error);
      return [];
    }
  }

  /**
   * Get ALL HCS topic messages
   * Shows every temperature reading logged
   */
  async getTopicMessages(topicId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/topics/${topicId}/messages?limit=100`);
      const data = await response.json();
      
      return data.messages.map((msg: any) => ({
        consensusTimestamp: new Date(msg.consensus_timestamp * 1000).toISOString(),
        message: atob(msg.message), // Decode base64 message
        sequenceNumber: msg.sequence_number,
        topicId: msg.topic_id,
        runningHash: msg.running_hash
      }));
    } catch (error) {
      console.error('Failed to fetch topic messages:', error);
      return [];
    }
  }

  /**
   * Get complete medicine batch transaction history
   * This shows the MAIN CONCEPT - where everything is stored
   */
  async getMedicineBatchTransactions(batchId: string, accountId: string): Promise<MedicineBatchTransactions> {
    console.log('🔍 Fetching complete transaction history for batch:', batchId);
    
    try {
      // Get all account transactions
      const allTransactions = await this.getAccountTransactions(accountId);
      
      // Find NFT creation transaction
      const nftTransaction = allTransactions.find(tx => 
        tx.type === 'TOKEN_CREATION' && 
        tx.memo?.includes(batchId)
      );
      
      // Find HCS topic creation transaction
      const topicTransaction = allTransactions.find(tx => 
        tx.type === 'TOPIC_CREATION' && 
        tx.memo?.includes(batchId)
      );
      
      // Find all contract transactions related to this batch
      const contractTransactions = allTransactions.filter(tx => 
        tx.type === 'CONTRACT_CALL' && 
        tx.memo?.includes(batchId)
      );
      
      // Get temperature messages if topic exists
      let temperatureMessages: any[] = [];
      if (topicTransaction?.entityId) {
        temperatureMessages = await this.getTopicMessages(topicTransaction.entityId);
      }
      
      return {
        batchId,
        nftTransaction,
        topicTransaction,
        contractTransactions,
        temperatureMessages
      };
      
    } catch (error) {
      console.error('Failed to fetch batch transactions:', error);
      return {
        batchId,
        contractTransactions: [],
        temperatureMessages: []
      };
    }
  }

  /**
   * Get live transaction feed for dashboard
   */
  async getLiveTransactionFeed(accountId: string): Promise<TransactionRecord[]> {
    const transactions = await this.getAccountTransactions(accountId);
    
    // Sort by timestamp (newest first)
    return transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20); // Last 20 transactions
  }

  /**
   * Generate audit report
   * Shows complete traceability for compliance
   */
  async generateAuditReport(batchId: string, accountId: string) {
    const batchTransactions = await this.getMedicineBatchTransactions(batchId, accountId);
    
    return {
      batchId,
      summary: {
        nftCreated: !!batchTransactions.nftTransaction,
        topicCreated: !!batchTransactions.topicTransaction,
        temperatureReadings: batchTransactions.temperatureMessages.length,
        contractInteractions: batchTransactions.contractTransactions.length
      },
      timeline: this.generateTimeline(batchTransactions),
      compliance: this.calculateCompliance(batchTransactions.temperatureMessages),
      costs: this.calculateTotalCosts([
        batchTransactions.nftTransaction,
        batchTransactions.topicTransaction,
        ...batchTransactions.contractTransactions
      ].filter(Boolean))
    };
  }

  private getTransactionType(name: string): string {
    const types: Record<string, string> = {
      'TOKENCREATION': 'TOKEN_CREATION',
      'TOPICCREATION': 'TOPIC_CREATION', 
      'TOPICMESSAGE': 'TOPIC_MESSAGE',
      'CONTRACTCALL': 'CONTRACT_CALL',
      'CRYPTOTRANSFER': 'TRANSFER'
    };
    return types[name] || name;
  }

  private generateTimeline(transactions: MedicineBatchTransactions) {
    const events = [];
    
    if (transactions.nftTransaction) {
      events.push({
        timestamp: transactions.nftTransaction.timestamp,
        type: 'NFT_CREATED',
        description: 'Medicine batch NFT certificate created',
        transactionId: transactions.nftTransaction.transactionId
      });
    }
    
    if (transactions.topicTransaction) {
      events.push({
        timestamp: transactions.topicTransaction.timestamp,
        type: 'TOPIC_CREATED', 
        description: 'Temperature logging topic created',
        transactionId: transactions.topicTransaction.transactionId
      });
    }
    
    transactions.temperatureMessages.forEach(msg => {
      const data = JSON.parse(msg.message);
      events.push({
        timestamp: msg.consensusTimestamp,
        type: 'TEMPERATURE_LOG',
        description: `Temperature: ${data.data?.temperature}°C at ${data.data?.location}`,
        sequenceNumber: msg.sequenceNumber
      });
    });
    
    transactions.contractTransactions.forEach(tx => {
      events.push({
        timestamp: tx.timestamp,
        type: 'CONTRACT_INTERACTION',
        description: 'Smart contract interaction',
        transactionId: tx.transactionId
      });
    });
    
    return events.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  private calculateCompliance(messages: any[]): { rate: number; total: number; compliant: number } {
    let compliant = 0;
    
    messages.forEach(msg => {
      try {
        const data = JSON.parse(msg.message);
        const temp = data.data?.temperature;
        if (temp && temp >= -2 && temp <= 8) { // Insulin temp range
          compliant++;
        }
      } catch (error) {
        // Skip invalid messages
      }
    });
    
    return {
      rate: messages.length > 0 ? compliant / messages.length : 0,
      total: messages.length,
      compliant
    };
  }

  private calculateTotalCosts(transactions: TransactionRecord[]): string {
    const total = transactions.reduce((sum, tx) => {
      const fee = parseFloat(tx.fee.replace(' ℏ', ''));
      return sum + fee;
    }, 0);
    
    return total.toFixed(8) + ' ℏ';
  }
}

export const mirrorNodeService = new MirrorNodeService();
export default MirrorNodeService;