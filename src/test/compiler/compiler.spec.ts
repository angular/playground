import {WorkerMessageType} from "../../app/compiler.service";

describe("compiler worker", () => {

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  })

  describe("instantiation", () => {
    // it("should instantiate", (done) => {
    //   let worker = new Worker("/base/src/assets/compiler/compiler-worker.js");
    //   expect(worker).toBeTruthy();
    //   done();
    // });

    it("should send an instantiation message", (done: () => void) => {
      let worker = new Worker("/base/src/assets/compiler/compiler-worker.js");
      worker.onmessage = (message) => {
        console.log(message);
        expect(message.data.type).toEqual(WorkerMessageType.INSTANTIATION_COMPLETE);
        done();
      }
    })
  })
});
