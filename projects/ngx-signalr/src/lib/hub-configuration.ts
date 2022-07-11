import { MethodNamingPolicy } from './default-method-naming-policy';
import { IHttpConnectionOptions, IRetryPolicy, LogLevel } from '@microsoft/signalr';

export interface HubConfiguration {
  baseUrl?: string;
  methodNamingPolicy?: MethodNamingPolicy,
  logLevel?: LogLevel;
  retryPolicy?: IRetryPolicy | number[];
  connectionOptions?: IHttpConnectionOptions;
}
