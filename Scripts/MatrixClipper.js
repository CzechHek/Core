///api_version=2
(script = registerScript({
    name: "MatrixClipper",
    authors: ["CzechHek"],
    version: "1.2"
})).import("Core.lib");

module = {
    category: "Movement",
    description: "Automatically clips you from cage.",
    values: maxticksexisted = value.createInteger("MaxTicksExisted", 10, 1, 100),
    onUpdate: function () {
        if (mc.thePlayer.ticksExisted <= maxticksexisted.get() && mc.theWorld.getBlockState(new BlockPos(mc.thePlayer).up(3)).getBlock() == Blocks.glass) mc.thePlayer.setPositionAndUpdate(mc.thePlayer.posX, mc.thePlayer.posY - 3, mc.thePlayer.posZ);
    }
}
