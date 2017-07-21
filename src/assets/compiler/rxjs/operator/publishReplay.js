import { ReplaySubject } from '../ReplaySubject';
import { multicast } from './multicast';
/**
 * @param bufferSize
 * @param windowTime
 * @param scheduler
 * @return {ConnectableObservable<T>}
 * @method publishReplay
 * @owner Observable
 */
export function publishReplay(bufferSize, windowTime, scheduler) {
    if (bufferSize === void 0) { bufferSize = Number.POSITIVE_INFINITY; }
    if (windowTime === void 0) { windowTime = Number.POSITIVE_INFINITY; }
    return multicast.call(this, new ReplaySubject(bufferSize, windowTime, scheduler));
}
//# sourceMappingURL=publishReplay.js.map