const editor = document.getElementById("jsoneditor");
if (editor) {
  new Editor(editor, editor.getAttribute("data-source") as string);
}
