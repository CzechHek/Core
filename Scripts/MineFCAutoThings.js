///api_version=2
(script = registerScript({
    name: "MineFCAutoThings",
    version: "1.1",
    authors: ["Choco", "CzechHek"]
})).import("Core.lib");

module = {
    values: [
        Winmessage = value.createText("Winmessage", "gg"),
        Startmessage = value.createText("Startmessage", "xD"),
        Password = value.createText("Password", "mypassword")
    ],
    onPacket: function (event) {
        if ((packet = event.getPacket()) instanceof S02PacketChat) {
            (message = packet.getChatComponent().getUnformattedText()).contains("[Skywars] Xin chúc mừng!") && mc.thePlayer.sendChatMessage(Winmessage.get());
            message.contains("[Skywars] Trò chơi đã bắt") && mc.thePlayer.sendChatMessage(Startmessage.get());
            message.contains("Xin vui lòng đăng nhập") && mc.thePlayer.sendChatMessage("/login " + Password.get());
        }
    }
}