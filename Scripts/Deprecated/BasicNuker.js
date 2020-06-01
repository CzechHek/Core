list = [
    range = value.createFloat("Range", 6.0, 1.0, 8.0),
    floorY = value.createInteger("Y", 69, 1, 255),
    floor = value.createList("Floor", ["Player", "Y"], "Y"),
    priority = value.createList("Priority", ["Closest", "Furthest", "Highest", "Lowest", "None"], "Closest"),
    fix = value.createBoolean("AutoFix", true),
    undermine = value.createBoolean("Undermine", false),
    packets = value.createInteger("Packets", 6, 1, 10),
    maxsearch = value.createInteger("MaxSearch", 250, 1, 350),
    maxpackets = value.createInteger("MaxPackets", 110, 60, 180),
    autohaste = value.createBoolean("AutoHaste", false),
    command = value.createText("Command", "/home")
]

module = {
    name: "BasicNuker",
    version: 3.4,
    author: "CzechHek",
    values: list,
    onUpdate: function () {
        if (autohaste.get()) {
            if (mc.thePlayer.getActivePotionEffect(Potion.digSpeed) && mc.thePlayer.getActivePotionEffect(Potion.digSpeed).getAmplifier()) (home && home < mc.thePlayer.ticksExisted) && (home = 0, mc.thePlayer.sendChatMessage("/back"));
            else if (!home) home = mc.thePlayer.ticksExisted + 60, mc.thePlayer.sendChatMessage(command.get());
        }
        !(mc.thePlayer.ticksExisted % 20) && (count = 0, blacklisted = []);
        sortedblocks = getBlocks();
        if (sortedblocks.length && mc.thePlayer.onGround) {
            if (mc.thePlayer.getCurrentEquippedItem().getMaxDamage() - mc.thePlayer.getCurrentEquippedItem().getItemDamage() > 15) {
                for (i = 0; (count + 20 - mc.thePlayer.ticksExisted % 20) < maxpackets.get() && i < packets.get() && sortedblocks.length; i++) {
                    blacklisted.push(sortedblocks[0].toString());
                    mc.getNetHandler().addToSendQueue(new C07PacketPlayerDigging(C07PacketPlayerDigging.Action.START_DESTROY_BLOCK, sortedblocks.shift(), EnumFacing.DOWN));
                } fixed = true;
            } else if (fixed) {
                if (fix.get()) mc.thePlayer.sendChatMessage("/fix");
                else chat.print("§cLow durability!"); fixed = false; 
            }
        }
    },
    onEnable: function () {
        count = 0;
    },
    onPacket: function (event) {
        event.getPacket().toString().match(".client.") && count++;
    }
}

function getBlocks() {
    box = mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, new AxisAlignedBB(mc.thePlayer.posX - range.get(), floor.get() == "Y" ? (mc.thePlayer.posY + 1.62 - range.get() < floorY.get() ? floorY.get() : mc.thePlayer.posY + 1.62 - range.get()) : mc.thePlayer.posY, mc.thePlayer.posZ - range.get(), mc.thePlayer.posX + range.get(), mc.thePlayer.posY + 1.62 + range.get(), mc.thePlayer.posZ + range.get()));
    pos = new BlockPos(mc.thePlayer.posX, mc.thePlayer.posY + 1.62, mc.thePlayer.posZ);
    for (blocks = [], i = 0; i < box.length && blocks.length < maxsearch.get(); i++) {
        block = new BlockPos(box.get(i).minX, box.get(i).minY, box.get(i).minZ);
        if (~~mc.theWorld.getBlockState(block).getBlock().getPlayerRelativeBlockHardness(mc.thePlayer, mc.theWorld, block) >= 1 && distance(block) <= range.get() && !~blacklisted.indexOf(block.toString()) && (undermine.get() || block.compareTo(mc.thePlayer.getPosition()) != -1)) blocks.push(block);
    }
    switch (priority.get()) {
        case "Closest": return blocks.sort(function (a,b) {
            return distance(a) > distance(b) ? 1 : -1;
        });
        case "Furthest": return blocks.sort(function (a,b) {
            return distance(a) < distance(b) ? 1 : -1;
        });
        case "Highest": return blocks.sort(function (a,b) {
            return a.getY() < b.getY() ? 1 : -1;
        });
        case "Lowest": return blocks.sort(function (a,b) {
            return a.getY() > b.getY() ? 1 : -1;
        });
        default: return blocks;
    }
}

function distance(b) {
    return Math.sqrt(Math.pow(mc.thePlayer.posX - b.getX(), 2) + Math.pow(mc.thePlayer.posY + 1.62 - b.getY(), 2) + Math.pow(mc.thePlayer.posZ - b.getZ(), 2));
}

var blacklisted = [], fixed = true, sortedblocks = [], count, home;
BlockPos = Java.type("net.minecraft.util.BlockPos"); EnumFacing = Java.type("net.minecraft.util.EnumFacing"); Blocks = Java.type("net.minecraft.init.Blocks"); AxisAlignedBB = Java.type("net.minecraft.util.AxisAlignedBB"); Potion = Java.type("net.minecraft.potion.Potion");

script.import("Core.lib");
