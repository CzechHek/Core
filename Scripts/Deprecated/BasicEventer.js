list = [
maxdelay = value.createInteger("MaxDelay", 2700, 0, 3500),
mindelay = value.createInteger("MinDelay", 2400, 0, 3500),
mode = value.createList("Mode", ["Win events", "Host event"], "Win events"),
fakemessage = value.createText("FakeMessage", "cau kamo jak se dneska mas u me v poho"),
prize = value.createInteger("Prize", 200, 0, 1000)
]

module = {
    name: "BasicEventer",
    values: list,
    version: 2.6,
    author: "CzechHek",
    onPacket: function (event) {
        if (event.getPacket() instanceof S02PacketChat) {
            if (mode.get() == "Win events") {
                event.getPacket().getChatComponent().getFormattedText().match("§r§c§lReakce") && delay(~~(Math.random() * (maxdelay.get() - mindelay.get() + 1)) + mindelay.get(), function () {mc.thePlayer.sendChatMessage(event.getPacket().getChatComponent().getUnformattedText().split(" ")[4])});
            } else if (!!slovo && event.getPacket().getChatComponent().getUnformattedText().split(" > ")[1] == slovo) {
                timer.cancel(); mode.set("Win events");
                mc.thePlayer.sendChatMessage(fakemessage.get() + " &eHrac &c" + event.getPacket().getChatComponent().getFormattedText().split("§a")[1].split(" ")[0] + " &evyhral v case &c" + (cas / 1000).toFixed(2) + " &esekund!");
                delay(3000, function () {mc.thePlayer.sendChatMessage("/pay " + event.getPacket().getChatComponent().getFormattedText().split("§a")[1].split(" ")[0] + " " + prize.get())});
                cas = 0; slovo = null; potvrzeni = 0;
            }
        }
        if (event.getPacket() instanceof C01PacketChatMessage) {
            if (mode.get() == "Host event") {
                if (!potvrzeni) {
                    potvrzeni = 1; slovo = event.getPacket().getMessage();
                    chat.print("§4▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔")
                    chat.print("§cYour event should look like this§4: §7(start it by writing §8" + slovo + "§7 again)"); chat.print("");
                    chat.print(mc.thePlayer.getDisplayName().getFormattedText() + " §r§7§l>§r§f " + fakemessage.get() + " §cReakce §r§8● §r§eOpis slovo §r§c" + slovo + " §r§ejako prvni!");
                    chat.print("§4▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁");
                    event.cancelEvent();
                } else if (potvrzeni == 1) {
                    if (event.getPacket().getMessage() == slovo) {
                        timer = interval(1, function () {cas++}); slovo = event.getPacket().getMessage();
                        chat.print("§a§lEvent was started§2§l!"); event.cancelEvent();
                        mc.thePlayer.sendChatMessage(fakemessage.get() + " &cReakce &8● &eOpis slovo &c" + slovo + " &ejako prvni!"); potvrzeni = 2;
                    } else if (!event.getPacket().getMessage().match("&cReakce &8●")) {
                        mode.set("Win events"); event.cancelEvent();
                        chat.print("§c§lEvent was cancelled§4§l!"); potvrzeni = 0;
                    }
                }
            }
        }
    },
    onLoad: function () {
        moduleManager.getModule(this.name).state = true;
    }
}

var timer, packets = 0, cas = 0, slovo, potvrzeni;

script.import("Core.lib");
