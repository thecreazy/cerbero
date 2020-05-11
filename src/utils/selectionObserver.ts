const DEFAULT_OBSERVER_TIME = 2000;

type selectionDefinition = {
  event: any;
  text: string;
};

type callbackDefinition = (_: selectionDefinition) => void;
export default class SelectionObserver {
  private cb: callbackDefinition = (_:selectionDefinition) => null;
  private selection = '';

  constructor(cb: callbackDefinition) {
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
