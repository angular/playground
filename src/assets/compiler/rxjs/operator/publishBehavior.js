import { BehaviorSubject } from '../BehaviorSubject';
import { multicast } from './multicast';
/**
 * @param value
 * @return {ConnectableObservable<T>}
 * @method publishBehavior
 * @owner Observable
 */
export function publishBehavior(value) {
    return multicast.call(this, new BehaviorSubject(value));
}
//# sourceMappingURL=publishBehavior.js.map