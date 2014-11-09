///<reference﻿ path="DefinitelyTyped/atom/atom.d.ts" />
///<reference﻿ path="atom-scroller-extensions.d.ts" />
var AtomScroller;
(function (AtomScroller) {
    function removeListeners(el) {
        //only replace the ancestor element
        var clone = el.cloneNode(false);

        for (var index = el.childNodes.length - 1; index >= 0; --index)
            clone.insertBefore(el.childNodes[index], clone.firstChild);

        //insert back into DOM
        el.parentNode.replaceChild(clone, el);
        return clone;
    }
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
        Array.prototype.forEach.call(editorView.querySelectorAll(".horizontal-scrollbar, .vertical-scrollbar"), function (bar) {
            return bar.style.display = "none";
        });

        var view = editorView.gutter.find(".scroll-view");
        var linenumbers = editorView.gutter.find(".line-numbers");
        var content = editorView.gutter.find(".lines.overlayer");

        // Preventing any further transforms, by suppressing -webkit- prefixed property.
        content.style.transform = "translate3d(0px, 0px, 0px)";

        view = removeListeners(view);

        // Getting our scrollbars here.
        view.style.overflow = "auto";
        view.style.height = "100%";

        view.addEventListener("scroll", function () {
            // Match scroll position when touch-scrolled
            linenumbers.style.webkitTransform = "translate3d(0px, -" + view.scrollTop + "px, 0px)";
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
