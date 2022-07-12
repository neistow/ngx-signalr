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
  throw(message: string): Observable<string>;
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

#### 4. Alternative usage

If your child components need to use your hub you can use `provideHub` helper function
to leverage angular local providers. `provideHub` function accepts injection token of your hub
and hub name as a parameters and creates a provider under the hood using `HubFactory`.

The only thing you left to do is inject hub via token in parent and descendants.
Hub instance will the same during all injections.

```typescript

// 0. Describe interfaces
interface MyHubCommands {
  doSomething(): Observable<void>;
}

interface MyHubEvents {
  listenToSomething: Observable<Date>;
}
type MyHub = Hub<MyHubCommands, MyHubEvents>;

// 1. Create hub injection token
const MY_HUB_TOKEN = new InjectionToken<MyHub>('My Hub');

@Component({
  selector: 'app-parent',
  templateUrl: './app-parent.component.html',
  styleUrls: ['./app-parent.component.scss'],
  providers: [
    provideHub(MY_HUB_TOKEN, 'my-hub')
  ]
})
export class AppParentComponent implements OnInit, OnDestroy {
  
  // 2. Inject hub by crearted token
  constructor(
      @Inject(MY_HUB_TOKEN) private myHub: MyHub
  ) {
  }

  // 3. Use it!
  public ngOnInit(): void {
    this.myHub.connect();
  }

  public ngOnDestroy(): void {
    this.myHub.disconnect();
  }
}
```
