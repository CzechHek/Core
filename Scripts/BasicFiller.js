expand = value.createInteger("Expand", 3, 1, 5);
direction = value.createList("Direction", ["Forward", "Left", "Right", "Switch"], "Right");

module = {
    name: "BasicFiller",
    version: 1.7,
    author: "CzechHek",
    values: [expand, direction],
    onMove: function (event) {
        event.setSafeWalk(true);
        direction.get() == "Switch" && (dir = !dir);
        for (i = 0; i < expand.get() && (!!mc.thePlayer.getHeldItem() && mc.thePlayer.getHeldItem().getItem() instanceof Java.type("net.minecraft.item.ItemBlock")); i++) {
            rotation = mc.thePlayer.getHorizontalFacing();
            block = new BlockPos(mc.thePlayer.posX, mc.thePlayer.posY - 1, mc.thePlayer.posZ).offset(direction.get() == "Forward" ? rotation : direction.get() == "Left" || dir == false ? rotation.rotateYCCW() : rotation.rotateY(), i);
            if (mc.theWorld.isAirBlock(block)) {
                event.setX(0); event.setZ(0); mc.getNetHandler().addToSendQueue(new C08PacketPlayerBlockPlacement(block.offset(rotation, -1), rotation.getIndex(), mc.thePlayer.getHeldItem(), 0, 0, 0));
            }
            if (i == expand.get()) mc.thePlayer.moveToBlockPosAndAngles(mc.thePlayer.getPosition().offset(rotation), mc.thePlayer.rotationYaw, mc.thePlayer.rotationPitch)
        }
    }
}

BlockPos = Java.type("net.minecraft.util.BlockPos"); var dir;

script.import("Core.lib"); script.import("Timing.lib"); script.import("Packets.lib");