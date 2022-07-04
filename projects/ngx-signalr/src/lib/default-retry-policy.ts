import { IRetryPolicy, RetryContext } from '@microsoft/signalr';

const DEFAULT_RETRY_DELAYS_IN_MILLISECONDS = [0, 2000, 10000, 30000, null];

/** Default retry policy.
 * Copy-paste from @microsoft/signalr, Since it's defined as internal there.
 */
export class DefaultRetryPolicy implements IRetryPolicy {
  private readonly _retryDelays: (number | null)[];

  constructor(retryDelays?: number[]) {
    this._retryDelays = retryDelays !== undefined ? [...retryDelays, null] : DEFAULT_RETRY_DELAYS_IN_MILLISECONDS;
  }

  public nextRetryDelayInMilliseconds(retryContext: RetryContext): number | null {
    return this._retryDelays[retryContext.previousRetryCount];
  }
}
