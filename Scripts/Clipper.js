///api_version=2
(script = registerScript({
    name: "Clipper",
    version: "2.3",
    authors: ["CzechHek"]
})).import("Core.lib");

list = [
    clipdown = value.createFloat("Down", 10, 0, 10),
    clipup = value.createFloat("Up", 2, 0, 10),
    nomove = value.createBoolean("NoMove", true),
    indicate = value.createBoolean("Indicate", true)
]

module = {
    description: "VClips through blocks using space and shift.",
    values: list,
    onUpdate: function () {
        if (mc.thePlayer.onGround) {
            for (i = 2, down = 0; i <= clipdown.get() + 2; i += 0.125) if (mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(0,-i,0)).isEmpty() && !mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(0,-i-0.125,0)).isEmpty()) {
                down = i; break;
            }
            for (i = 2, up = 0; i <= clipup.get() + 2; i += 0.125) if (mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(0,i,0)).isEmpty() && !mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(0,i-0.125,0)).isEmpty()) {
                up = i; break;
            }
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
        indicate.get() && (up || down) && mc.ingameGUI.drawCenteredString(mc.fontRendererObj, (up ? "§8[§5▲ §dUp§8]" : "") + (up && down ? " " : "") + (down ? "§8[§5▼ §dDown§8]" : ""), mc.displayWidth / 4, mc.displayHeight / 2.5, -1);
    }
}

up = down = 0; jumpStop = false;