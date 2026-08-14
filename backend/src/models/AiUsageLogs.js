import BaseModel from './BaseModel.js';

class AiUsageLog extends BaseModel {
  constructor() {
    super();
    this.setCollection('ai_usage_logs'); // override auto "aiusagelogs"
  }
}

export default AiUsageLog;