list = [
    cDirection = value.createList("AutoDirection", ["Up", "Down"], "Down"),
	cDelay = value.createInteger("Delay", 20, 0, 40),
	cMaxUpDistance = value.createInteger("MaxUpDistance", 2, 0, 2),
    cMaxDownDistance = value.createInteger("MaxDownDistance", 10, 0, 10),
    cIndicate = value.createBoolean("Indicate", true)
]

module = {
    name: "CubeClipper",
    author: "CzechHek",
    version: 1.4,
    values: list,
    onUpdate: function () {
        if (mc.theWorld.getBlockState(new BlockPos(mc.thePlayer.posX, mc.thePlayer.posY + 3, mc.thePlayer.posZ)).getBlock() instanceof Java.type("net.minecraft.block.BlockBarrier") && mc.thePlayer.ticksExisted > cDelay.get()) {
            mc.thePlayer.setPositionAndUpdate(Math.floor(mc.thePlayer.posX) + 0.5, cDirection.get() == "Up" ? Math.floor(mc.thePlayer.posY + 4) : Math.floor(mc.thePlayer.posY) - 2.8, Math.floor(mc.thePlayer.posZ) + 0.5);
			mc.thePlayer.ticksExisted = cDelay.get() - 20;
        }
        for (upClip = false, up = 0; mc.thePlayer.onGround && up < cMaxUpDistance.get(); up++) {
			if (!mc.theWorld.isAirBlock(new BlockPos(mc.thePlayer.posX, mc.thePlayer.posY + up + 2, mc.thePlayer.posZ)) &&
			mc.theWorld.isAirBlock(new BlockPos(mc.thePlayer.posX, mc.thePlayer.posY + up + 3, mc.thePlayer.posZ)) &&
			mc.theWorld.isAirBlock(new BlockPos(mc.thePlayer.posX, mc.thePlayer.posY + up + 4, mc.thePlayer.posZ))) {
				upClip = true; break;
			}
		}
		for (downClip = false, down = 0; down < cMaxDownDistance.get(); down++) {
			if (mc.theWorld.isAirBlock(new BlockPos(mc.thePlayer.posX, mc.thePlayer.posY - down - 2, mc.thePlayer.posZ)) &&
			mc.theWorld.isAirBlock(new BlockPos(mc.thePlayer.posX, mc.thePlayer.posY - down - 3, mc.thePlayer.posZ)) &&
			!mc.theWorld.isAirBlock(new BlockPos(mc.thePlayer.posX, mc.thePlayer.posY - down - 4, mc.thePlayer.posZ)) && ~(mc.thePlayer.posY - down - 2)) {
				downClip = true; break;
			}
		}
		jumpStop = jumpStop && mc.gameSettings.keyBindJump.pressed;
		mc.gameSettings.keyBindJump.pressed = !jumpStop && mc.gameSettings.keyBindJump.pressed;
    },
    onKey: function (event) {
        if (mc.thePlayer.onGround && !isMovingHorizontally() && (key = event.getKey())) {
            if (key == mc.gameSettings.keyBindSneak.getKeyCode() && downClip) {
                mc.thePlayer.setPositionAndUpdate(Math.floor(mc.thePlayer.posX) + 0.5, 2 * mc.thePlayer.posY - mc.thePlayer.getEntityBoundingBox().maxY - down - 1, Math.floor(mc.thePlayer.posZ) + 0.5);
                mc.gameSettings.keyBindSneak.pressed = false;
            }
            if (key == mc.gameSettings.keyBindJump.getKeyCode() && upClip) {
                mc.thePlayer.setPositionAndUpdate(Math.floor(mc.thePlayer.posX) + 0.5, Math.floor(mc.thePlayer.posY + up + 3), Math.floor(mc.thePlayer.posZ) + 0.5);
                mc.gameSettings.keyBindSneak.pressed = false; jumpStop = true;
            }
        }
    },
    onRender2D: function () {
        cIndicate.get() && (upClip || downClip) && mc.ingameGUI.drawCenteredString(mc.fontRendererObj, (upClip ? "§8[§5▲ §dUp§8]" : "") + (upClip && downClip ? " " : "") + (downClip ? "§8[§5▼ §dDown§8]" : ""), res.getScaledWidth() / 2, res.getScaledHeight() / 1.25, -1);
    }
}

var upClip = downClip = false, up, down, jumpStop = false, BlockPos = Java.type("net.minecraft.util.BlockPos"), ScaledResolution = Java.type("net.minecraft.client.gui.ScaledResolution"), res = new ScaledResolution(mc);

script.import("Core.lib");