module = {
    name: "CustomGUI",
    onEnable: function () {
        mc.displayGuiScreen(new (Java.extend(GuiScreen))() {
            func_73868_f: function () {
                return false;
            },
            func_146281_b: function () {
                CustomGUIModule.state = false;
            }
        });
    }
}

script.import("Core.lib");