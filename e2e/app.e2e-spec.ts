import { PlaygroundPage } from './app.po';

describe('playground App', () => {
  let page: PlaygroundPage;

  beforeEach(() => {
    page = new PlaygroundPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
