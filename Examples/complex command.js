///api_version=2
(script = registerScript({
    name: "Multiple commands",
    authors: ["CzechHek"],
    version: "3.0"
})).import("Core.lib");

mineCommand = {
    name: "Miner",
    version: "2.3",
    author: ["ur mom", "ur mom assistant"],
    aliases: ["miner", "m"],
    handler: {
        stone: function () {
            print("why", Array.prototype.slice.call(arguments));
        },
        diamond: function (count, radius) {
            print("ore looool", count, radius);
        }
    }
}

killCommand = {
    name: "Killer",
    version: "4.0",
    author: "herobrine",
    handler: function (count, message) {
        print("kill", count, Array.prototype.slice.call(arguments, 1).join(" "));
    } 
}

managerCommand = {
    name: "Manager",
    version: "3.0",
    author: "CzechHek",
    handler: {
        config: {
            list: {
                online: function () {
                    print("online configs loool");
                },
                local: function () {
                    print("local configs loool");
                }
            },
            download: [
                function (name) {
                    print("downloading", name);
                },
                function (name, fileName) {
                    print("downloading", name, "as", fileName);
                }
            ],
            save: function (name) {

            },
            delete: function (name) {

            },
            folder: function () {

            }
        },
        theme: {
            list: {
                online: function () {

                },
                local: function () {

                }
            },
            download: function (name) {

            },
            save: function (name) {

            },
            load: function (name) {

            },
            delete: function (name) {

            },
            folder: function () {

            }
        },
        script: {
            list: {
                online: function () {

                },
                local: function () {

                }
            },
            download: function (name) {

            },
            delete: function (name) {

            },
            folder: function () {

            },
            reload: function () {

            }
        },
    }
}

command = [mineCommand, killCommand, managerCommand]