list = [
    mindelay = value.createInteger("MinDelay", 50, 0, 1000),
    maxdelay = value.createInteger("MaxDelay", 50, 0, 1000),
    onchange = value.createBoolean("OnChange", false),
    randomize = value.createBoolean("Randomize", false),
    invopen = value.createBoolean("InvOpen", false),
    slot1 = value.createText("Slot1", "Sword"),
    slot2 = value.createText("Slot2", "Pickaxe"),
    slot3 = value.createText("Slot3", "Shovel"),
    slot4 = value.createText("Slot4", "Axe"),
    slot5 = value.createText("Slot5", "Bow"),
    slot6 = value.createText("Slot6", "Food"),
    slot7 = value.createText("Slot7", "Golden Apple"),
    slot8 = value.createText("Slot8", "Block"),
    slot9 = value.createText("Slot9", "Block")
]

module = {
    name: "InventoryManager",
    author: "CzechHek",
    version: 2.3,
    values: list,
    onLoad: function () {
        timer = new MSTimer(); openInventory = false;
    },
    onUpdate: function () {
        if (!mc.thePlayer || (invopen.get() && !(mc.currentScreen instanceof GuiInventory))) return
        (mc.thePlayer.inventory.inventoryChanged || !onchange.get()) && ((!(toDrop = getGarbage()).length && !(toWear = getArmor()).length && (toSort = getSort())), mc.thePlayer.inventory.inventoryChanged = false);
        if (timer.hasTimePassed(rand(mindelay.get(), maxdelay.get()))) {
            toDrop.length ? open() && mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, toDrop.pop(), 1, 4, mc.thePlayer) : toWear.length ? open() && mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, toWear.pop(), 0, 1, mc.thePlayer) : toSort.hasNext() ? (values = toSort.next(), open(), mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, values[0], values[1], 2, mc.thePlayer)) : (openInventory && mc.getNetHandler().addToSendQueue(new C0DPacketCloseWindow(mc.thePlayer.inventoryContainer.windowId)));
            timer.reset();
        }
    },
    onPacket: function (e) {
        e.getPacket() instanceof C16PacketClientStatus && e.getPacket().getStatus() == C16PacketClientStatus.EnumState.OPEN_INVENTORY_ACHIEVEMENT && (openInventory ? e.cancelEvent() : openInventory = true);
        e.getPacket() instanceof C0DPacketCloseWindow && (openInventory = false);
    }
}

function getGarbage() {
    mc.thePlayer.inventoryContainer.detectAndSendChanges(); stacks = Java.from(mc.thePlayer.inventoryContainer.inventoryItemStacks);
    garbage = []; filteredGarbage = []; helmets = []; chestplates = []; leggings = []; boots = []; swords = []; pickaxes = []; axes = []; spades = []; bows = [];
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
            else !(item instanceof ItemBlock ? !~blockBlacklist.indexOf(item.getBlock()) : (item instanceof ItemFood || item instanceof ItemPotion || item instanceof ItemEnderPearl || item instanceof ItemEnchantedBook || item instanceof ItemBucket || ~itemWhitelist.indexOf(itemStack.getUnlocalizedName()))) && garbage.push(i);
        }
    });
    [helmets, chestplates, leggings, boots].forEach(function (c) {c.sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (b, a) {return ARMOR_COMPARATOR.compare(new ArmorPiece(stacks[a], a), new ArmorPiece(stacks[b], b))})});
    [Blocks.log, Blocks.stone, Blocks.dirt].forEach(function (t, i2) {[axes, pickaxes, spades][i2].sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (a, b) {return stacks[a].getItem().getStrVsBlock(stacks[a], t) / (stacks[a].getMaxDamage() - stacks[a].getItemDamage()) - stacks[b].getItem().getStrVsBlock(stacks[b], t) / (stacks[b].getMaxDamage() - stacks[b].getItemDamage())})});
    swords.sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (b, a) {return (stacks[a].getItem().getDamageVsEntity() + 4 + 1.25 * ItemUtils.getEnchantment(stacks[a], Enchantment.sharpness)) - (stacks[b].getItem().getDamageVsEntity() + 4 + 1.25 * ItemUtils.getEnchantment(stacks[b], Enchantment.sharpness))});
    bows.sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (a, b) {return ItemUtils.getEnchantment(stacks[a], Enchantment.power) - ItemUtils.getEnchantment(stacks[b], Enchantment.power)});
    [helmets, chestplates, leggings, boots, swords, pickaxes, axes, spades, bows].forEach(function (c) {c.length && (filteredGarbage = filteredGarbage.concat(c.slice(1)))});
    return garbage.concat(filteredGarbage).shuffle(randomize.get());
}

function getArmor() {
    armor = [];
    [helmets, chestplates, leggings, boots].forEach(function (a) {a > 8 && armor.push(a)}); 
    return armor.shuffle(randomize.get());
}

function getSort() {
    sort = []; values = [slot1.get(), slot2.get(), slot3.get(), slot4.get(), slot5.get(), slot6.get(), slot7.get(), slot8.get(), slot9.get()].map(function (v) {return v.toLowerCase()});
    values.forEach(function (v, i) {
        switch (v) {
            case "ignore": break
            case "food": stacks.some(function (stack, i2) {if (stacks[i + 36] && stacks[i + 36].getItem() instanceof ItemFood) return true; if (stack && (stack.getItem() instanceof ItemFood) && !~values.indexOf(stack.getDisplayName().toLowerCase()) && !isSet(i2)) {sort.push([i2, i]); return true}}); break
            case "blocks": case "block": stacks.some(function (stack, i2) {if (stacks[i + 36] && stacks[i + 36].getItem() instanceof ItemBlock) return true; if (stack && (stack.getItem() instanceof ItemBlock) && !~values.indexOf(stack.getDisplayName().toLowerCase()) && !isSet(i2)) {sort.push([i2, i]); return true}}); break
            default: stacks.some(function (stack, i2) {if (stacks[i + 36] && stacks[i + 36].getDisplayName().toLowerCase().match(v)) return true; if (stack && stack.getDisplayName().toLowerCase().match(v) && !isSet(i2)) {sort.push([i2, i]); return true}}); break
        }
    });
    return Java.to(sort.shuffle(randomize.get()), List).listIterator();
}

function isSet(slot) {
    if (slot < 36) return false
    switch (values[slot - 36].toLowerCase()) {
        case "ignore": return false;
        case "food": return stacks[slot].getItem() instanceof ItemFood && !~values.indexOf(stacks[slot].getDisplayName().toLowerCase());
        case "blocks": case "block": return stacks[slot].getItem() instanceof ItemBlock && !~values.indexOf(stacks[slot].getDisplayName().toLowerCase());
        default: return !!values[slot - 36].toLowerCase().match(stacks[slot].getDisplayName().toLowerCase());
    }
}

function open() {
    !openInventory && mc.getNetHandler().addToSendQueue(new C16PacketClientStatus(C16PacketClientStatus.EnumState.OPEN_INVENTORY_ACHIEVEMENT));
    return true
}

script.import("Core.lib");
ARMOR_COMPARATOR = new ArmorComparator();
Enchantment = Java.type("net.minecraft.enchantment.Enchantment");
blockBlacklist = [Blocks.enchanting_table, Blocks.chest, Blocks.ender_chest, Blocks.trapped_chest, Blocks.anvil, Blocks.sand, Blocks.web, Blocks.torch, Blocks.crafting_table, Blocks.furnace, Blocks.waterlily, Blocks.dispenser, Blocks.stone_pressure_plate, Blocks.wooden_pressure_plate, Blocks.noteblock, Blocks.dropper, Blocks.tnt, Blocks.standing_banner, Blocks.wall_banner, Blocks.redstone_torch];
itemWhitelist = ["item.arrow", "item.diamond", "item.ingotIron", "item.stick"]