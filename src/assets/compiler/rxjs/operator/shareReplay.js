import { multicast } from './multicast';
import { ReplaySubject } from '../ReplaySubject';
/**
 * @method shareReplay
 * @owner Observable
 */
export function shareReplay(bufferSize, windowTime, scheduler) {
    var subject;
    var connectable = multicast.call(this, function shareReplaySubjectFactory() {
        if (this._isComplete) {
            return subject;
        }
        else {
            return (subject = new ReplaySubject(bufferSize, windowTime, scheduler));
        }
    });
    return connectable.refCount();
}
;
//# sourceMappingURL=shareReplay.js.map