import { Model } from 'mongoloquent';
import { MONGODB_URI, MONGODB_DB_NAME } from '../config/database.js';

export default class BaseModel extends Model {
  static $connection = MONGODB_URI;
  static $databaseName = MONGODB_DB_NAME;
}