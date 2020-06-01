password = value.createText("Password", "");

module = {
    name: "BasicLogin",
    version: 1.0,
    author: "CzechHek",
    values: [password],
    onPacket: function (event) {
        (packet = event.getPacket()) instanceof S02PacketChat && packet.getChatComponent().getUnformattedText().match("/login <heslo>") && password.get().length && mc.thePlayer.sendChatMessage("/login " + password.get());
    },
    onLoad: function () {
        moduleManager.getModule(this.name).state = true;
    }
}

script.import("Core.lib");
