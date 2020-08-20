///api_version=2
(script = registerScript({
    name: "SkyPlay",
    version: "1.4",
    authors: ["CzechHek"]
})).import("Core.lib");

module = {
    onUpdate: function () {
        if (config && !!mc.getCurrentServerData() && mc.getCurrentServerData().serverIP.match("skykingdoms.net")) commandManager.executeCommand(".config load https://pastebin.com/raw/3kXNxBYV"), config = false;
        if (mc.thePlayer.getActivePotionEffect(Java.type("net.minecraft.potion.Potion").invisibility) && leave) mc.thePlayer.sendChatMessage("/sw leave"), leave = false;
    },
    onPacket: function (event) {
        if ((packet = event.getPacket()) instanceof S02PacketChat && packet.getChatComponent().getUnformattedText().match("Congratulations! you have won the game!")) mc.thePlayer.sendChatMessage("/sw leave"), leave = false;
    },
    onWorld: function () {
        if (!leave) mc.thePlayer.sendChatMessage("/sw autojoin"), leave = true;
    },
    onLoad: function () {
        SkyPlayModule.state = true;
    }
}

leave = config = true;
