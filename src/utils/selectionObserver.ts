const DEFAULT_OBSERVER_TIME = 2000;

export default class SelectionObserver {
  private cb = _ => null;
  private selection = '';

  constructor(cb) {
    this.cb = cb;
    this.observerValue = this.observerValue.bind(this);
    setInterval(this.observerValue, DEFAULT_OBSERVER_TIME);
  }

  private getSelectionText = () => window.getSelection().toString();

  private observerValue = () => {
    const newSelection = this.getSelectionText();
    if(newSelection === this.selection || newSelection === '') return;
    this.selection = newSelection;
    this.cb({
      event: window.getSelection(),
      text: this.selection,
    });
  }
}
