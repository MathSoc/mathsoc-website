# Information relating to page editor

## I want to add a new editor node

Excellent! The page editor was designed with implementation of new nodes in mind. To do so, simply add a new `Editor[YourTypeHere]Node` under the `editor-nodes` folder, similar to how existing nodes have been implemented. Then, be sure to add it to the `EditorNode`'s node selection logic.

Try not to change `useEditorData` while you do so. Ideally, using `getDataValue`/`setDataValue` should be enough for any new nodes.

If they're not, be sure to test your changes thoroughly. This is liable to break in a myriad of edge cases - be careful!

## Why is this React?

This page editor is our first use of React on the MathSoc website. Unlike on other parts of the site,
here we've used React for two reasons:

1. No SEO: React's use of client-side rendering can often interfere with SEO, but since the admin side of the website is strictly admin-facing, it's not something we need to worry about having readable by googlebot.
2. Complexity: Relative to much of the rest of the website, this admin editor is especially complex, requiring reactive updates to data changes and tree-composition logic that React lends itself well to.


