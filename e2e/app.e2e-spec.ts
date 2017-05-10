import { ChatticaPage } from './app.po';

describe('chattica App', () => {
  let page: ChatticaPage;

  beforeEach(() => {
    page = new ChatticaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
