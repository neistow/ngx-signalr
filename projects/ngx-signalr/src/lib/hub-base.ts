import {
  defer,
  Observable,
  ReplaySubject,
  shareReplay,
  switchMapTo,
  take
} from 'rxjs';
import { IHubConnection } from './hub-factory';

/**
 * Provides a basic functionality for interacting with hub
 */
export class HubBase {

  private connectionStarted: ReplaySubject<void> = new ReplaySubject(1);

  public closed$: Observable<Error | null> = new Observable<Error | null>(sub => {
    const handler = (error?: Error) => sub.next(error);
    this.connection.onclose(handler);
  }).pipe(shareReplay());

  public reconnecting$: Observable<Error | null> = new Observable<Error | null>(sub => {
    const handler = (error?: Error) => sub.next(error);
    this.connection.onreconnecting(handler);
  }).pipe(shareReplay());

  public reconnected$: Observable<string | null> = new Observable<string | null>(sub => {
    const handler = (connectionId?: string) => sub.next(connectionId);
    this.connection.onreconnected(handler);
  }).pipe(shareReplay());

  constructor(
    private connection: IHubConnection
  ) {
  }

  public connect(): void {
    this.connection.start().then(() => this.connectionStarted.next());
  }

  public disconnect(): void {
    this.connection.stop().then(() => this.connectionStarted.complete());
  }

  public sendCore(methodName: string, ...args: any[]): Observable<void> {
    return this.whenReady(
      defer(() => this.connection.send(methodName, ...args))
    );
  }

  public invokeCore<T = any>(methodName: string, ...args: any[]): Observable<T> {
    return this.whenReady(
      defer(() => this.connection.invoke<T>(methodName, ...args))
    );
  }

  // TODO: maybe multicast observable
  public listenCore<T = any>(methodName: string): Observable<T> {
    return new Observable<T>(sub => {
      const handler = (...args: any[]) => {
        if (args.length === 1 || args.length === 0) {
          sub.next(...args);
        } else {
          sub.next(args as unknown as T);
        }
      };
      this.connection.on(methodName, handler);
      return () => this.connection.off(methodName, handler);
    });
  }

  private whenReady(obs: Observable<any>): Observable<any> {
    return this.connectionStarted.pipe(
      switchMapTo(obs),
      take(1)
    )
  }
}
