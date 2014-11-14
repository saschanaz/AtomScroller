///<reference﻿ path="DefinitelyTyped/atom/atom.d.ts" />
///<reference﻿ path="atom-scroller-extensions.d.ts" />
var AtomScroller;
(function (AtomScroller) {
    AtomScroller.subscriptions = [];
    function getElements(editorView) {
        return {
            view: editorView.scrollView[0],
            linenumbers: editorView.gutter.find(".line-numbers")[0],
            content: editorView.element.querySelector(".lines.overlayer"),
            scrollbars: editorView.element.querySelectorAll(".horizontal-scrollbar, .vertical-scrollbar")
        };
    }
    function patchEditor(editorView) {
        var elements = getElements(editorView);
        var view = elements.view;
        var linenumbers = elements.linenumbers;
        var content = elements.content;
        var scrollbars = elements.scrollbars;
        Array.prototype.forEach.call(scrollbars, function (bar) { return bar.style.display = "none"; });
        // Preventing any further transforms, by suppressing -webkit- prefixed property.
        content.style.transform = "translate3d(0px, 0px, 0px)";
        view.removeEventListener("scroll", editorView.component.onScrollViewScroll);
        // Getting our scrollbars here.
        view.style.overflow = "auto";
        view._atomscroller_onscroll = function () {
            // Match scroll position when touch-scrolled
            linenumbers.style.webkitTransform = "translate3d(0px, -" + view.scrollTop + "px, 0px)";
            editorView.editor.setScrollTop(view.scrollTop);
        };
        view.addEventListener("scroll", view._atomscroller_onscroll);
        view.scrollTop = editorView.editor.getScrollTop();
        view.scrollLeft = editorView.editor.getScrollLeft();
        AtomScroller.subscriptions.push(editorView.editor.onDidChangeScrollTop(function (top) { return view.scrollTop = top; }));
        AtomScroller.subscriptions.push(editorView.editor.onDidChangeScrollLeft(function (left) { return view.scrollLeft = left; }));
        console.log(AtomScroller.subscriptions);
    }
    AtomScroller.patchEditor = patchEditor;
    function depatchEditor(editorView) {
        var elements = getElements(editorView);
        var view = elements.view;
        var linenumbers = elements.linenumbers;
        var content = elements.content;
        var scrollbars = elements.scrollbars;
        Array.prototype.forEach.call(scrollbars, function (bar) { return bar.style.display = ""; });
        content.style.transform = "";
        view.addEventListener("scroll", editorView.component.onScrollViewScroll);
        view.style.overflow = "";
        view.removeEventListener("scroll", view._atomscroller_onscroll);
    }
    AtomScroller.depatchEditor = depatchEditor;
})(AtomScroller || (AtomScroller = {}));
exports.activate = function (state) {
    AtomScroller.subscriptions.push(atom.workspaceView.eachEditorView(function (editorView) { return AtomScroller.patchEditor(editorView); }));
};
exports.deactivate = function () {
    atom.workspaceView.getEditorViews().forEach(function (editorView) { return AtomScroller.depatchEditor(editorView); });
    AtomScroller.subscriptions.forEach(function (subscription) {
        if (subscription.dispose)
            subscription.dispose();
        else
            subscription.off();
    });
    AtomScroller.subscriptions = [];
};
