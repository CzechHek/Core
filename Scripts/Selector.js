///api_version=2
(script = registerScript({
    name: "Selector",
    version: "1.1",
    authors: ["CzechHek", "yorik100"]
})).import("Core.lib");

list = [
    mode = value.createList("Mode", ["Bed", "Dragon_Egg", "Obsidian", "Enchanting_Table", "Crafting_Table", "Custom"], "Bed"),
    customid = value.createInteger("CustomID", 0, 0, 197),
    fucker = value.createBoolean("Fucker", true),
    blockesp = value.createBoolean("BlockESP", true)
]

module = {
    values: list,
    onEnable: function () {
        id = [26, 122, 49, 116, 58][["Bed", "Dragon_Egg", "Obsidian", "Enchanting_Table", "Crafting_Table"].indexOf(mode.get())] || customid.get();
        fucker.get() && moduleManager.getModule("Fucker").getValue("Block").set(id);
        blockesp.get() && moduleManager.getModule("BlockESP").getValue("Block").set(id);
    },
    onUpdate: function () {
        moduleManager.getModule(this.name).state = false;
    }
}
