import { AsyncSubject } from '../AsyncSubject';
import { multicast } from './multicast';
/**
 * @return {ConnectableObservable<T>}
 * @method publishLast
 * @owner Observable
 */
export function publishLast() {
    return multicast.call(this, new AsyncSubject());
}
//# sourceMappingURL=publishLast.js.map