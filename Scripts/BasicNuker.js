range = value.createFloat("Range", 5.0, 1.0, 8.0);
floorY = value.createInteger("Y", 69, 1, 255);
floor = value.createList("Floor", ["Player", "Y"], "Y");
priority = value.createList("Priority", ["Closest", "Furthest", "Coorinates"], "Closest");
fix = value.createBoolean("AutoFix", true);
undermine = value.createBoolean("Undermine", false);
packets = value.createInteger("Packets", 4, 1, 10);
maxsearch = value.createInteger("MaxSearch", 250, 1, 350);
maxblacklist = value.createInteger("MaxBlacklist", 4, 0, 350);
updateinterval = value.createInteger("UpdateInterval", 1, 1, 10);
clearcache = value.createBoolean("ClearCache", false);

module = {
    name: "BasicNuker",
    version: 3.1,
    author: "CzechHek",
    values: [range, priority, floor, floorY, undermine, fix, packets, maxsearch, maxblacklist, updateinterval, clearcache],
    onUpdate: function () {
        blocks = mc.thePlayer.ticksExisted % updateinterval.get() ? blocks : getBlocks();
        if (clearcache.get()) blocks = [], blacklisted = [], clearcache.set(false);
        if (blocks.length && mc.thePlayer.onGround) {
            if (mc.thePlayer.getCurrentEquippedItem().getMaxDamage() - mc.thePlayer.getCurrentEquippedItem().getItemDamage() > 10) {
                for (fixed = true, i = 0; i < packets.get(); i++) {
                    mc.getNetHandler().addToSendQueue(new C07PacketPlayerDigging(C07PacketPlayerDigging.Action.START_DESTROY_BLOCK, blocks[i], EnumFacing.DOWN));
                    if (updateinterval.get() > 1) blocks.shift();
                    blacklisted.push(blocks[i].toString());
                    if (blacklisted.length > maxblacklist.get()) blacklisted.shift();
                } if (blacklisted.length > maxblacklist.get()) blacklisted.shift();
            } else if (fixed) {
                if (fix.get()) mc.thePlayer.sendChatMessage("/fix");
                else chat.print("§cLow durability!"); fixed = false; 
            }
        }
    }
}

function getBlocks() {
    box = mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, new AxisAlignedBB(mc.thePlayer.posX - range.get(), floor.get() == "Y" ? (mc.thePlayer.posY + 1.62 - range.get() < floorY.get() ? floorY.get() : mc.thePlayer.posY + 1.62 - range.get()) : mc.thePlayer.posY, mc.thePlayer.posZ - range.get(), mc.thePlayer.posX + range.get(), mc.thePlayer.posY + 1.62 + range.get(), mc.thePlayer.posZ + range.get()));
    pos = new BlockPos(mc.thePlayer.posX, mc.thePlayer.posY + 1.62, mc.thePlayer.posZ);
    for (blocks = [], i = 0; i < box.length && blocks.length < maxsearch.get(); i++) {
        block = new BlockPos(box.get(i).minX, box.get(i).minY, box.get(i).minZ);
        if (~~mc.theWorld.getBlockState(block).getBlock().getPlayerRelativeBlockHardness(mc.thePlayer, mc.theWorld, block) >= 1 && distance(pos, block) <= range.get() && !~blacklisted.indexOf(block.toString()) && (undermine.get() || block.compareTo(mc.thePlayer.getPosition()) != -1)) blocks.push(block);
    } return priority.get() == "Coordinates" ? blocks : blocks.sort(function (a, b) {return distance(pos, a) > distance(pos, b) ? (priority.get() == "Closest" ? 1 : -1) : (priority.get() == "Closest" ? -1 : 1)});
}

function distance(a, b) {
    return Math.sqrt(Math.pow(Math.abs(a.getX() - b.getX()), 2) + Math.pow(Math.abs(a.getY() - b.getY()), 2) + Math.pow(Math.abs(a.getZ() - b.getZ()), 2));
}

script.import("Core.lib"); script.import("Packets.lib");
BlockPos = Java.type("net.minecraft.util.BlockPos"); EnumFacing = Java.type("net.minecraft.util.EnumFacing"); Blocks = Java.type("net.minecraft.init.Blocks"); AxisAlignedBB = Java.type("net.minecraft.util.AxisAlignedBB"); blacklisted = []; fixed = true;
