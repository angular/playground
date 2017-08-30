const workerPath = '/base/src/assets/sharing/test-wrapper.js';

describe('url worker instantiation', () => {
  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  })


  it('should instantiate', (done) => {
    const worker = new Worker(workerPath);
    expect(worker).toBeTruthy();
    worker.terminate();
    done();
  });
});

describe('url worker message', () => {
  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  })

  it('should respond to a postMessage', (done) => {
    const worker = new Worker(workerPath);
    worker.onmessage = (message) => {
      // confirm that it sends a response
      expect(message).toBeTruthy();
      // confirm that the encoded url starts with a hash
      expect(message.data[0]).toEqual('#');
      done();
    };

    worker.postMessage('foo');
  })
})
