///<reference﻿ path="DefinitelyTyped/atom/atom.d.ts" />
///<reference﻿ path="atom-scroller-extensions.d.ts" />
var AtomScroller;
(function (AtomScroller) {
    var regex = /translate3d\(0px, -?([0-9]*)px, 0px/;
    function transformToScroll(view, linenumber) {
        var test = linenumber.style.webkitTransform.match(regex);
        if (test.length < 1)
            return;
        var scroll = parseInt(linenumber.style.webkitTransform.match(regex)[1]);
        ;
        view.scrollTop = scroll;
    }

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
        view.removeEventListener("mousewheel", editorView.component.onMouseWheel);

        // Getting our scrollbars here.
        view.style.overflow = "auto";

        view.addEventListener("scroll", function () {
            // Match scroll position when touch-scrolled
            linenumbers.style.webkitTransform = "translate3d(0px, -" + view.scrollTop + "px, 0px)";
            editorView.editor.displayBuffer.setScrollTop(view.scrollTop);
        });

        // Match scroll position when cursor-scrolled
        transformToScroll(view, linenumbers);
        var viewobserver = new MutationObserver(function () {
            transformToScroll(view, linenumbers);
        });
        viewobserver.observe(linenumbers, { attributes: true });
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
