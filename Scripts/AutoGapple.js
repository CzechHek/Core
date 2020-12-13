///api_version=2
(script = registerScript({
    name: "AutoGapple",
    authors: ["commandblock2", "yorik100", "CzechHek"],
    version: "2.2"
})).import("Core.lib");

var timer = new MSTimer(), Potion = Java.type('net.minecraft.potion.Potion');

module = {
    description: "Eats golden apple when your health is low.",
    category: "Player",
    values: [
        health = value.createFloat("Health", 10, 1, 20),
        itemswitchdelay = value.createInteger("Delay", 100, 0, 1000),
        regencheck = value.createBoolean("RegenCheck", false),
        absorptioncheck = value.createBoolean("AbsorptionCheck", false),
        chestcheck = value.createBoolean("ChestCheck", false),
        inventorycheck = value.createBoolean("InventoryCheck", false),
        changeonetick = value.createBoolean("ChangeOneTick", false)
    ],
    onEnable: function () {
        isChanging = gAppleIndex = null;
        changeTicks = 0;
    },
    onUpdate: function () {
        if (changeTicks > 0) changeTicks++;
        if (isChanging && changeTicks > 3) {
            isChanging = !!(changeTicks = 0);
            sendPacket(new C08PacketPlayerBlockPlacement(BlockPos.ORIGIN, 255, mc.thePlayer.inventory.mainInventory[gAppleIndex - 36], 0, 0, 0));
            for (i = -1; ++i < 32;) sendPacket(new C03PacketPlayer(mc.thePlayer.onGround));
            if (mc.thePlayer.inventory.currentItem != gAppleIndex) sendPacket(new C09PacketHeldItemChange(mc.thePlayer.inventory.currentItem));
            if (KillAuraModule.blockingStatus || mc.thePlayer.isBlocking()) sendPacket(new C08PacketPlayerBlockPlacement(BlockPos.ORIGIN, 255, mc.thePlayer.inventory.getCurrentItem(), 0, 0, 0));
        }
        if (mc.thePlayer.getHealth() > 0 && mc.thePlayer.getHealth() <= health.get()) {
            gAppleIndex = InventoryUtils.findItem(9, 45, Items.golden_apple);
            if (~gAppleIndex && (gAppleIndex - 36 | 44 - gAppleIndex) >= 0 && timer.hasTimePassed(itemswitchdelay.get()) && (!(mc.currentScreen instanceof GuiChest) || !chestcheck.get()) && (!(mc.currentScreen instanceof GuiInventory) || !inventorycheck.get()) && (mc.thePlayer.getAbsorptionAmount() <= 0 || !absorptioncheck.get()) && (!mc.thePlayer.isPotionActive(Potion.regeneration) || !regencheck.get())) {
                if (mc.thePlayer.inventory.currentItem != gAppleIndex) sendPacket(new C09PacketHeldItemChange(gAppleIndex - 36));
                if (!changeonetick.get()) {
                    sendPacket(new C08PacketPlayerBlockPlacement(BlockPos.ORIGIN, 255, mc.thePlayer.inventory.mainInventory[gAppleIndex - 36], 0, 0, 0));
                    for (i = -1; ++i < 32;) sendPacket(new C03PacketPlayer(mc.thePlayer.onGround));
                    if (mc.thePlayer.inventory.currentItem != gAppleIndex && !changeonetick.get()) sendPacket(new C09PacketHeldItemChange(mc.thePlayer.inventory.currentItem));
                    if (KillAuraModule.blockingStatus || mc.thePlayer.isBlocking()) sendPacket(new C08PacketPlayerBlockPlacement(BlockPos.ORIGIN, 255, mc.thePlayer.inventory.getCurrentItem(), 0, 0, 0));
                } else isChanging = !!(changeTicks = 1);
                timer.reset();
            } else if ((gAppleIndex - 9 | 35 - gAppleIndex) >= 0 && InventoryUtils.hasSpaceHotbar()) {
                if (!(mc.currentScreen instanceof GuiInventory)) sendPacket(new C16PacketClientStatus(C16PacketClientStatus.EnumState.OPEN_INVENTORY_ACHIEVEMENT));
                mc.playerController.windowClick(0, gAppleIndex, 0, 1, mc.thePlayer);
                if (!(mc.currentScreen instanceof GuiInventory)) sendPacket(new C0DPacketCloseWindow());
            }
        }
    },
    onPacket: function (e) {
        if (isChanging && e.getPacket() instanceof C09PacketHeldItemChange) e.cancelEvent();
    },
    onDisable: function () {
        if (isChanging) {
            isChanging = false;
            sendPacket(new C08PacketPlayerBlockPlacement(BlockPos.ORIGIN, 255, mc.thePlayer.inventory.mainInventory[gAppleIndex - 36], 0, 0, 0));
            for (i = -1; ++i < 32;) sendPacket(new C03PacketPlayer(mc.thePlayer.onGround));
            if (mc.thePlayer.inventory.currentItem != gAppleIndex) sendPacket(new C09PacketHeldItemChange(mc.thePlayer.inventory.currentItem));
            if (KillAuraModule.blockingStatus || mc.thePlayer.isBlocking()) sendPacket(new C08PacketPlayerBlockPlacement(BlockPos.ORIGIN, 255, mc.thePlayer.inventory.getCurrentItem(), 0, 0, 0));
        }
    }
}