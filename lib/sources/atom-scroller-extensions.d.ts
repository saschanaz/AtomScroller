interface MSStyleCSSProperties {
  webkitTransform: string;
}

interface IScrollView extends HTMLElement {
  _atomscroller_onscroll?: any;
}

declare module eventKit {
  class Disposable {
    disposed: boolean;

    constructor(disposalAction: any);
    dispose(): void;
    off(): void;
  }
}
