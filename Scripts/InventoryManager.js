list = [
    actions = value.createList("Actions", ["Open Chests", "Steal Items", "Drop Garbage", "Equip Armor", "Sort Hotbar", "Auto Weapon", ""], ""),
    actionslist = value.createText("", "Open Chests, Steal Items, Drop Garbage, Equip Armor, Sort Hotbar, Auto Weapon"),
    experimental = value.createBoolean("Experimental lobby detection", true),
    randomize = value.createBoolean("Randomize", false),
    invopen = value.createBoolean("InvOpen", false),
    maxinvdelay = value.createInteger("MaxInvDelay", 50, 0, 1000),
    mininvdelay = value.createInteger("MinInvDelay", 50, 0, 1000),
    maxstealdelay = value.createInteger("MaxStealDelay", 50, 0, 1000),
    minstealdelay = value.createInteger("MinStealDelay", 50, 0, 1000),
    startdelay = value.createInteger("StartDelay", 100, 0, 1000),
    closedelay = value.createInteger("CloseDelay", 100, 0, 1000),
    noattackdelay = value.createInteger("NoAttackDelay", 500, 0, 1000),
    openinterval = value.createInteger("OpenInterval", 100, 0, 1000),
    openrange = value.createFloat("OpenRange", 5, 3, 8),
    openwallsrange = value.createFloat("OpenWallsRange", 3, 1, 8),
    openswing = value.createList("OpenSwing", ["Visual", "Packet", "None"], "Packet"),
    openrotation = value.createList("OpenRotation", ["Visual", "Packet", "None"], "Packet"),
    openrotationlength = value.createInteger("OpenRotationLength", 25, 0, 100),
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
    version: "6.4-canary",
    values: list,
    onMotion: function (e) {
        if (e.getEventState() == "PRE") {
            updateValues();
            maxinvdelay.get() < mininvdelay.get() && mininvdelay.set(maxinvdelay.get());
            maxstealdelay.get() < minstealdelay.get() && minstealdelay.set(maxstealdelay.get());
            !attackTimer.hasTimePassed(noattackdelay.get()) && mc.currentScreen instanceof GuiChest && openChest && (mc.thePlayer.closeScreen(), chestList.pop());
            
            if (shouldOperate()) {
                !openInventory && openTimer.hasTimePassed(openinterval.get()) && actionslist.get().contains("Open Chests") && (!mc.currentScreen || mc.currentScreen instanceof ClickGui || mc.currentScreen instanceof GuiIngameMenu || mc.currentScreen instanceof GuiChat) && open();
                timer.hasTimePassed(rand(minstealdelay.get(), maxstealdelay.get())) && actionslist.get().contains("Steal Items") && mc.currentScreen instanceof GuiChest && received && steal() && closeTimer.hasTimePassed(closedelay.get()) && mc.thePlayer.closeScreen();
                timer.hasTimePassed(rand(mininvdelay.get(), maxinvdelay.get())) && (mc.currentScreen instanceof GuiInventory || (!invopen.get() && (!mc.currentScreen || mc.currentScreen instanceof ClickGui || mc.currentScreen instanceof GuiIngameMenu || mc.currentScreen instanceof GuiChat))) && (getItems(), sort() && drop() && equip() && openInventory && !mc.currentScreen && mc.getNetHandler().addToSendQueue(new C0DPacketCloseWindow(mc.thePlayer.inventoryContainer.windowId)));
            }
        }
    },
    onPacket: function (e) {
        e.getPacket() instanceof C16PacketClientStatus && e.getPacket().getStatus() == "OPEN_INVENTORY_ACHIEVEMENT" && (openInventory ? e.cancelEvent() : openInventory = true);
        (e.getPacket() instanceof C0DPacketCloseWindow || e.getPacket() instanceof S2EPacketCloseWindow) && (openInventory = received = opened = false, openChest = null);
        e.getPacket() instanceof S30PacketWindowItems && timeout(startdelay.get(), function () {received = true});
        e.getPacket() instanceof C02PacketUseEntity && e.getPacket().getAction() == C02PacketUseEntity.Action.ATTACK && (attackTimer.reset(), actionslist.get().contains("Auto Weapon") && !ScaffoldModule.state && !TowerModule.state && ~(targetSlot = getWeaponSlot()) && mc.thePlayer.inventory.currentItem != targetSlot && (mc.thePlayer.inventory.currentItem = targetSlot, mc.playerController.updateController(), mc.getNetHandler().addToSendQueue(e.getPacket()), e.cancelEvent()));
        openChest && e.getPacket() instanceof S2DPacketOpenWindow && e.getPacket().getGuiId() == "minecraft:chest" && chestList.push(openChest);
    }
}

function sort() {
    if (!actionslist.get().contains("Sort Hotbar")) return true;

    toSort = []; values = [slot1.get(), slot2.get(), slot3.get(), slot4.get(), slot5.get(), slot6.get(), slot7.get(), slot8.get(), slot9.get()];
    values.forEach(function (v, i) {
        if (!isSet(i))
            switch (v) {
                case "Ignore": case "Ignored": break
                case "Food": stacks.some(function (stack, i2) {if (stack && (stack.getItem() instanceof ItemFood) && !~values.indexOf(stack.getDisplayName()) && !isSet(i2)) {toSort.push([i2, i]); return true}}); break
                case "Blocks": case "Block": stacks.some(function (stack, i2) {if (stacks[slot] && stacks[slot].getItem() instanceof ItemBlock) return true; if (stack && (stack.getItem() instanceof ItemBlock) && !~values.indexOf(stack.getDisplayName()) && !isSet(i2)) {toSort.push([i2, i]); return true}}); break
                default: stacks.some(function (stack, i2) {if (stacks[slot] && stacks[slot].getDisplayName().contains(v)) return true; if (stack && stack.getDisplayName().contains(v) && !isSet(i2)) {toSort.push([i2, i]); return true}}); break
            }
    });

    return !(toSort.some(function (values) {checkOpen(); mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, values[0], values[1], 2, mc.thePlayer); timer.reset(); return !instaInv}) && toSort.length);
}

function drop() {
    return !actionslist.get().contains("Drop Garbage") || !(garbage.some(function (value) {checkOpen(); mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, value, 1, 4, mc.thePlayer); timer.reset(); return !instaInv}) && garbage.length);
}

function equip() {
    if (!actionslist.get().contains("Equip Armor")) return true;

    armor = []; [helmets, chestplates, leggings, boots].forEach(function (c, i) {c.length && c[0] > 8 && !mc.thePlayer.inventory.armorInventory[3 - i] && armor.push(c[0])});
    return !(armor.some(function (value) {checkOpen(); mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, value, 0, 1, mc.thePlayer); timer.reset(); return !instaInv}) && armor.length);
}

function steal() {
    useful = []; helmets = []; chestplates = []; leggings = []; boots = []; swords = []; pickaxes = []; axes = []; spades = []; bows = [];
    (stacks = Java.from(mc.currentScreen.inventorySlots.getInventory())).forEach(function (itemStack, i) {
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
    [helmets, chestplates, leggings, boots].forEach(function (c, i) {c.sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (b, a) {return ARMOR_COMPARATOR.compare(new ArmorPiece(stacks[a], 0), new ArmorPiece(stacks[b], 0))}); if (c.length && c[0] < mc.currentScreen.lowerChestInventory.getSizeInventory() && mc.thePlayer.inventory.armorInventory[3 - i] && ARMOR_COMPARATOR.compare(new ArmorPiece(stacks[c[0]], 0), new ArmorPiece(mc.thePlayer.inventory.armorInventory[3 - i], 0)) <= 0) [helmets, chestplates, leggings, boots][i][0] = 54});
    [Blocks.log, Blocks.stone, Blocks.dirt].forEach(function (t, i2) {[axes, pickaxes, spades][i2].sort(function (a, b) {return b - a}).sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (a, b) {return stacks[a].getItem().getStrVsBlock(stacks[a], t) / (stacks[a].getMaxDamage() - stacks[a].getItemDamage()) - stacks[b].getItem().getStrVsBlock(stacks[b], t) / (stacks[b].getMaxDamage() - stacks[b].getItemDamage())})});
    swords.sort(function (a, b) {return b - a}).sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (b, a) {return (stacks[a].getItem().getDamageVsEntity() + 4 + 1.25 * ItemUtils.getEnchantment(stacks[a], Enchantment.sharpness)) - (stacks[b].getItem().getDamageVsEntity() + 4 + 1.25 * ItemUtils.getEnchantment(stacks[b], Enchantment.sharpness))});
    bows.sort(function (a, b) {return b - a}).sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (a, b) {return ItemUtils.getEnchantment(stacks[a], Enchantment.power) - ItemUtils.getEnchantment(stacks[b], Enchantment.power)});
    [helmets, chestplates, leggings, boots, swords, pickaxes, axes, spades, bows].forEach(function (c) {c.length && c[0] < mc.currentScreen.lowerChestInventory.getSizeInventory() && useful.push(c[0])});
    useful.sort().shuffle(randomize.get()); instaSteal = !(minstealdelay.get() + maxstealdelay.get());
    chat.print(useful);
    if (!actionslist.get().contains("Sort Hotbar")) return !(useful.some(function (value) {checkOpen(); mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, value, 0, 2, mc.thePlayer); timer.reset(); closeTimer.reset(); return !instaSteal}) && useful.length);

    toSteal = []; values = [slot1.get(), slot2.get(), slot3.get(), slot4.get(), slot5.get(), slot6.get(), slot7.get(), slot8.get(), slot9.get()].map(function (v) {return v});
    useful.forEach(function (s) {
        values.some(function (v, i) {
            switch (v) {
                case "Ignore": case "Ignored": break
                case "Food": if (stacks[s].getItem() instanceof ItemFood && !~values.indexOf(stacks[s].getDisplayName()) && !isSet(stacks.length - 9 + i)) {toSteal.push([s, i]); return true}; break
                case "Blocks": case "Block": if (stacks[s].getItem() instanceof ItemBlock && !~values.indexOf(stacks[s].getDisplayName()) && !isSet(stacks.length - 9 + i)) {toSteal.push([s, i]); return true}; break
                default: if (stacks[s].getDisplayName().contains(v) && !isSet(stacks.length - 9 + i)) {toSteal.push([s, i]); return true};
            } i >= 8 && toSteal.push([s, 0, 1]);
        });
    });
    return !(toSteal.some(function (values) {mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, values[0], values[1], values[2] || 2, mc.thePlayer); timer.reset(); closeTimer.reset(); return !instaSteal}) && toSteal.length);
}

function open() {
    Java.from(mc.theWorld.loadedTileEntityList).some(function (chest) {
        if (chest instanceof TileEntityChest && !~chestList.indexOf(chest)) {
            eyes = mc.thePlayer.getPositionEyes(.0);
            bb = (state = mc.theWorld.getBlockState(chest.getPos())).getBlock().getCollisionBoundingBox(mc.theWorld, chest.getPos(), state);
            distances = []; visible = false;
            [new Vec3(bb.minX, bb.minY, bb.minZ), new Vec3(bb.minX, bb.minY, bb.maxZ), new Vec3(bb.minX, bb.maxY, bb.minZ), new Vec3(bb.minX, bb.maxY, bb.maxZ), new Vec3(bb.maxX, bb.minY, bb.minZ), new Vec3(bb.maxX, bb.minY, bb.maxZ), new Vec3(bb.maxX, bb.maxY, bb.minZ), new Vec3(bb.maxX, bb.maxY, bb.maxZ)].forEach(function (v) {visible = visible || !(result = mc.theWorld.rayTraceBlocks(eyes, v)) || result.getBlockPos().equals(chest.getPos()); distances.push(Math.sqrt(Math.pow(eyes.xCoord - v.xCoord, 2) + Math.pow(eyes.yCoord - v.yCoord, 2) + Math.pow(eyes.zCoord - v.zCoord, 2)))});
            if (Math.min.apply(null, distances) < (visible ? openrange.get() : openwallsrange.get())) {
                openrotation.get() != "None" && RotationUtils.setTargetRotation(rot = RotationUtils.faceBlock(chest.getPos()).getRotation(), openrotationlength.get());
                openrotation.get() == "Visual" && (mc.thePlayer.rotationYaw = rot.getYaw(), mc.thePlayer.rotationPitch = rot.getPitch());
                mc.playerController.onPlayerRightClick(mc.thePlayer, mc.theWorld, null, chest.getPos(), EnumFacing.DOWN, mc.thePlayer.getLookVec());
                openswing.get() == "Visual" ? mc.thePlayer.swingItem() : openswing.get() == "Packet" && mc.getNetHandler().addToSendQueue(new C0APacketAnimation());
                openTimer.reset(); return openChest = chest;
            }
        }
    });
}

function isSet(i) {
    if (stacks[slot = i + 36])
        switch (values[i]) {
            case "Ignore": case "Ignored": return false;
            case "Food": return stacks[slot].getItem() instanceof ItemFood && !~values.indexOf(stacks[slot].getDisplayName());
            case "Blocks": case "Block": return stacks[slot].getItem() instanceof ItemBlock && !~values.indexOf(stacks[slot].getDisplayName());
            default: return !!values[i].contains(stacks[slot].getDisplayName());
        }
}

function getWeaponSlot() {
    for (i = bestSword = bestTool = -1; ++i < 9;) (stack = mc.thePlayer.inventory.mainInventory[i]) && (item = stack.getItem()) && (item instanceof ItemSword ? (!~bestSword || getAttackDamage(stack) > getAttackDamage(mc.thePlayer.inventory.mainInventory[bestSword])) && (bestSword = i) : !~bestSword && item instanceof ItemTool && (!~bestTool || getAttackDamage(stack) > getAttackDamage(mc.thePlayer.inventory.mainInventory[bestTool])) && (bestTool = i));
    return ~bestSword ? bestSword : bestTool
}

function shouldOperate() {
    if (mc.thePlayer.isSpectator() || mc.thePlayer.itemInUseCount || !attackTimer.hasTimePassed(noattackdelay.get()) || !mc.thePlayer.capabilities.allowEdit || mc.thePlayer.capabilities.allowFlying || mc.thePlayer.capabilities.disableDamage || (mc.thePlayer.getTeam() && ((mc.theWorld.getScoreboard().getTeams().size() == 1 && !mc.thePlayer.getTeam().getAllowFriendlyFire()) || (mc.thePlayer.getTeam().getTeamName() == "1y|1")))) return false
    if (experimental.get()) for (i in mc.theWorld.loadedEntityList) if (((e = mc.theWorld.loadedEntityList[i]) instanceof IBossDisplayData || e instanceof EntityArmorStand) && (tag = e.getCustomNameTag()) && !tag.contains(":") && !tag.contains("Vazio!")) {/*chat.print(mc.theWorld.loadedEntityList[i].getCustomNameTag());*/ return false};
    return true
}

function updateValues() {
    if (mc.currentScreen instanceof ClickGui) {
        actions.get() && (~(valuesList = actionslist.get().split(", ")).indexOf(actions.get()) ? valuesList.splice(valuesList.indexOf(actions.get()), 1) : valuesList.push(actions.get()), actionslist.set(valuesList.filter(Boolean).sort(function (a, b) {return ["Open Chests", "Steal Items", "Drop Garbage", "Equip Armor", "Sort Hotbar", "Auto Weapon"].indexOf(a) - ["Open Chests", "Steal Items", "Drop Garbage", "Equip Armor", "Sort Hotbar", "Auto Weapon"].indexOf(b)}).join(", ")), actions.set(""), updated = false);
        openrotation.get() != prevMode && (prevMode = openrotation.get(), updated = false);
        if (!updated)
            active = [actions, actionslist, experimental],
            actionslist.get().split(", ").forEach(function (a) {
                switch (a) {
                    case "Open Chests": active.push(openinterval, openrange, openwallsrange, openswing, openrotation, openrotation.get() != "None" ? openrotationlength : null); break;
                    case "Steal Items": active.push(maxstealdelay, minstealdelay, startdelay, closedelay, randomize, invopen); break
                    case "Drop Garbage": case "Equip Armor": active.push(maxinvdelay, mininvdelay, noattackdelay, randomize, invopen); break
                    case "Sort Hotbar": active.push(maxinvdelay, mininvdelay, noattackdelay, randomize, invopen, slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9);
                }
            }),
            setValues(InventoryManagerModule, active.filter(Boolean).sort(function (a, b) {return list.indexOf(a) - list.indexOf(b)}).filter(function (item, pos, ary) {return !pos || item != ary[pos - 1]})), updated = true;
    } else if (updated) setValues(InventoryManagerModule, list), LiquidBounce.fileManager.saveConfig(LiquidBounce.fileManager.valuesConfig), updated = false;
}

function getItems() {
    garbage = []; helmets = []; chestplates = []; leggings = []; boots = []; swords = []; pickaxes = []; axes = []; spades = []; bows = [];
    (stacks = Java.from(mc.thePlayer.inventoryContainer.getInventory())).forEach(function (itemStack, i) {
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
    swords.sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (b, a) {return getAttackDamage(stacks[a]) - getAttackDamage(stacks[b])});
    bows.sort(function (b, a) {return getDurability(stacks[a]) - getDurability(stacks[b])}).sort(function (a, b) {return ItemUtils.getEnchantment(stacks[a], Enchantment.power) - ItemUtils.getEnchantment(stacks[b], Enchantment.power)});
    [helmets, chestplates, leggings, boots, swords, pickaxes, axes, spades, bows].forEach(function (c) {c.length > 1 && (garbage = garbage.concat(c.slice(1)))});
    garbage.shuffle(randomize.get());
    instaInv = !(mininvdelay.get() + maxinvdelay.get());
}

function getAttackDamage(stack) {
    return stack && (item = stack.getItem()) && (item instanceof ItemSword || item instanceof ItemTool) ? Java.from(item.getItemAttributeModifiers().get("generic.attackDamage"))[0].getAmount() + 1.25 * ItemUtils.getEnchantment(stack, Enchantment.sharpness) : -1;
}

function checkOpen() {
    !openInventory && mc.getNetHandler().addToSendQueue(new C16PacketClientStatus(C16PacketClientStatus.EnumState.OPEN_INVENTORY_ACHIEVEMENT));
    timer.reset();
    return true
}

script.import("Core.lib");

var timer = new MSTimer(), openTimer = new MSTimer(), attackTimer = new MSTimer(), closeTimer = new MSTimer(), ARMOR_COMPARATOR = new ArmorComparator(), received = openInventory = updated = rotated = false, openChest, chestList = [], ghostItems = [], closeTimer, toOpen, prevMode = openrotation.get();
Enchantment = Java.type("net.minecraft.enchantment.Enchantment");
ClickGui = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.ClickGui");
TileEntityChest = Java.type("net.minecraft.tileentity.TileEntityChest");
blockBlacklist = [Blocks.enchanting_table, Blocks.chest, Blocks.ender_chest, Blocks.trapped_chest, Blocks.anvil, Blocks.sand, Blocks.web, Blocks.torch, Blocks.crafting_table, Blocks.furnace, Blocks.waterlily, Blocks.dispenser, Blocks.stone_pressure_plate, Blocks.wooden_pressure_plate, Blocks.noteblock, Blocks.dropper, Blocks.tnt, Blocks.standing_banner, Blocks.wall_banner, Blocks.redstone_torch];
itemWhitelist = ["item.arrow", "item.diamond", "item.ingotIron", "item.stick"];