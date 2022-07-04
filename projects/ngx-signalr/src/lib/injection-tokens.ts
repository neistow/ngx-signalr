import { InjectionToken } from '@angular/core';
import { IHttpConnectionOptions, IRetryPolicy, LogLevel } from '@microsoft/signalr';
import { MethodNamingPolicy } from './default-method-naming-policy';

export const HUB_BASE_URL = new InjectionToken<string>('Hub base url');
export const HUB_LOG_LEVEL = new InjectionToken<LogLevel>('Hub Default Log level');
export const HUB_RETRY_POLICY = new InjectionToken<IRetryPolicy>('Hub default retry policy');
export const HUB_CONNECTION_OPTIONS = new InjectionToken<IHttpConnectionOptions>('Hub connection options');
export const HUB_METHOD_NAMING_POLICY = new InjectionToken<MethodNamingPolicy>('Hub method naming policy');
