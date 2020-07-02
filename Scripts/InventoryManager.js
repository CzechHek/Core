list = [
    mindelay = value.createInteger("MinDelay", 50, 0, 1000),
    maxdelay = value.createInteger("MaxDelay", 50, 0, 1000),
    startdelay = value.createInteger("StartDelay", 100, 0, 1000),
    randomize = value.createBoolean("Randomize", false),
    invopen = value.createBoolean("InvOpen", false),
    slot1 = value.createText("Slot1", "Sword"),
    slot2 = value.createText("Slot2", "Pickaxe"),
    slot3 = value.createText("Slot3", "Shovel"),
    slot4 = value.createText("Slot4", " Axe"),
    slot5 = value.createText("Slot5", "Bow"),
    slot6 = value.createText("Slot6", "Food"),
    slot7 = value.createText("Slot7", "Golden Apple"),
    slot8 = value.createText("Slot8", "Ender Pearl"),
    slot9 = value.createText("Slot9", "Block")
]

module = {
    name: "InventoryManager",
    author: "CzechHek",
    version: 3.4,
    values: list,
    onLoad: function () {
        timer = new MSTimer();
    },
    onUpdate: function () {
        if (mc.currentScreen instanceof GuiInventory || !invopen.get() && !mc.currentScreen || mc.currentScreen instanceof ClickGui) (toDrop = getGarbage()).length ? open() && mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, toDrop.pop(), 1, 4, mc.thePlayer) : (toWear = getArmor()).length ? open() && mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, toWear.pop(), 0, 1, mc.thePlayer) : (toSort = getSort()).hasNext() ? (values = toSort.next(), open(), mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, values[0], values[1], 2, mc.thePlayer)) : openInventory && !mc.currentScreen && mc.getNetHandler().addToSendQueue(new C0DPacketCloseWindow(mc.thePlayer.inventoryContainer.windowId)), timer.reset();
        else if (mc.currentScreen instanceof GuiChest && received) (toGrab = getUseful()).hasNext() ? (values = toGrab.next(), mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, values[0], values[1], values[2] || 2, mc.thePlayer)) : mc.thePlayer.closeScreen(), timer.reset();
    },
    onPacket: function (e) {
        e.getPacket() instanceof C16PacketClientStatus && e.getPacket().getStatus() == C16PacketClientStatus.EnumState.OPEN_INVENTORY_ACHIEVEMENT && (openInventory ? e.cancelEvent() : openInventory = true);
        e.getPacket() instanceof C0DPacketCloseWindow && (openInventory = received = false);
        e.getPacket() instanceof S30PacketWindowItems && timeout(startdelay.get(), function () {received = true});
    }
}

function canAttack() {
    for (i in mc.theWorld.playerEntities) if (mc.thePlayer.canAttackPlayer(entity = mc.theWorld.playerEntities[i]) && entity != mc.thePlayer && !AntiBotClass.isBot(entity)) return true;
    return mc.theWorld.playerEntities.length > 1
}

function getGarbage() {
    mc.thePlayer.inventoryContainer.detectAndSendChanges(); stacks = Java.from(mc.thePlayer.inventoryContainer.inventoryItemStacks);
    garbage = []; helmets = []; chestplates = []; leggings = []; boots = []; swords = []; pickaxes = []; axes = []; spades = []; bows = [];
    stacks.forEach(function (itemStack, i) {
        if (itemStack && (item = itemStack.getItem())) {
            if (item instanceof ItemArmor) {
                switch (item.armorType) {
                    case 0: helmets.push(i); break
                    case 1: chestplates.push(i); break
                    case 2: leggings.push(i); break
                    case 3: boots.push(i); break
                }
            } else if (item instanceof ItemTool) {
                item instanceof ItemAxe && axes.push(i);
                item instanceof ItemPickaxe && pickaxes.push(i);
                item instanceof ItemSpade && spades.push(i);
            } else if (item instanceof ItemSword) swords.push(i);
            else if (item instanceof ItemBow) bows.push(i);
            else (item instanceof ItemBlock ? ~blockBlacklist.indexOf(item.getBlock()) : !(item instanceof ItemFood || item instanceof ItemPotion || item instanceof ItemEnderPearl || item instanceof ItemEnchantedBook || item instanceof ItemBucket || ~itemWhitelist.indexOf(itemStack.getUnlocalizedName()))) && garbage.push(i);
        }
    });
    [helmets, chestplates, leggings, boots].forEach(function (c) {c.sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (b, a) {return ARMOR_COMPARATOR.compare(new ArmorPiece(stacks[a], a), new ArmorPiece(stacks[b], b))})});
    [Blocks.log, Blocks.stone, Blocks.dirt].forEach(function (t, i2) {[axes, pickaxes, spades][i2].sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (a, b) {return stacks[a].getItem().getStrVsBlock(stacks[a], t) / (stacks[a].getMaxDamage() - stacks[a].getItemDamage()) - stacks[b].getItem().getStrVsBlock(stacks[b], t) / (stacks[b].getMaxDamage() - stacks[b].getItemDamage())})});
    swords.sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (b, a) {return (stacks[a].getItem().getDamageVsEntity() + 4 + 1.25 * ItemUtils.getEnchantment(stacks[a], Enchantment.sharpness)) - (stacks[b].getItem().getDamageVsEntity() + 4 + 1.25 * ItemUtils.getEnchantment(stacks[b], Enchantment.sharpness))});
    bows.sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (a, b) {return ItemUtils.getEnchantment(stacks[a], Enchantment.power) - ItemUtils.getEnchantment(stacks[b], Enchantment.power)});
    [helmets, chestplates, leggings, boots, swords, pickaxes, axes, spades, bows].forEach(function (c) {c.length && (garbage = garbage.concat(c.slice(1)))});
    return garbage.shuffle(randomize.get());
}

function getUseful() {
    mc.thePlayer.inventoryContainer.detectAndSendChanges(); mc.currentScreen.inventorySlots.detectAndSendChanges(); stacks = Java.from(mc.currentScreen.inventorySlots.inventoryItemStacks);
    useful = []; filteredUseful = []; helmets = []; chestplates = []; leggings = []; boots = []; swords = []; pickaxes = []; axes = []; spades = []; bows = [];
    stacks.forEach(function (itemStack, i) {
        if (itemStack && (item = itemStack.getItem())) {
            if (item instanceof ItemArmor) {
                switch (item.armorType) {
                    case 0: helmets.push(i); break
                    case 1: chestplates.push(i); break
                    case 2: leggings.push(i); break
                    case 3: boots.push(i); break
                }
            } else if (item instanceof ItemTool) {
                item instanceof ItemAxe && axes.push(i);
                item instanceof ItemPickaxe && pickaxes.push(i);
                item instanceof ItemSpade && spades.push(i);
            } else if (item instanceof ItemSword) swords.push(i);
            else if (item instanceof ItemBow) bows.push(i);
            else i < mc.currentScreen.lowerChestInventory.getSizeInventory() && (item instanceof ItemBlock ? !~blockBlacklist.indexOf(item.getBlock()) : (item instanceof ItemFood || item instanceof ItemPotion || item instanceof ItemEnderPearl || item instanceof ItemEnchantedBook || item instanceof ItemBucket || ~itemWhitelist.indexOf(itemStack.getUnlocalizedName()))) && useful.push(i);

        };
    });
    [helmets, chestplates, leggings, boots].forEach(function (c, i) {c.sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (b, a) {return ARMOR_COMPARATOR.compare(new ArmorPiece(stacks[a], 0), new ArmorPiece(stacks[b], 0))}); if (c.length && c[0] < mc.currentScreen.lowerChestInventory.getSizeInventory() && !~ARMOR_COMPARATOR.compare(new ArmorPiece(stacks[c[0]], 0), new ArmorPiece(mc.thePlayer.inventory.armorInventory[3 - i], 0))) [helmets, chestplates, leggings, boots][i][0] = 54});
    [Blocks.log, Blocks.stone, Blocks.dirt].forEach(function (t, i2) {[axes, pickaxes, spades][i2].sort(function (a, b) {return b - a}).sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (a, b) {return stacks[a].getItem().getStrVsBlock(stacks[a], t) / (stacks[a].getMaxDamage() - stacks[a].getItemDamage()) - stacks[b].getItem().getStrVsBlock(stacks[b], t) / (stacks[b].getMaxDamage() - stacks[b].getItemDamage())})});
    swords.sort(function (a, b) {return b - a}).sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (b, a) {return (stacks[a].getItem().getDamageVsEntity() + 4 + 1.25 * ItemUtils.getEnchantment(stacks[a], Enchantment.sharpness)) - (stacks[b].getItem().getDamageVsEntity() + 4 + 1.25 * ItemUtils.getEnchantment(stacks[b], Enchantment.sharpness))});
    bows.sort(function (a, b) {return b - a}).sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (a, b) {return ItemUtils.getEnchantment(stacks[a], Enchantment.power) - ItemUtils.getEnchantment(stacks[b], Enchantment.power)});
    [helmets, chestplates, leggings, boots, swords, pickaxes, axes, spades, bows].forEach(function (c) {c.length && c[0] < mc.currentScreen.lowerChestInventory.getSizeInventory() && useful.push(c[0])});
    useful = useful.shuffle(randomize.get());

    sort = []; values = [slot1.get(), slot2.get(), slot3.get(), slot4.get(), slot5.get(), slot6.get(), slot7.get(), slot8.get(), slot9.get()].map(function (v) {return v.toLowerCase()});
    useful.forEach(function (s) {
        values.some(function (v, i) {
            switch (v) {
                case "ignore": case "ignored": break
                case "food": if (stacks[s].getItem() instanceof ItemFood && !~values.indexOf(stacks[s].getDisplayName().toLowerCase()) && !isSet(stacks.length - 9 + i)) {sort.push([s, i]); return true}; break
                case "blocks": case "block": if (stacks[s].getItem() instanceof ItemBlock && !~values.indexOf(stacks[s].getDisplayName().toLowerCase()) && !isSet(stacks.length - 9 + i)) {sort.push([s, i]); return true}; break
                default: if (stacks[s].getDisplayName().toLowerCase().match(v) && !isSet(stacks.length - 9 + i)) {sort.push([s, i]); return true};
            } i >= 8 && sort.push([s, 0, 1]);
        });
    });
    return Java.to(sort.shuffle(randomize.get()), List).iterator();
}

function getArmor() {
    armor = [];
    [helmets, chestplates, leggings, boots].forEach(function (a) {a.length && a[0] > 8 && armor.push(a[0])}); 
    return armor.shuffle(randomize.get());
}

function getSort() {
    sort = []; values = [slot1.get(), slot2.get(), slot3.get(), slot4.get(), slot5.get(), slot6.get(), slot7.get(), slot8.get(), slot9.get()].map(function (v) {return v.toLowerCase()});
    values.forEach(function (v, i) {
        switch (v) {
            case "ignore": case "ignored": break
            case "food": stacks.some(function (stack, i2) {if (stacks[i + 36] && stacks[i + 36].getItem() instanceof ItemFood) return true; if (stack && (stack.getItem() instanceof ItemFood) && !~values.indexOf(stack.getDisplayName().toLowerCase()) && !isSet(i2)) {sort.push([i2, i]); return true}}); break
            case "blocks": case "block": stacks.some(function (stack, i2) {if (stacks[i + 36] && stacks[i + 36].getItem() instanceof ItemBlock) return true; if (stack && (stack.getItem() instanceof ItemBlock) && !~values.indexOf(stack.getDisplayName().toLowerCase()) && !isSet(i2)) {sort.push([i2, i]); return true}}); break
            default: stacks.some(function (stack, i2) {if (stacks[i + 36] && stacks[i + 36].getDisplayName().toLowerCase().match(v)) return true; if (stack && stack.getDisplayName().toLowerCase().match(v) && !isSet(i2)) {sort.push([i2, i]); return true}}); break
        }
    });
    return Java.to(sort.shuffle(randomize.get()), List).listIterator();
}

function isSet(slot) {
    position = stacks.length - 9
    if (slot < position || !stacks[slot]) return false
    switch (values[slot - position].toLowerCase()) {
        case "ignore": case "ignored": return false;
        case "food": return stacks[slot].getItem() instanceof ItemFood && !~values.indexOf(stacks[slot].getDisplayName().toLowerCase());
        case "blocks": case "block": return stacks[slot].getItem() instanceof ItemBlock && !~values.indexOf(stacks[slot].getDisplayName().toLowerCase());
        default: return !!values[slot - position].toLowerCase().match(stacks[slot].getDisplayName().toLowerCase());
    }
}

function open() {
    !openInventory && mc.getNetHandler().addToSendQueue(new C16PacketClientStatus(C16PacketClientStatus.EnumState.OPEN_INVENTORY_ACHIEVEMENT)); timer.reset();
    return true
}

script.import("Core.lib");

received = openInventory = false;
ARMOR_COMPARATOR = new ArmorComparator();
Enchantment = Java.type("net.minecraft.enchantment.Enchantment");
ClickGui = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.ClickGui");
blockBlacklist = [Blocks.enchanting_table, Blocks.chest, Blocks.ender_chest, Blocks.trapped_chest, Blocks.anvil, Blocks.sand, Blocks.web, Blocks.torch, Blocks.crafting_table, Blocks.furnace, Blocks.waterlily, Blocks.dispenser, Blocks.stone_pressure_plate, Blocks.wooden_pressure_plate, Blocks.noteblock, Blocks.dropper, Blocks.tnt, Blocks.standing_banner, Blocks.wall_banner, Blocks.redstone_torch];
itemWhitelist = ["item.arrow", "item.diamond", "item.ingotIron", "item.stick"];