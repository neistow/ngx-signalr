import {
  FactoryProvider,
  InjectionToken,
  Provider
} from '@angular/core';
import { Hub, HubFactory } from './hub-factory';
import {
  HUB_BASE_URL,
  HUB_CONNECTION_OPTIONS,
  HUB_LOG_LEVEL,
  HUB_METHOD_NAMING_POLICY,
  HUB_RETRY_POLICY
} from './injection-tokens';
import { HubConfiguration } from './hub-configuration';

export function provideHub(token: InjectionToken<Hub>, hubName: string): FactoryProvider {
  let cachedHub: Hub | null = null;

  return {
    provide: token,
    useFactory: (factory: HubFactory) => {
      if (cachedHub != null) {
        return cachedHub;
      }
      return cachedHub = factory.createHub(hubName);
    },
    deps: [HubFactory]
  };
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
