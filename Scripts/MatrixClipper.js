///api_version=2
(script = registerScript({
    name: "MatrixClipper",
    authors: ["CzechHek"],
    version: "1.1"
})).import("Core.lib");

module = {
    category: "Movement",
    description: "Automatically clips you from cage.",
    values: maxticksexisted = value.createInteger("MaxTicksExisted", 10, 1, 100),
    onUpdate: function () {
        if (mc.thePlayer.ticksExisted <= maxticksexisted.get() && mc.theWorld.getBlockState(new BlockPos(mc.thePlayer).up(3)).getBlock() == Blocks.glass) {
            for (i = 3; i < 12; i++) 
                if (!mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(0, -i, 0)).isEmpty())
                    return mc.thePlayer.setPositionAndUpdate(mc.thePlayer.posX, mc.thePlayer.posY - i + 1, mc.thePlayer.posZ);
            mc.thePlayer.setPositionAndUpdate(mc.thePlayer.posX, mc.thePlayer.posY - 10, mc.thePlayer.posZ);
        }
    }
}