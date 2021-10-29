///api_version=2
(script = registerScript({
    name: "BetterFastPlace",
    authors: ["CzechHek"],
    version: "1.0"
})).import("Core.lib");

module = {
    description: "Only places fast when you have blocks equipped.",
    category: "Player",
    values: delay = value.createInteger("Delay", 0, 0, 2),
    onUpdate: function () {
        if (mc.rightClickDelayTimer == 4 && mc.thePlayer.getHeldItem() && mc.thePlayer.getHeldItem().getItem() instanceof ItemBlock) mc.rightClickDelayTimer = delay.get() + 1;
    }
}