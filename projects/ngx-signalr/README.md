# ngx-signalr

Angular wrapper for [@microsoft/signalr](https://www.npmjs.com/package/@microsoft/signalr).

## Installation

```
npm install @neistow/ngx-signalr
# or
yarn add @neistow/ngx-signalr
```

## Usage

#### 1. Import the `NgxSignalrModule`

In order to use ngx-signalr in your project you have to import `NgxSignalrModule.forRoot()` 
in root NgModule of your application. This method allows you to configure `NgxSignalrModule`
by specifying base url of your application and plenty of other useful configurations.

Configuration interface looks like this:
```typescript
interface HubConfiguration {
  baseUrl?: string;
  methodNamingPolicy?: MethodNamingPolicy,
  logLevel?: LogLevel;
  retryPolicy?: IRetryPolicy | number[];
  connectionOptions?: IHttpConnectionOptions;
}
```

#### 2. Create interfaces that describe your hub methods

Create interfaces that mock defined SignalR hub method on your server:

```typescript
export interface MyHubCommands {
  Throw(message: string): Observable<string>;
}

export interface MyHubEvents {
  catch: Observable<[string, number]>;
  ping: Observable<Date>;
}
```

#### 3. Inject `HubFactory` and create hub instance

Now you can freely create hub instances via `HubFactory` and listen to server events and
invoke commands. Also don't forget to call `connect()` and `disconnect()` methods in appropriate places.
Usually you want to do it in `OnInit` and `OnDestroy` hooks.

```typescript
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

  private testHub: Hub<TestHubCommands, TestHubEvents>;

  public serverPing$: Observable<Date>;
  public serverMessage$: Observable<[string, number]>;

  constructor(
    private hubFactory: HubFactory
  ) {
    this.testHub = this.hubFactory.createHub<TestHubCommands, TestHubEvents>('test');
    this.serverPings$ = this.testHub.listen.ping;
    this.serverMessage$ = this.testHub.listen.catch;
  }

  public ngOnInit(): void {
    this.testHub.connect();
  }

  public ngOnDestroy(): void {
    this.testHub.disconnect();
  }
}
```
