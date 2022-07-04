import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { IRetryPolicy, IHttpConnectionOptions, LogLevel } from '@microsoft/signalr';
import { HubFactory } from './hub-factory';
import { DefaultRetryPolicy } from './default-retry-policy';
import {
  HUB_BASE_URL,
  HUB_CONNECTION_OPTIONS,
  HUB_LOG_LEVEL,
  HUB_METHOD_NAMING_POLICY,
  HUB_RETRY_POLICY
} from './injection-tokens';
import { DefaultMethodNamingPolicy, MethodNamingPolicy } from './default-method-naming-policy';

export interface HubConfiguration {
  baseUrl?: string;
  methodNamingPolicy?: MethodNamingPolicy,
  logLevel?: LogLevel;
  retryPolicy?: IRetryPolicy | number[];
  connectionOptions?: IHttpConnectionOptions;
}

export function provideHubFactory(config: HubConfiguration): Provider[] {
  const providers: Provider[] = [
    HubFactory
  ];

  if (config.baseUrl) {
    providers.push({ provide: HUB_BASE_URL, useValue: config.baseUrl });
  }
  if (config.logLevel) {
    providers.push({ provide: HUB_LOG_LEVEL, useValue: config.logLevel });
  }
  if (config.retryPolicy) {
    providers.push({ provide: HUB_RETRY_POLICY, useValue: config.retryPolicy });
  }
  if (config.connectionOptions) {
    providers.push({ provide: HUB_CONNECTION_OPTIONS, useValue: config.connectionOptions });
  }
  if (config.methodNamingPolicy) {
    providers.push({ provide: HUB_METHOD_NAMING_POLICY, useValue: config.methodNamingPolicy });
  }

  return providers;
}

@NgModule()
export class NgxSignalrModule {

  public static withConfig(config: HubConfiguration): ModuleWithProviders<NgxSignalrModule> {
    return {
      ngModule: NgxSignalrModule,
      providers: [
        HubFactory,
        { provide: HUB_BASE_URL, useValue: config.baseUrl ?? '' },
        { provide: HUB_LOG_LEVEL, useValue: config.logLevel ?? LogLevel.None },
        { provide: HUB_RETRY_POLICY, useValue: config.retryPolicy ?? new DefaultRetryPolicy() },
        { provide: HUB_CONNECTION_OPTIONS, useValue: config.connectionOptions ?? {} },
        { provide: HUB_METHOD_NAMING_POLICY, useValue: DefaultMethodNamingPolicy }
      ],
    };
  }

}

