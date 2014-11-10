///<reference﻿ path="DefinitelyTyped/atom/atom.d.ts" />
///<reference﻿ path="atom-scroller-extensions.d.ts" />
var AtomScroller;
(function (AtomScroller) {
    function patchEditor(editorView) {
        Array.prototype.forEach.call(editorView.element.querySelectorAll(".horizontal-scrollbar, .vertical-scrollbar"), function (bar) {
            return bar.style.display = "none";
        });

        var view = editorView.element.querySelector(".scroll-view");
        var linenumbers = editorView.gutter.find(".line-numbers")[0];
        var content = editorView.element.querySelector(".lines.overlayer");

        // Preventing any further transforms, by suppressing -webkit- prefixed property.
        content.style.transform = "translate3d(0px, 0px, 0px)";

        view.removeEventListener("scroll", editorView.component.onScrollViewScroll);

        // Getting our scrollbars here.
        view.style.overflow = "auto";

        view.addEventListener("scroll", function () {
            // Match scroll position when touch-scrolled
            linenumbers.style.webkitTransform = "translate3d(0px, -" + view.scrollTop + "px, 0px)";
            editorView.editor.setScrollTop(view.scrollTop);
        });

        view.scrollTop = editorView.editor.getScrollTop();
        view.scrollLeft = editorView.editor.getScrollLeft();
        editorView.editor.onDidChangeScrollTop(function (top) {
            return view.scrollTop = top;
        });
        editorView.editor.onDidChangeScrollLeft(function (left) {
            return view.scrollLeft = left;
        });
    }
    AtomScroller.patchEditor = patchEditor;
})(AtomScroller || (AtomScroller = {}));

exports.activate = function (state) {
    atom.workspaceView.eachEditorView(function (editorView) {
        return AtomScroller.patchEditor(editorView);
    });
};

exports.deactivate = function () {
};
