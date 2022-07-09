import { IHubConnection } from '../lib/hub-factory';
import { HubBase } from '../lib/hub-base';
import { lastValueFrom } from 'rxjs';


describe('HubBase', () => {
  let hubBase: HubBase;
  let connectionSpy: jasmine.SpyObj<IHubConnection>;

  beforeEach(() => {
    connectionSpy = jasmine.createSpyObj( {
      start: Promise.resolve(),
      stop: Promise.resolve(),
      invoke: Promise.resolve(),
      send: Promise.resolve(),
      on: undefined,
      off: undefined,
      onclose: undefined,
      onreconnecting: undefined,
      onreconnected: undefined,
    });
    hubBase = new HubBase(connectionSpy);
  });

  it('#connect should call connection start method', () => {
    hubBase.connect();

    expect(connectionSpy.start)
      .withContext('spy connection start called once')
      .toHaveBeenCalledOnceWith();
  });

  it('#disconnect should call connection stop method', () => {
    hubBase.disconnect();

    expect(connectionSpy.stop)
      .withContext('spy connection stop called once')
      .toHaveBeenCalledOnceWith();
  });

  it('#sendCore should call correct method with args', async () => {
    const methodName = 'testMethod';
    const args = [42, 'arg'];

    hubBase.connect();
    // use lastValueFrom in order to check if observable completes
    await lastValueFrom(hubBase.sendCore(methodName, ...args));

    expect(connectionSpy.send)
      .withContext('spy connection send called once with correct methodName and args')
      .toHaveBeenCalledOnceWith(methodName, ...args);
  });

  it('#invokeCore should call correct method with args', async () => {
    const methodName = 'testMethod';
    const args = [42, 'arg'];

    hubBase.connect();
    // use lastValueFrom in order to check if observable completes
    await lastValueFrom(hubBase.invokeCore(methodName, ...args));

    expect(connectionSpy.invoke)
      .withContext('spy connection invoke called once with correct methodName and args')
      .toHaveBeenCalledOnceWith(methodName, ...args);
  });

  it('#listenCore should call on with correct method', () => {
    const methodName = 'testMethod';

    hubBase.connect();
    hubBase.listenCore(methodName).subscribe().unsubscribe();

    expect(connectionSpy.on)
      .withContext('spy connection on called once')
      .toHaveBeenCalledTimes(1);

    expect(connectionSpy.on.calls.first().args[0])
      .withContext('spy connection on called with correct methodName')
      .toEqual(methodName);
  });

  it('#listenCore should call off with correct method', () => {
    const methodName = 'testMethod';

    hubBase.connect();
    hubBase.listenCore(methodName).subscribe().unsubscribe();

    expect(connectionSpy.off)
      .withContext('spy connection off called once')
      .toHaveBeenCalledTimes(1);

    expect(connectionSpy.off.calls.first().args[0])
      .withContext('spy connection off called with correct methodName')
      .toEqual(methodName);
  });

  it('#closed$ should call onclose method', async () => {
    hubBase.connect();
    hubBase.closed$.subscribe().unsubscribe();

    expect(connectionSpy.onclose)
      .withContext('spy connection onclose called once')
      .toHaveBeenCalledTimes(1);
  });

  it('#reconnecting$ should call onclose method', async () => {
    hubBase.connect();
    hubBase.reconnecting$.subscribe().unsubscribe();

    expect(connectionSpy.onreconnecting)
      .withContext('spy connection onreconnecting called once')
      .toHaveBeenCalledTimes(1);
  });

  it('#reconnected$ should call onreconnected method', async () => {
    hubBase.connect();
    hubBase.reconnected$.subscribe().unsubscribe();

    expect(connectionSpy.onreconnected)
      .withContext('spy connection onreconnected called once')
      .toHaveBeenCalledTimes(1);
  });
});
