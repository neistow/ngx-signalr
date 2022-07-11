import { HubFactory, IHubConnection } from '../lib/hub-factory';
import { TestBed } from '@angular/core/testing';
import { NgxSignalrModule } from '../lib/ngx-signalr.module';
import { lastValueFrom, Observable } from 'rxjs';
import { Injector } from '@angular/core';
import {
  HUB_BASE_URL,
  HUB_CONNECTION_OPTIONS,
  HUB_LOG_LEVEL,
  HUB_METHOD_NAMING_POLICY,
  HUB_RETRY_POLICY
} from '../lib/injection-tokens';

interface TestHubCommands {
  TestCommand(arg1: number, arg2: string): Observable<string>;
}

interface TestHubEvents {
  TestEvent: Observable<[number, string]>;
}

class HubFactoryWithFakeConnection extends HubFactory {

  constructor(
    private connection: IHubConnection,
    private injector: Injector
  ) {
    super(
      injector.get(HUB_BASE_URL),
      injector.get(HUB_LOG_LEVEL),
      injector.get(HUB_RETRY_POLICY),
      injector.get(HUB_CONNECTION_OPTIONS),
      injector.get(HUB_METHOD_NAMING_POLICY),
    );
  }

  protected override createConnection(hubName: string): IHubConnection {
    return this.connection;
  }
}

describe('HubFactory', () => {
  const TEST_HUB_NAME = 'TestHub'

  let hubFactory: HubFactory;
  let spyConnection: jasmine.SpyObj<IHubConnection>;

  beforeEach(() => {

    spyConnection = jasmine.createSpyObj<IHubConnection>({
        start: Promise.resolve(),
        stop: Promise.resolve(),
        invoke: Promise.resolve(),
        send: Promise.resolve(),
        on: undefined,
        off: undefined,
        onclose: undefined,
        onreconnecting: undefined,
        onreconnected: undefined,
        get baseUrl(): string {
          return ''
        }
      }
    );

    TestBed.configureTestingModule({
      imports: [
        NgxSignalrModule.withConfig({
          baseUrl: 'https://example.com',
        })
      ],
      providers: [
        {
          provide: HubFactory,
          useFactory: (injector: Injector) => new HubFactoryWithFakeConnection(spyConnection, injector),
          deps: [Injector]
        }
      ]
    });
    hubFactory = TestBed.inject(HubFactory);
  });

  it('#createHub should create hub', () => {
    const hub = hubFactory.createHub(TEST_HUB_NAME);
    expect(hub).toBeTruthy();
  });

  it('custom commands can be called using invoke', async () => {

    const hub = hubFactory.createHub<TestHubCommands>(TEST_HUB_NAME);
    expect(hub.invoke.TestCommand)
      .toBeTruthy();

    hub.connect();
    // use lastValueFrom in order to check if observable completes
    await lastValueFrom(hub.invoke.TestCommand(42, 'str'))
    expect(spyConnection.invoke)
      .toHaveBeenCalledOnceWith('TestCommand', 42, 'str');
  });

  it('custom commands can be called using send', async () => {
    const hub = hubFactory.createHub<TestHubCommands>(TEST_HUB_NAME);
    expect(hub.send.TestCommand)
      .toBeTruthy();

    hub.connect();
    // use lastValueFrom in order to check if observable completes
    await lastValueFrom(hub.send.TestCommand(42, 'str'))
    expect(spyConnection.send)
      .toHaveBeenCalledOnceWith('TestCommand', 42, 'str');
  });

  it('custom events can be listened to using listen', async () => {
    const hub = hubFactory.createHub<void, TestHubEvents>(TEST_HUB_NAME);
    expect(hub.listen.TestEvent)
      .toBeTruthy();

    hub.connect();
    hub.listen.TestEvent.subscribe().unsubscribe();
    expect(spyConnection.on.calls.first().args[0])
      .withContext('spy connection on called with correct methodName')
      .toEqual('TestEvent');

    expect(spyConnection.on)
      .withContext('spy connection on called once')
      .toHaveBeenCalledTimes(1);
  });
});
