import { ModuleWithProviders, NgModule } from '@angular/core';
import { LogLevel } from '@microsoft/signalr';
import { HubFactory } from './hub-factory';
import { DefaultRetryPolicy } from './default-retry-policy';
import {
  HUB_BASE_URL,
  HUB_CONNECTION_OPTIONS,
  HUB_LOG_LEVEL,
  HUB_METHOD_NAMING_POLICY,
  HUB_RETRY_POLICY
} from './injection-tokens';
import { DefaultMethodNamingPolicy } from './default-method-naming-policy';
import { HubConfiguration } from './hub-configuration';

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

