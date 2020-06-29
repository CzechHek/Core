///api_version=2
script = registerScript({
    name: "Test",
    authors: ["CzechHek"],
    version: "1.0"
});

script.import("Core2.lib");

registerModule({
    name: "test",
    values: [value.createBoolean("bool", true), value.createFloat("float", 1, 0, 2)],
    onLoad: function () {
        chat.print("load");
    }
});

registerCommand({
    commands: ["Command", "lol", "shit"],
    subcommands: {
        name: {
            lol: "shit",
            kys: "you"
        },
        autist: {
            nou: {
                yes: "no",
                no: "yes"
            },
            ok: {
                why: "tho",
                idk: "why"
            }
        }
    },
    onExecute: function () {
        chat.print("execute")
    }
})