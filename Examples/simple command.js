///api_version=2
(script = registerScript({
    name: "Miner",
    authors: ["CzechHek"],
    version: "2.3"
})).import("Core.lib");

command = {
    handler: function (count, radius) {
        print("ore looool", count, radius);
    }
}