///api_version=2
(script = registerScript({
    name: "Subcommands",
    authors: ["CzechHek"],
    version: "2.0"
})).import("Core.lib");

command = {
    commands: ["Manager", "m"],
    subcommands: {
        config: {
            list: {
                online: "",
                local: ""
            },
            download: "name",
            upload: "name",
            save: "name",
            load: "name",
            delete: "name",
            folder: ""
        },
        theme: {
            list: {
                online: "",
                local: ""
            },
            download: "name",
            upload: "name",
            save: "name",
            load: "name",
            delete: "name",
            folder: ""
        },
        script: {
            list: {
                online: "",
                local: ""
            },
            download: "name",
            upload: "name",
            load: "name",
            delete: "name",
            folder: ""
        },
        music: {
           list: {
               online: "",
               local: ""
           },
           download: "name",
           upload: "name",
           delete: "name",
           folder: ""
        }
    },
    onExecute: function () {
        chat.print("cc");
    }
}