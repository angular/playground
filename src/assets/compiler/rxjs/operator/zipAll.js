import { ZipOperator } from './zip';
/**
 * @param project
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method zipAll
 * @owner Observable
 */
export function zipAll(project) {
    return this.lift(new ZipOperator(project));
}
//# sourceMappingURL=zipAll.js.map