import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HubBase } from './hub-base';
import {
  HUB_BASE_URL,
  HUB_CONNECTION_OPTIONS,
  HUB_LOG_LEVEL,
  HUB_METHOD_NAMING_POLICY,
  HUB_RETRY_POLICY
} from './injection-tokens';
import { MethodNamingPolicy } from './default-method-naming-policy';
import {
  HubConnectionBuilder,
  IHttpConnectionOptions,
  IRetryPolicy,
  LogLevel
} from '@microsoft/signalr';

export interface IHubConnection {
  get baseUrl(): string;
  start(): Promise<void>;
  stop(): Promise<void>;
  send(methodName: string, ...args: any[]): Promise<void>;
  invoke<T = any>(methodName: string, ...args: any[]): Promise<T>;
  on(methodName: string, newMethod: (...args: any[]) => void): void;
  off(methodName: string, method?: (...args: any[]) => void): void;
  onclose(callback: (error?: Error) => void): void;
  onreconnecting(callback: (error?: Error) => void): void;
  onreconnected(callback: (connectionId?: string) => void): void;
}

type ReplaceReturnType<TFunction extends (...a: any) => any, TNewReturn>
  = (...args: Parameters<TFunction>) => TNewReturn;

type HubCommands<T> = { [key in keyof T]: (...args: any) => Observable<any> };
type HubEvents<T> = { [key in keyof T]: Observable<any> };

export type Hub<T extends HubCommands<T> = {}, K extends HubEvents<K> = {}> =
  HubBase & {
  send: { [key in keyof T]: ReplaceReturnType<T[key], Observable<void>> },
  invoke: { [key in keyof T]: T[key] },
  listen: { [key in keyof K]: K[key] }
};

/**
 * Used for creating new hub instances.
 * Connections between hubs with the same name are **not shared**.
 */
@Injectable()
export class HubFactory {

  constructor(
    @Inject(HUB_BASE_URL) private baseUrl: string,
    @Inject(HUB_LOG_LEVEL) private logLevel: LogLevel,
    @Inject(HUB_RETRY_POLICY) private retryPolicy: IRetryPolicy,
    @Inject(HUB_CONNECTION_OPTIONS) private connectionOptions: IHttpConnectionOptions,
    @Inject(HUB_METHOD_NAMING_POLICY) private methodNamingPolicy: MethodNamingPolicy,
  ) {
  }

  public createHub<T extends HubCommands<T> = {}, K extends HubEvents<K> = {}>(hubName: string): Hub<T, K> {
    const connection = this.createConnection(hubName);
    const hub = new HubBase(connection);

    const sendProxy = this.createCommandProxy(
      (methodName, args) => hub.sendCore(methodName, ...args));
    const invokeProxy = this.createCommandProxy(
      (methodName, args) => hub.invokeCore(methodName, ...args));
    const listenProxy = this.createEventProxy(
      (methodName) => hub.listenCore(methodName));

    return new Proxy(hub, {
      get(target: HubBase, property: keyof Hub<T, K>): any {
        if (property == 'send') {
          return sendProxy;
        } else if (property == 'invoke') {
          return invokeProxy;
        } else if (property == 'listen') {
          return listenProxy;
        }

        return target[property];
      }
    }) as Hub<T, K>;
  }

  protected createConnection(hubName: string): IHubConnection {
    const url = `${this.baseUrl}/${hubName}`;

    return new HubConnectionBuilder()
      .withUrl(url, this.connectionOptions)
      .withAutomaticReconnect(this.retryPolicy)
      .configureLogging(this.logLevel)
      .build();
  }

  private createCommandProxy(callback: (methodName: string, ...args: any[]) => Observable<any>): ProxyHandler<{}> {
    const convertMethodName = this.methodNamingPolicy;
    return new Proxy({}, {
      get(target: {}, methodName: string): (...args: any[]) => Observable<any> {
        return (...args: any) => callback(convertMethodName(methodName), args)
      }
    });
  }

  private createEventProxy(callback: (methodName: string) => Observable<any>): ProxyHandler<{}> {
    const convertMethodName = this.methodNamingPolicy;
    return new Proxy({}, {
      get(target: {}, methodName: string): Observable<any> {
        return callback(convertMethodName(methodName));
      }
    });
  }

}
