///api_version=2
(script = registerScript({
    name: "PacketCounter",
    authors: ["CzechHek"],
    version: "1.0"
})).import("Core.lib");

module = {
    category: "Render",
    description: "Prints how many packets you send and receive.",
    onPacket: function (e) {
        e.getPacket().class.simpleName.startsWith("C") ? sentPackets++ : receivedPackets++;
    },
    onUnload: function () {
        timer.cancel();
    },
    onRender2D: function () {
        mc.ingameGUI.drawCenteredString(mc.fontRendererObj, "§aSent§2§l " + sentPackets + " §apackets §7(" + maxSentPackets + ")", mc.displayWidth / 4, mc.displayHeight / 2.5, -1);
        mc.ingameGUI.drawCenteredString(mc.fontRendererObj, "§cReceived§4§l " + receivedPackets + " §cpackets §7(" + maxReceivedPackets + ")", mc.displayWidth / 4, (mc.displayHeight / 2.5) + 8, -1);
    }
}

sentPackets = receivedPackets = maxSentPackets = maxReceivedPackets = 0;

timer = interval(1000, function () {
    maxSentPackets = sentPackets;
    maxReceivedPackets = receivedPackets;
    sentPackets = receivedPackets = 0;
});