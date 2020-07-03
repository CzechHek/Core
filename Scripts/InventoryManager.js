list = [
    actions = value.createList("Actions", ["Open Chests", "Steal Items", "Drop Garbage", "Equip Armor", "Sort Hotbar", ""], ""),
    actionslist = value.createText("", "Open Chests, Steal Items, Drop Garbage, Equip Armor, Sort Hotbar"),
    mindelay = value.createInteger("MinDelay", 50, 20, 1000),
    maxdelay = value.createInteger("MaxDelay", 50, 20, 1000),
    startdelay = value.createInteger("StartDelay", 100, 20, 1000),
    closedelay = value.createInteger("CloseDelay", 100, 20, 1000),
    noattackdelay = value.createInteger("NoAttackDelay", 500, 20, 1000),
    opendelay = value.createInteger("OpenDelay", 100, 20, 1000),
    openrange = value.createFloat("OpenRange", 5, 3, 8),
    openwallsrange = value.createFloat("OpenWallsRange", 3, 1, 8),
    randomize = value.createBoolean("Randomize", false),
    invopen = value.createBoolean("InvOpen", false),
    slot1 = value.createText("Slot1", "Sword"),
    slot2 = value.createText("Slot2", "Pickaxe"),
    slot3 = value.createText("Slot3", "Shovel"),
    slot4 = value.createText("Slot4", "Axe"),
    slot5 = value.createText("Slot5", "Bow"),
    slot6 = value.createText("Slot6", "Food"),
    slot7 = value.createText("Slot7", "Golden Apple"),
    slot8 = value.createText("Slot8", "Ender Pearl"),
    slot9 = value.createText("Slot9", "Block")
]

module = {
    name: "InventoryManager",
    category: "Player",
    author: "CzechHek",
    version: 5.5,
    values: list,
    onUpdate: function () {
        updateValues();
        if (isInLobby() || !attackTimer.hasTimePassed(noattackdelay.get()) || !timer.hasTimePassed(rand(mindelay.get(), maxdelay.get()))) return
        actionslist.get().contains("Open Chests") && !mc.currentScreen && openTimer.hasTimePassed(opendelay.get()) && (toOpen = getToOpen()) && (mc.playerController.onPlayerRightClick(mc.thePlayer, mc.theWorld, null, toOpen.getPos(), EnumFacing.DOWN, mc.thePlayer.getLookVec()), openTimer.reset());
        mc.currentScreen instanceof GuiInventory || mc.currentScreen instanceof GuiContainerCreative || (!invopen.get() && (!mc.currentScreen || mc.currentScreen instanceof ClickGui)) ? (actionslist.get().contains("Drop Garbage") && ((toDrop = getToDrop()).length) ? checkopen() && mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, toDrop.pop(), 1, 4, mc.thePlayer) : (actionslist.get().contains("Equip Armor") && (toTake = getToTake()).length) ? checkopen() && mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, toTake.pop(), 0, 1, mc.thePlayer) : (actionslist.get().contains("Sort Hotbar") && (toSort = getToSort()).hasNext()) ? (values = toSort.next(), checkopen(), mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, values[0], values[1], 2, mc.thePlayer)) : openInventory && !mc.currentScreen && mc.getNetHandler().addToSendQueue(new C0DPacketCloseWindow(mc.thePlayer.inventoryContainer.windowId)), timer.reset())
        : (actionslist.get().contains("Steal Items") && mc.currentScreen instanceof GuiChest && received) && ((toSteal = getToSteal()).hasNext() ? (values = toSteal.next(), mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, values[0] || values, values[1] || 0, values[2] || 2, mc.thePlayer), (closeTimer = new MSTimer()).reset()) : (!closeTimer || closeTimer.hasTimePassed(closedelay.get())) && (mc.thePlayer.closeScreen(), timer.reset(), closeTimer = null));
    },
    onPacket: function (e) {
        e.getPacket() instanceof C16PacketClientStatus && e.getPacket().getStatus() == C16PacketClientStatus.EnumState.OPEN_INVENTORY_ACHIEVEMENT && (openInventory ? e.cancelEvent() : openInventory = true);
        e.getPacket() instanceof C0DPacketCloseWindow && (openInventory = received = false);
        e.getPacket() instanceof S30PacketWindowItems && timeout(startdelay.get(), function () {received = true});
        openChest && e.getPacket() instanceof S2DPacketOpenWindow && e.getPacket().getGuiId() == "minecraft:chest" && (openChests.push(openChest), openChest = null);
    },
    onAttack: function () {
        attackTimer.reset();
    }
}

function isInLobby() {
    for (i in mc.theWorld.loadedEntityList) if ((e = mc.theWorld.loadedEntityList[i]) instanceof IBossDisplayData || (e instanceof EntityArmorStand && !e.getCustomNameTag().contains(":"))) return true;
    return !mc.thePlayer.capabilities.allowEdit
}

function getToOpen() {
    Java.from(mc.theWorld.loadedTileEntityList).some(function (chest) {
        if (chest instanceof TileEntityChest && !~openChests.indexOf(chest)) {
            eyes = mc.thePlayer.getPositionEyes(.0);
            bb = (state = mc.theWorld.getBlockState(chest.getPos())).getBlock().getCollisionBoundingBox(mc.theWorld, chest.getPos(), state);
            distances = []; visible = false;
            [new Vec3(bb.minX, bb.minY, bb.minZ), new Vec3(bb.minX, bb.minY, bb.maxZ), new Vec3(bb.minX, bb.maxY, bb.minZ), new Vec3(bb.minX, bb.maxY, bb.maxZ), new Vec3(bb.maxX, bb.minY, bb.minZ), new Vec3(bb.maxX, bb.minY, bb.maxZ), new Vec3(bb.maxX, bb.maxY, bb.minZ), new Vec3(bb.maxX, bb.maxY, bb.maxZ)].forEach(function (v) {visible = visible || !(result = mc.theWorld.rayTraceBlocks(eyes, v)) || result.getBlockPos().equals(chest.getPos()); distances.push(Math.sqrt(Math.pow(eyes.xCoord - v.xCoord, 2) + Math.pow(eyes.yCoord - v.yCoord, 2) + Math.pow(eyes.zCoord - v.zCoord, 2)))});
            if (Math.min.apply(null, distances) < (visible ? openrange.get() : openwallsrange.get())) return openChest = chest;
        }
    });
    return openChest;
}

function updateValues() {
    if (mc.currentScreen instanceof ClickGui) {
        actions.get() && (~(valuesList = actionslist.get().split(", ")).indexOf(actions.get()) ? valuesList.splice(valuesList.indexOf(actions.get()), 1) : valuesList.push(actions.get()), actionslist.set(valuesList.filter(Boolean).sort(function (a, b) {return ["Open Chests", "Steal Items", "Drop Garbage", "Equip Armor", "Sort Hotbar"].indexOf(a) - ["Open Chests", "Steal Items", "Drop Garbage", "Equip Armor", "Sort Hotbar"].indexOf(b)}).join(", ")), actions.set(""), updated = false);
        if (!updated)
            active = [actions, actionslist],
            actionslist.get().split(", ").forEach(function (a) {
                switch (a) {
                    case "Open Chests": active.push(opendelay, openrange, openwallsrange); break;
                    case "Steal Items": active.push(mindelay, maxdelay, startdelay, closedelay, randomize, invopen); break
                    case "Drop Garbage": case "Equip Armor": active.push(mindelay, maxdelay, noattackdelay, randomize, invopen); break
                    case "Sort Hotbar": active.push(mindelay, maxdelay, noattackdelay, randomize, invopen, slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9);
                }
            }),
            setValues(InventoryManagerModule, active.sort(function (a, b) {return list.indexOf(a) - list.indexOf(b)}).filter(function (item, pos, ary) {return !pos || item != ary[pos - 1]})), updated = true;
    } else if (updated) setValues(InventoryManagerModule, list), LiquidBounce.fileManager.saveConfig(LiquidBounce.fileManager.valuesConfig), updated = false;
}

function getToDrop() {
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

function getToSteal() {
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
    [helmets, chestplates, leggings, boots].forEach(function (c, i) {c.sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (b, a) {return ARMOR_COMPARATOR.compare(new ArmorPiece(stacks[a], 0), new ArmorPiece(stacks[b], 0))}); if (c.length && c[0] < mc.currentScreen.lowerChestInventory.getSizeInventory() && mc.thePlayer.inventory.armorInventory[3 - i] && !~ARMOR_COMPARATOR.compare(new ArmorPiece(stacks[c[0]], 0), new ArmorPiece(mc.thePlayer.inventory.armorInventory[3 - i], 0))) [helmets, chestplates, leggings, boots][i][0] = 54});
    [Blocks.log, Blocks.stone, Blocks.dirt].forEach(function (t, i2) {[axes, pickaxes, spades][i2].sort(function (a, b) {return b - a}).sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (a, b) {return stacks[a].getItem().getStrVsBlock(stacks[a], t) / (stacks[a].getMaxDamage() - stacks[a].getItemDamage()) - stacks[b].getItem().getStrVsBlock(stacks[b], t) / (stacks[b].getMaxDamage() - stacks[b].getItemDamage())})});
    swords.sort(function (a, b) {return b - a}).sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (b, a) {return (stacks[a].getItem().getDamageVsEntity() + 4 + 1.25 * ItemUtils.getEnchantment(stacks[a], Enchantment.sharpness)) - (stacks[b].getItem().getDamageVsEntity() + 4 + 1.25 * ItemUtils.getEnchantment(stacks[b], Enchantment.sharpness))});
    bows.sort(function (a, b) {return b - a}).sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (a, b) {return ItemUtils.getEnchantment(stacks[a], Enchantment.power) - ItemUtils.getEnchantment(stacks[b], Enchantment.power)});
    [helmets, chestplates, leggings, boots, swords, pickaxes, axes, spades, bows].forEach(function (c) {c.length && c[0] < mc.currentScreen.lowerChestInventory.getSizeInventory() && useful.push(c[0])});
    useful = useful.shuffle(randomize.get());

    if (!actionslist.get().contains("Sort Hotbar")) return Java.to(useful, List).iterator();
    sort = []; values = [slot1.get(), slot2.get(), slot3.get(), slot4.get(), slot5.get(), slot6.get(), slot7.get(), slot8.get(), slot9.get()].map(function (v) {return v});
    useful.forEach(function (s) {
        values.some(function (v, i) {
            switch (v) {
                case "Ignore": case "Ignored": break
                case "Food": if (stacks[s].getItem() instanceof ItemFood && !~values.indexOf(stacks[s].getDisplayName()) && !isSet(stacks.length - 9 + i)) {sort.push([s, i]); return true}; break
                case "Blocks": case "Block": if (stacks[s].getItem() instanceof ItemBlock && !~values.indexOf(stacks[s].getDisplayName()) && !isSet(stacks.length - 9 + i)) {sort.push([s, i]); return true}; break
                default: if (stacks[s].getDisplayName().contains(v) && !isSet(stacks.length - 9 + i)) {sort.push([s, i]); return true};
            } i >= 8 && sort.push([s, 0, 1]);
        });
    });
    return Java.to(sort.shuffle(randomize.get()), List).iterator();
}

function getToTake() {
    armor = [];
    !actionslist.get().contains("Drop Garbage") && getToDrop();
    [helmets, chestplates, leggings, boots].forEach(function (a, i) {a.length && a[0] > 8 && !mc.thePlayer.inventory.armorInventory[3 - i] && armor.push(a[0])}); 
    return armor.shuffle(randomize.get());
}

function getToSort() {
    sort = []; values = [slot1.get(), slot2.get(), slot3.get(), slot4.get(), slot5.get(), slot6.get(), slot7.get(), slot8.get(), slot9.get()].map(function (v) {return v});
    values.forEach(function (v, i) {
        switch (v) {
            case "Ignore": case "Ignored": break
            case "Food": stacks.some(function (stack, i2) {if (stacks[i + 36] && stacks[i + 36].getItem() instanceof ItemFood) return true; if (stack && (stack.getItem() instanceof ItemFood) && !~values.indexOf(stack.getDisplayName()) && !isSet(i2)) {sort.push([i2, i]); return true}}); break
            case "Blocks": case "Block": stacks.some(function (stack, i2) {if (stacks[i + 36] && stacks[i + 36].getItem() instanceof ItemBlock) return true; if (stack && (stack.getItem() instanceof ItemBlock) && !~values.indexOf(stack.getDisplayName()) && !isSet(i2)) {sort.push([i2, i]); return true}}); break
            default: stacks.some(function (stack, i2) {if (stacks[i + 36] && stacks[i + 36].getDisplayName().contains(v)) return true; if (stack && stack.getDisplayName().contains(v) && !isSet(i2)) {sort.push([i2, i]); return true}}); break
        }
    });
    return Java.to(sort.shuffle(randomize.get()), List).listIterator();
}

function isSet(slot) {
    position = stacks.length - 9
    if (slot < position || !stacks[slot]) return false
    switch (values[slot - position]) {
        case "Ignore": case "Ignored": return false;
        case "Food": return stacks[slot].getItem() instanceof ItemFood && !~values.indexOf(stacks[slot].getDisplayName());
        case "Blocks": case "Block": return stacks[slot].getItem() instanceof ItemBlock && !~values.indexOf(stacks[slot].getDisplayName());
        default: return !!values[slot - position].contains(stacks[slot].getDisplayName());
    }
}

function checkopen() {
    !openInventory && mc.getNetHandler().addToSendQueue(new C16PacketClientStatus(C16PacketClientStatus.EnumState.OPEN_INVENTORY_ACHIEVEMENT)); timer.reset();
    return true
}

script.import("Core.lib");

timer = new MSTimer(); openTimer = new MSTimer(); attackTimer = new MSTimer();
var received = openInventory = updated = false, openChest, openChests = [], closeTimer;
ARMOR_COMPARATOR = new ArmorComparator();
Enchantment = Java.type("net.minecraft.enchantment.Enchantment");
ClickGui = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.ClickGui");
TileEntityChest = Java.type("net.minecraft.tileentity.TileEntityChest");
blockBlacklist = [Blocks.enchanting_table, Blocks.chest, Blocks.ender_chest, Blocks.trapped_chest, Blocks.anvil, Blocks.sand, Blocks.web, Blocks.torch, Blocks.crafting_table, Blocks.furnace, Blocks.waterlily, Blocks.dispenser, Blocks.stone_pressure_plate, Blocks.wooden_pressure_plate, Blocks.noteblock, Blocks.dropper, Blocks.tnt, Blocks.standing_banner, Blocks.wall_banner, Blocks.redstone_torch];
itemWhitelist = ["item.arrow", "item.diamond", "item.ingotIron", "item.stick"];