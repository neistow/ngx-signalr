import { Hub, HubFactory, IHubConnection } from '../lib/hub-factory';
import { TestBed } from '@angular/core/testing';
import { NgxSignalrModule } from '../lib/ngx-signalr.module';
import { InjectionToken } from '@angular/core';
import { provideHub, provideHubFactory } from '../lib/provide-helpers';
import { Observable } from 'rxjs';
import { LogLevel } from '@microsoft/signalr';

interface TestHubCommands {
  TestCommand(arg1: number, arg2: string): Observable<string>;
}

interface TestHubEvents {
  TestEvent: Observable<[number, string]>;
}

const TEST_HUB_TOKEN = new InjectionToken<Hub<TestHubCommands, TestHubEvents>>('Test Hub');

describe('ProvideHelpers', () => {

  it('should provide custom hub by token', () => {
    TestBed.configureTestingModule({
      imports: [
        NgxSignalrModule.withConfig({
          baseUrl: 'https://example.com',
        })
      ],
      providers: [
        provideHub(TEST_HUB_TOKEN, 'testHub'),
      ]
    });

    const hub = TestBed.inject(TEST_HUB_TOKEN);
    expect(hub).toBeTruthy();

    const connection = (hub as any).connection as IHubConnection;
    expect(connection.baseUrl)
      .withContext('should create with right url')
      .toEqual('https://example.com/testHub')
  });

  it('should provide custom hub by token', () => {
    TestBed.configureTestingModule({
      imports: [
        NgxSignalrModule.withConfig({
          baseUrl: 'https://example.com',
          logLevel: LogLevel.Information
        })
      ],
      providers: [
        provideHubFactory({
          baseUrl: 'https://example-override.com'
        })
      ]
    });

    const hubFactory = TestBed.inject(HubFactory);
    expect(hubFactory).toBeTruthy();

    const hub = hubFactory.createHub('testHub');
    expect(hub).toBeTruthy();

    const connection = (hub as any).connection as IHubConnection;
    expect(connection.baseUrl)
      .withContext('base url should be overridden')
      .toEqual('https://example-override.com/testHub');
  });
});
