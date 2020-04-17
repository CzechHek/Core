list = [
    clipdown = value.createFloat("Down", 10, 0, 10),
    clipup = value.createFloat("Up", 2, 0, 10),
    nomove = value.createBoolean("NoMove", true),
    indicate = value.createBoolean("Indicate", true)
]

module = {
    name: "Clipper",
    author: "CzechHek",
    description: "VClips through blocks using space and shift.",
    version: 2.0,
    values: list,
    onUpdate: function () {
        if (mc.thePlayer.onGround) {
            for (i = 2, down = 0; i <= clipdown.get() + 2; i += 0.125) if (mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(0,-i,0)).isEmpty() && !mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(0,-i-0.125,0)).isEmpty()) down = i;
            for (i = 2, up = 0; i <= clipup.get() + 2; i += 0.125) if (mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(0,i,0)).isEmpty() && !mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(0,i-0.125,0)).isEmpty()) up = i;
            jumpStop = jumpStop && mc.gameSettings.keyBindJump.pressed;
            mc.gameSettings.keyBindJump.pressed = !jumpStop && mc.gameSettings.keyBindJump.pressed;
        }
    },
    onKey: function (k) {
        if (mc.thePlayer.onGround && (!nomove.get() || !isMovingHorizontally()) && (key = k.getKey())) {
            if (down && key == mc.gameSettings.keyBindSneak.getKeyCode()) {
                mc.gameSettings.keyBindSneak.pressed = false;
                mc.thePlayer.setPositionAndUpdate(mc.thePlayer.posX, mc.thePlayer.posY - down, mc.thePlayer.posZ);
            } else if (up && key == mc.gameSettings.keyBindJump.getKeyCode()) {
                mc.gameSettings.keyBindJump.pressed = false; jumpStop = true;
                mc.thePlayer.setPositionAndUpdate(mc.thePlayer.posX, mc.thePlayer.posY + up, mc.thePlayer.posZ);
            }
        }
    },
    onRender2D: function () {
        indicate.get() && (up || down) && mc.ingameGUI.drawCenteredString(mc.fontRendererObj, (up ? "§8[§5▲ §dUp§8]" : "") + (up && down ? " " : "") + (down ? "§8[§5▼ §dDown§8]" : ""), res.getScaledWidth() / 2, res.getScaledHeight() / 1.25, -1);
    }
}

script.import("Core.lib");
up = down = 0; jumpStop = false; res = new ScaledResolution(mc);
