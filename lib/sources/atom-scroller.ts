///<reference﻿ path="DefinitelyTyped/atom/atom.d.ts" />
///<reference﻿ path="atom-scroller-extensions.d.ts" />

module AtomScroller {
  export var subscriptions: eventKit.Disposable[] = [];

  function getElements(editorView: any) {
    return {
      view: <IScrollView>editorView.scrollView[0],
      linenumbers: editorView.gutter.find(".line-numbers")[0],
      content: editorView.element.querySelector(".lines.overlayer"),
      scrollbars: editorView.element.querySelectorAll(".horizontal-scrollbar, .vertical-scrollbar")
    };
  }

  export function patchEditor(editorView: any) {// EditorView
    var elements = getElements(editorView);
    var view = elements.view;
    var linenumbers = elements.linenumbers;
    var content = elements.content;
    var scrollbars = elements.scrollbars;

    Array.prototype.forEach.call(scrollbars, (bar: HTMLElement) => bar.style.display = "none");

    // Preventing any further transforms, by suppressing -webkit- prefixed property.
    content.style.transform = "translate3d(0px, 0px, 0px)";

    view.removeEventListener("scroll", editorView.component.onScrollViewScroll);
    // Getting our scrollbars here.
    view.style.overflow = "auto";

    view._atomscroller_onscroll = () => {
      // Match scroll position when touch-scrolled
      linenumbers.style.webkitTransform = "translate3d(0px, -" + view.scrollTop + "px, 0px)";
      editorView.editor.setScrollTop(view.scrollTop);
    };
    view.addEventListener("scroll", view._atomscroller_onscroll);

    view.scrollTop = editorView.editor.getScrollTop();
    view.scrollLeft = editorView.editor.getScrollLeft();
    subscriptions.push(editorView.editor.onDidChangeScrollTop((top: number) => view.scrollTop = top));
    subscriptions.push(editorView.editor.onDidChangeScrollLeft((left: number) => view.scrollLeft = left));
  }

  export function depatchEditor(editorView: any) {
    var elements = getElements(editorView);
    var view = elements.view;
    var linenumbers = elements.linenumbers;
    var content = elements.content;
    var scrollbars = elements.scrollbars;

    Array.prototype.forEach.call(scrollbars, (bar: HTMLElement) => bar.style.display = "");

    content.style.transform = "";

    view.addEventListener("scroll", editorView.component.onScrollViewScroll);

    view.style.overflow = "";

    view.removeEventListener("scroll", view._atomscroller_onscroll);
  }
}

export var activate = (state: AtomCore.IAtomState) => {
  AtomScroller.subscriptions.push(<any>atom.workspaceView.eachEditorView((editorView) => AtomScroller.patchEditor(editorView)));
}

export var deactivate = () => {
  atom.workspaceView.getEditorViews().forEach((editorView) => AtomScroller.depatchEditor(editorView));
  AtomScroller.subscriptions.forEach((subscription) =>  {
    if (subscription.dispose)
      subscription.dispose();
    else
      subscription.off();
  });
  AtomScroller.subscriptions = [];
}
