class Editor {
    JSONEditor: any;
    container: HTMLElement;
    options: any;
    editor:any; 

    constructor() {
        this.JSONEditor = window["JSONEditor"];
        this.container = document.getElementById("jsoneditor");
        this.options = {};
        this.editor = new this.JSONEditor(this.container, this.options);
    }

    useEditor(data): void {
        this.editor.set(data)
    }

    saveData(link): void {
        const data = this.editor.get();
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }

        fetch(link, options).then(res => {
            if(res.status == 401) {
                console.log("BAD OBJECT SHAPE")
            } else {
                location.reload();
            }
        });
    }
}
