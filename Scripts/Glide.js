///api_version=2
(script = registerScript({
    name: "Glide", 
    authors: ["FartCheese"], 
    version: "1.0", 
})).import("Core.lib");

module = {
    category: "Movement", 
    description: "A basic glide script.", 
    onEnable: function () {
		
    },
    onUpdate: function () {
        mc.thePlayer.motionY = -0.045;
		if (mc.gameSettings.keyBindJump.isKeyDown()) {
			mc.thePlayer.motionY = 0.23;
		}
		if (mc.gameSettings.keyBindSneak.isKeyDown()) {
			mc.thePlayer.motionY = -0.35;
		}
    },
    onDisable: function () {
		
    }
}
