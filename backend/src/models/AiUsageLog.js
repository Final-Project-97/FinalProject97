import BaseModel from './BaseModel.js';

class AiUsageLog extends BaseModel {
  static $schema = {
    userId: String,
    feature: String, // recommend | chat | credit — yang nulis log: Althaf
    tokensUsed: { type: Number, default: 1 },
    metadata: Object,
  };
  constructor() {
    super();
    this.setCollection('ai_usage_logs');
  }
}

export default AiUsageLog;