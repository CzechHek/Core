maxdelay = value.createInteger("MaxDelay", 2700, 0, 3500); 
mindelay = value.createInteger("MinDelay", 2400, 0, 3500);

module = {
    name: "BasicWinner",
    values: [maxdelay, mindelay],
    version: 2.1,
    author: "CzechHek",
    onPacket: function (event) {
        if (event instanceof S02PacketChat && event.getChatComponent().getUnformattedText().match("Opis slovo")) {
            delay(~~(Math.random() * (maxdelay.get() - mindelay.get() + 1)) + mindelay.get(), function () {mc.thePlayer.sendChatMessage(event.getPacket().getChatComponent().getUnformattedText().split(" ")[4])});
        }
    },
}

script.import("Core.lib"); script.import("Timing.lib"); script.import("Packets.lib");
