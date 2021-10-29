///api_version=2
(script = registerScript({
    name: "InventoryManager",
    authors: ["CzechHek"],
    version: "7.2"
})).import("Core.lib");

TEXT_EXTENDER = Java.extend(TextValue);
LIST_EXTENDER = Java.extend(ListValue);

list = [
    gamedetection = value.createBoolean("GameDetection", true),
    nowindowpackets = new value.createBoolean("NoWindowPackets", true),
    ignorelootedchests = value.createBoolean("IgnoreLootedChests", true),
    reopenrefilledchests = value.createBoolean("ReopenRefilledChests", true),
    invopen = value.createList("InvOpen", ["Require", "Simulate", "None"], "None"),
    openswing = value.createList("OpenSwing", ["Visual", "Packet", "None"], "None"),
    rotations = new LIST_EXTENDER("Rotations", ["Visual", "Packet", "None"], "None") {onChanged: function () {updateValues()}},
    invdelay = value.createInteger("InvDelay", 50, 0, 1000),
    stealdelay = value.createInteger("StealDelay", 50, 0, 1000),
    equipdelay = value.createInteger("EquipDelay", 50, 0, 1000),
    startdelay = value.createInteger("StartDelay", 100, 0, 1000),
    closedelay = value.createInteger("CloseDelay", 100, 0, 1000),
    openinterval = value.createInteger("OpenInterval", 200, 0, 1000),
    openrange = value.createFloat("OpenRange", 5, 3, 8),
    openwallsrange = value.createFloat("OpenWallsRange", 5, 1, 8),
    rotationduration = value.createInteger("RotationDuration", 1, 1, 100),
    healthtohealat = value.createInteger("HealthToHealAt", 15, 1, 20),
    throwdelay = value.createInteger("ThrowDelay", 500, 0, 1000),
    playagaininterval = value.createInteger("PlayAgainInterval", 5000, 0, 5000),
    slot1 = new TEXT_EXTENDER("Slot1", "Sword") {onChanged: function () {parseValue(slot1)}},
    slot2 = new TEXT_EXTENDER("Slot2", "Pickaxe") {onChanged: function () {parseValue(slot2)}},
    slot3 = new TEXT_EXTENDER("Slot3", "Axe") {onChanged: function () {parseValue(slot3)}},
    slot4 = new TEXT_EXTENDER("Slot4", "Bow") {onChanged: function () {parseValue(slot4)}},
    slot5 = new TEXT_EXTENDER("Slot5", "Ender Pearl, Bucket") {onChanged: function () {parseValue(slot5)}},
    slot6 = new TEXT_EXTENDER("Slot6", "Golden Apple, Food") {onChanged: function () {parseValue(slot6)}},
    slot7 = new TEXT_EXTENDER("Slot7", "Swiftness, Splash Potion") {onChanged: function () {parseValue(slot7)}},
    slot8 = new TEXT_EXTENDER("Slot8", "Regeneration, Splash Potion") {onChanged: function () {parseValue(slot8)}},
    slot9 = new TEXT_EXTENDER("Slot9", "Block") {onChanged: function () {parseValue(slot9)}},
    modifylistings = new LIST_EXTENDER("ModifyListings", ["Whitelist", "Blacklist", "", "List", "Reset"], "") {
        onChanged: function (o, n) {
            switch (n) {
                case "Reset":
                    whitelist.set(""); blacklist.set(""); modifylistings.set("");
                    printLB("§a§lWiped§3 whitelist and blacklist.");
                    mc.thePlayer.inventory.inventoryChanged = true;
                    break
                case "Whitelist":
                case "Blacklist":
                    if (!InventoryManagerModule.state) print("§cYou need to enable InventoryManager to use this feature!"), modifylistings.set("");
                    else printLB("§a§lManage", n.toLowerCase(), "§3by writing an item name.");
                    break
                case "List":
                    printLB("§a§lWhitelist§3:", (whitelist.get() ? whitelist.get() : "Empty") + ".");
                    printLB("§a§lBlacklist§3:", (blacklist.get() ? blacklist.get() : "Empty") + ".");
                    modifylistings.set("");
            }
        }
    },
    whitelist = value.createText("Whitelist", ""),
    blacklist = value.createText("Blacklist", "")
]

module = [
    {
        description: "Automatically manages inventory actions.",
        category: "Player",
        values: list,
        onClickGuiLoaded: function () {
            for each (var l in [whitelist, blacklist]) l.get().contains(" ") && l.set(l.get().replaceAll(" ", " "));
            userWhitelist = whitelist.get().replaceAll(" ", " ").split(", ").filter(Boolean);
            userBlacklist = blacklist.get().replaceAll(" ", " ").split(", ").filter(Boolean);
            for each (var v in SLOT_VALUES) v.get().contains(" ") && parseValue(v);
            !sortValues && updateSortValues();
        },
        onClickGuiOpen: function () {
            updateValues();
        },
        onClickGuiClosed: function () {
            updateValues(true);
        },
        onMotion: function (e) {
            if (e.getEventState() == "PRE") checkPlaying() && stealItems() && sortHotbar() && dropGarbage() && equipArmor() && prepareToThrow() && eatFood() && selectBlocks() && lookAtChest(), playAgain();
            else {
                lookingAtChest && openChest();
                throwingPotion && throwPotion();
            }
        },
        onPacket: function (e) {
            if (mc.thePlayer) {
                if (e.getPacket() instanceof C16PacketClientStatus) {
                    if (e.getPacket().getStatus() == "OPEN_INVENTORY_ACHIEVEMENT") {
                        if (openInventory) e.cancelEvent();
                        else openInventory = true;
                        if (nowindowpackets.get()) e.cancelEvent();   
                    }
                } else if (e.getPacket() instanceof C0DPacketCloseWindow || e.getPacket() instanceof S2EPacketCloseWindow) {
                    if (openInventory) {
                        openInventory = false;
                        if (nowindowpackets.get() && e.getPacket() instanceof C0DPacketCloseWindow) e.cancelEvent();
                    }
                } else if (e.getPacket() instanceof S30PacketWindowItems) {
                    if (lastChest) chestBlacklist.push(lastChest), lastChest = null;
                    timeout(startdelay.get() + 1, function () receivedItems = true);
                } else if (e.getPacket() instanceof C02PacketUseEntity) {
                    if (e.getPacket().getAction() == "ATTACK") {
                        if (~isEating) KeyBinding.setKeyBindState(mc.gameSettings.keyBindUseItem.getKeyCode(), false), isEating = -1;
                        attackTimer.reset();
                        selectWeapon(e);
                    }
                } else if (e.getPacket() instanceof C01PacketChatMessage) {
                    if (modifylistings.get()) {
                        e.cancelEvent();
                        var value = this.module.getValue(modifylistings.get()),
                            array = value.get().replace(" ", " ").split(", ").filter(Boolean),
                            msg = e.getPacket().getMessage();
                        if (array.remove(msg)) printLB("Removed§a§l", msg, "§3from§a§l", value.getName().toLowerCase() + "§3.");
                        else {
                            array.push(msg);
                            printLB("Added§a§l", msg, "§3to§a§l", value.getName().toLowerCase() + "§3.");
                        }
                        if (value == whitelist) userWhitelist = array;
                        else userBlacklist = array;
                        playSound("random.anvil_use");
                        value.set(array.join(", ").replaceAll(" ", " "));
                        modifylistings.set("");
                        mc.thePlayer.inventory.inventoryChanged = true;
                    }
                } else if (e.getPacket() instanceof S24PacketBlockAction) {
                    if (playing && actions["Open Chests"].module.state && ignorelootedchests.get() && e.getPacket().getBlockType() == Blocks.chest && e.getPacket().getData2()) chestBlacklist.push(mc.theWorld.getTileEntity(e.getPacket().getBlockPosition()));
                } else if (e.getPacket() instanceof S45PacketTitle) {
                    if (e.getPacket().getMessage() && reopenrefilledchests.get()) {
                        msg = e.getPacket().getMessage().getUnformattedText();
                        if (msg.contains("refill") || msg.contains("reabastecidos")) chestBlacklist = [];
                    }
                }
            }
        },
        onClickBlock: function (e) {
            if (playing && isReady("Select Tools") && !ScaffoldModule.state && !TowerModule.state) {
                var block = mc.theWorld.getBlockState(e.getClickedBlock()).getBlock(),
                    currentSpeed = getBreakingSpeed(mc.thePlayer.getHeldItem(), block),
                    hotbarStacks = Java.from(mc.thePlayer.inventory.mainInventory).slice(0, 8),
                    stack = hotbarStacks.slice().filter(function (stack) getBreakingSpeed(stack, block) > currentSpeed).sort(function (b, a) getBreakingSpeed(a, block) - getBreakingSpeed(b, block))[0];
                if (stack) {
                    var targetSlot = hotbarStacks.indexOf(stack);
                    if (mc.thePlayer.inventory.currentItem != targetSlot) mc.thePlayer.inventory.currentItem = targetSlot, mc.playerController.updateController();
                }
            }
        },
        onLoad: function () {
            module.slice(1).map(function (object) object.module).forEach(function (m) actions[m.name].module = m);
        },
        onDisable: function () {
            for each (var a in actions) ARRAY_FIELD.set(a.module, false);
        },
        onEnable: function () {
            for each (var a in actions) ARRAY_FIELD.set(a.module, a.module.getValue("In array").get());
        },
        onWorld: function () {
            chestBlacklist = [];
        }
    }
]

/*----------------*/
/*Global variables*/
/*----------------*/

Color = Java.type("java.awt.Color");
Potion = Java.type("net.minecraft.potion.Potion");
KeyBinding = Java.type("net.minecraft.client.settings.KeyBinding");
TileEntityChest = Java.type("net.minecraft.tileentity.TileEntityChest");
Notification = Java.type("net.ccbluex.liquidbounce.ui.client.hud.element.elements.Notification");

var targetModule, chestBlacklist = [], openInventory = false, lookingAtChest, lastChest, receivedItems, throwingPotion, userWhitelist, userBlacklist, isEating = -1, sortValues, stacks, sortValues, sortTargets,
openTimer = new MSTimer(), stealTimer = new MSTimer(), invTimer = new MSTimer(), blacklistTimer = new MSTimer(), attackTimer = new MSTimer(), throwTimer = new MSTimer(), playAgainTimer = new MSTimer(), equipTimer = new MSTimer();

ITEM_POTION = new ItemPotion();
VALUE_FIELD = getField(Value, "value");
ITEM_WHITELIST = [Items.arrow, Items.stick, Items.compass];
BLOCK_WHITELIST = [Blocks.glass, Blocks.stained_glass];
BLOCK_BLACKLIST_2 = [Blocks.anvil, Blocks.crafting_table];
BLOCK_BLACKLIST = [Blocks.soul_sand, Blocks.tnt].concat(BLOCK_BLACKLIST_2);
SLOT_VALUES = [slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9];
ARRAY_FIELD = getField(Java.type("net.ccbluex.liquidbounce.features.module.Module"), "array");

actions = {
    "Open Chests": {
        description: "Opens chests around you."
    },
    "Steal Items": {
        description: "Steals items from chests."
    },
    "Drop Garbage": {
        description: "Drops useless items from inventory."
    },
    "Equip Armor": {
        description: "Equips the best armor."
    },
    "Sort Hotbar": {
        description: "Sorts your hotbar slots."
    },
    "Select Weapons": {
        description: "Selects weapon when attacking."
    },
    "Select Tools": {
        description: "Selects tools when mining."
    },
    "Select Blocks": {
        description: "Selects blocks when right clicking a block."
    },
    "Throw Potions": {
        description: "Throws useful potions."
    },
    "Eat Food": {
        description: "Eats food when you're hungry."
    },
    "Play Again": {
        description: "Plays again automatically."
    }
}

/*--------------*/
/*User interface*/
/*--------------*/

Object.keys(actions).forEach(function (action) {
    module.push({
        name: action,
        category: "InventoryManager",
        description: "    " + actions[action].description,
        values: [
            value.createText("KeyBind", ""),
            new (Java.extend(BoolValue)) ("Change bind", false) {
                onChanged: function (o, n) {
                    if (n) {
                        targetModule = actions[action].module;
                        targetModule.getValue("Change bind").set(false);
                        mc.displayGuiScreen(bindScreen);
                    }
                }
            },
            new (Java.extend(BoolValue)) ("In array", false) {
                onChanged: function (o, n) {
                    if (InventoryManagerModule.state) actions[action].module.array = n;
                }
            },
            !["Select Weapons", "Play Again"].includes(action) && (actions[action].delay = value.createInteger("NoAttackDelay", action == "Steal Items" ? 0 : 500, 0, 1000))
        ],
        onLoad: function () {
            this.module.array = this.values[2].get();
        },
        onEnable: function () {
            !LiquidBounce.INSTANCE.isStarting() && timeout(50, function () updateValues());
        },
        onDisable: function () {
            this.onEnable();
        },
        onClickGuiOpen: function () {
            this.values[0].set(this.module.keyBind ? Keyboard.getKeyName(this.module.keyBind) : "");
        }
    });
});

function updateValues (closing) {
    var shownValues = [];
    if (closing) shownValues = list;
    else {
        module.slice(1).forEach(function (action) {
            if (action.module.state) {
                switch (action.name) {
                    case "Open Chests": shownValues.push(gamedetection, openinterval, openrange, openwallsrange, ignorelootedchests, reopenrefilledchests, openswing, rotations, rotations.get() == "Packet" ? rotationduration : null); break;
                    case "Steal Items": shownValues.push(gamedetection, stealdelay, startdelay, closedelay, modifylistings, whitelist, blacklist); break
                    case "Drop Garbage": shownValues.push(gamedetection, invopen, nowindowpackets, invdelay, modifylistings, whitelist, blacklist); break
                    case "Equip Armor": shownValues.push(gamedetection, invopen, nowindowpackets, equipdelay, modifylistings, whitelist, blacklist); break
                    case "Sort Hotbar": shownValues.push(gamedetection, invopen, nowindowpackets, invdelay, slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9); break
                    case "Throw Potions": shownValues.push(gamedetection, rotations, rotations.get() == "Packet" ? rotationduration : null, healthtohealat); break
                    case "Eat Food": shownValues.push(gamedetection, healthtohealat); break
                    case "Play Again": shownValues.push(gamedetection, playagaininterval); break
                }
            }
        });
        shownValues = shownValues.filter(Boolean).sort(function (a, b) list.indexOf(a) - list.indexOf(b)).filter(function (item, pos, ary) !pos || item != ary[pos - 1]);
    }
    setValues(InventoryManagerModule, shownValues);
}

bindScreen = new (Java.extend(GuiScreen)) () {
    func_73868_f: function () {
        return;
    },
    func_73869_a: function (code, char) {
        keyName = Keyboard.getKeyName(char);
        switch (char) {
            case 1:
                break
            case 14:
            case 211:
                targetModule.keyBind = 0;
                printLB("Unbound action§a§l", targetModule.name + "§3.");
                LiquidBounce.hud.addNotification(new Notification("Unbound action " + targetModule.name));
                playSound("random.anvil_use");
                break
            default:
                targetModule.keyBind = char;
                printLB("Bound action§a§l", targetModule.name, "§3to key§a§l", keyName + "§3.");
                LiquidBounce.hud.addNotification(new Notification("Bound action " + targetModule.name + " to " + keyName));
                playSound("random.anvil_use");
        }
        mc.displayGuiScreen(LiquidBounce.clickGui);
    },
    func_73863_a: function () {
        Gui.drawRect(0, 0, mc.displayWidth, mc.displayHeight, new Color(0, 0, 0, 100).getRGB());
        GlStateManager.scale(2, 2, 2);
        mc.ingameGUI.drawCenteredString(mc.fontRendererObj, "§6§lAction§e§l: " + targetModule.name, mc.displayWidth / 8, mc.displayHeight / 8 - 10, -1);
        GlStateManager.scale(0.5, 0.5, 0.5);
        mc.ingameGUI.drawCenteredString(mc.fontRendererObj, "§7Choose a §lkeybind§7.", mc.displayWidth / 4, mc.displayHeight / 4 + 30, -1);
        mc.ingameGUI.drawCenteredString(mc.fontRendererObj, "§8[§9DEL§8] [§9BACKSLASH§8] §9§lUnbind", mc.displayWidth / 4, mc.displayHeight / 4 + 70, -1);
        mc.ingameGUI.drawCenteredString(mc.fontRendererObj, "§8[§cESC§8] §c§lDismiss", mc.displayWidth / 4, mc.displayHeight / 4 + 80, -1);
    }
}

function printLB () ClientUtils.displayChatMessage("§8[§9§l" + LiquidBounce.CLIENT_NAME + "§8] §3" + Array.prototype.slice.call(arguments).join(" "));

function parseValue (value) {
    VALUE_FIELD.set(value, value.get().replaceAll(";", ",").replaceAll(" ", " ").replaceAll(", ", ",").replaceAll(",", ", "));
    updateSortValues();
    mc.thePlayer.inventory.inventoryChanged = true;
}

function updateSortValues () {
    sortValues = SLOT_VALUES.map(function (e) e.get().replaceAll(" ", " ").split(", "));
    sortTargets = sortValues.map(function (e, i) [e, i]).sort(function (a, b) a[0].length - b[0].length);
}

/*------------------*/
/*Action: Open Chest*/
/*------------------*/

function lookAtChest() {
    if (isReady("Open Chests") && openTimer.hasTimePassed(openinterval.get()) && !openInventory && !~isEating && !mc.thePlayer.openContainer.windowId) {
        for each (var tileEntity in mc.theWorld.loadedTileEntityList) {
            if (tileEntity instanceof TileEntityChest && !chestBlacklist.includes(tileEntity)) {
                var state = mc.theWorld.getBlockState(tileEntity.getPos()),
                    bb = state.getBlock().getCollisionBoundingBox(mc.theWorld, tileEntity.getPos(), state);
                if (bb) {
                    var eyes = mc.thePlayer.getPositionEyes(1),
                        distances = [], visible, result;
                    [new Vec3(bb.minX, bb.minY, bb.minZ), new Vec3(bb.minX, bb.minY, bb.maxZ), new Vec3(bb.minX, bb.maxY, bb.minZ), new Vec3(bb.minX, bb.maxY, bb.maxZ), new Vec3(bb.maxX, bb.minY, bb.minZ), new Vec3(bb.maxX, bb.minY, bb.maxZ), new Vec3(bb.maxX, bb.maxY, bb.minZ), new Vec3(bb.maxX, bb.maxY, bb.maxZ)].forEach(function (v) {
                        if (!visible) visible = !(result = mc.theWorld.rayTraceBlocks(eyes, v)) || result.getBlockPos().equals(tileEntity.getPos());
                        distances.push(Math.sqrt(Math.pow(eyes.xCoord - v.xCoord, 2) + Math.pow(eyes.yCoord - v.yCoord, 2) + Math.pow(eyes.zCoord - v.zCoord, 2)));
                    });
                    if (Math.min.apply(null, distances) < (visible ? openrange.get() : openwallsrange.get())) {
                        rotation = RotationUtils.faceBlock(tileEntity.getPos()).getRotation()
                        rotations.get() == "Visual" ? rotation.toPlayer(mc.thePlayer) : rotations.get() == "Packet" && RotationUtils.setTargetRotation(rotation, rotationduration.get() - 1);
                        lookingAtChest = tileEntity;
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

function openChest() {
    mc.playerController.onPlayerRightClick(mc.thePlayer, mc.theWorld, null, lookingAtChest.getPos(), EnumFacing.DOWN, mc.thePlayer.getLookVec());
    openswing.get() == "Visual" ? mc.thePlayer.swingItem() : openswing.get() == "Packet" && mc.getNetHandler().addToSendQueue(new C0APacketAnimation());
    lastChest = lookingAtChest;
    lookingAtChest = null;
    openTimer.reset();
}

/*-------------------*/
/*Action: Steal Items*/
/*-------------------*/

function stealItems () {
    if (isReady("Steal Items") && mc.currentScreen instanceof GuiChest) {
        if (receivedItems && stealTimer.hasTimePassed(stealdelay.get())) {
            var chestStacks = Java.from(mc.thePlayer.openContainer.getInventory()).slice(0, mc.currentScreen.lowerChestInventory.getSizeInventory()),
                stacks = chestStacks.concat(Java.from(mc.thePlayer.inventoryContainer.getInventory())),
                stealList = [];
        
            if (sortHotbar(chestStacks, stacks)) {
                chestStacks.some(function (stack, i) stack && isUseful(stack, stacks) && stealList.push(i) && stealdelay.get());
                stealList.forEach(function (id) click(id, 0, 1));
                stealList.length && stealTimer.reset();
    
                if ((!stealList.length || !stealdelay.get()) && stealTimer.hasTimePassed(closedelay.get())) {
                    mc.thePlayer.closeScreen();
                    openTimer.reset();
                    return true;
                }
            }
        }
    } else return true;
}

/*-------------------*/
/*Action: Sort Hotbar*/
/*-------------------*/

function sortHotbar (chestStacks, stacks) {
    if ((isReady("Sort Hotbar") && shouldManageInventory()) || chestStacks) {
        if (chestStacks || invTimer.hasTimePassed(invdelay.get())) {
            var stacks = stacks || Java.from(mc.thePlayer.inventoryContainer.getInventory()),
                hotbarIndex = stacks.length - 9,
                sortList = [];
    
            sortTargets.some(function (data) {
                var targets = data[0], slot = data[1], item;
                targets.some(function (target, priority1) {
                    return (!getPriority(targets, stacks[slot + hotbarIndex]) && isUseful(stacks[slot + hotbarIndex], stacks)) ||
                    (chestStacks || stacks).some(function (stack, i) {
                        if ((chestStacks || i > 8) && stack && (item = stack.getItem()) && (target.toLowerCase() == "food" ? item instanceof ItemFood : ["block", "blocks"].includes(target.toLowerCase()) ? item instanceof ItemBlock : item.getItemStackDisplayName(stack).contains(target)) && isUseful(stack, stacks)) {
                            priority2 = getPriority(targets, stacks[slot + hotbarIndex]);
                            priority3 = i >= hotbarIndex ? getPriority(sortValues[i - hotbarIndex], stack) : -1;
                            if (~priority1 && (!~priority2 || (priority1 < priority2) || !isUseful(stacks[slot + hotbarIndex], stacks)) && (!~priority3 || (priority1 < priority3))) return sortList.push([i, slot]);
                        }
                    });
                });
                return sortList.length && (chestStacks ? stealdelay.get() : invdelay.get());
            });
            sortList.forEach(function (data) click(data[0], data[1], 2));
            sortList.length && (chestStacks ? stealTimer : invTimer).reset();
        
            return !sortList.length || !(chestStacks ? stealdelay.get() : invdelay.get());
        }
    } else return true;
}

/*--------------------*/
/*Action: Drop Garbage*/
/*--------------------*/

function dropGarbage () {
    if (isReady("Drop Garbage") && shouldManageInventory()) {
        if (invTimer.hasTimePassed(invdelay.get())) {
            var stacks = Java.from(mc.thePlayer.inventoryContainer.getInventory()),
                dropList = [];
            stacks.some(function (stack, i) stack && !isUseful(stack, stacks) && dropList.push(i) && invdelay.get());
            dropList.forEach(function (id) click(id, 1, 4));
            dropList.length && invTimer.reset();
            return !dropList.length || !invdelay.get();
        }
    } else return true;
}

/*-------------------*/
/*Action: Equip Armor*/
/*-------------------*/

function equipArmor () {
    if (isReady("Equip Armor") && shouldManageInventory()) {
        if (equipTimer.hasTimePassed(equipdelay.get())) {
            var stacks = Java.from(mc.thePlayer.inventoryContainer.getInventory()),
                equipList = [], item;
            [0, 1, 2, 3].some(function (type) !stacks[type + 5] && stacks.some(function (stack, i) stack && ((item = stack.getItem()) instanceof ItemArmor) && item.armorType == type && isUseful(stack, stacks) && equipList.push(i)) && equipdelay.get());
            equipList.forEach(function (id) click(id, 0, 1));
            equipList.length && equipTimer.reset();
    
            if (!equipList.length || !equipdelay.get()) {
                if (openInventory && invopen.get() == "Simulate") sendPacket(new C0DPacketCloseWindow(mc.thePlayer.openContainer.windowId));
                mc.thePlayer.inventory.inventoryChanged = false;
                return true;
            }
        }
    } else return true;
}

function compareArmor (stack1, stack2) {
    var item1 = stack1.getItem(),
        material1 = item1.getArmorMaterial(),
        protection1 = ItemUtils.getEnchantment(stack1, Enchantment.protection),
        reduction1 = material1.getDamageReductionAmount(item1.armorType),
        item2 = stack2.getItem(),
        material2 = item2.getArmorMaterial(),
        protection2 = ItemUtils.getEnchantment(stack2, Enchantment.protection),
        reduction2 = material2.getDamageReductionAmount(item2.armorType),
        reductionDelta = Math.abs(reduction1 - reduction2);
    return (reduction2 * 4 + 0.31 * reductionDelta * Math.pow(protection2, 2)) - (reduction1 * 4 + 0.31 * reductionDelta * Math.pow(protection1, 2));
}

/*----------------------*/
/*Action: Select Weapons*/
/*----------------------*/

function selectWeapon (e) {
    if (isReady("Select Weapons") && playing && !~isEating && !ScaffoldModule.state && !TowerModule.state) {
        var hotbarStacks = Java.from(mc.thePlayer.inventory.mainInventory).slice(0, 8),
            stack = hotbarStacks.slice().sort(function (b, a) getAttackDamage(a) - getAttackDamage(b))[0];
        if (~getAttackDamage(stack)) {
            var targetSlot = hotbarStacks.indexOf(stack);
            if (mc.thePlayer.inventory.currentItem != targetSlot) {
                mc.thePlayer.inventory.currentItem = targetSlot;
                mc.playerController.updateController();
                e.cancelEvent();
                timeout(1, function () sendPacket(e.getPacket()));
            }
        }
    }
}

/*---------------------*/
/*Action: Throw Potions*/
/*---------------------*/

function prepareToThrow () {
    if (isReady("Throw Potions") && mc.thePlayer.onGround && !mc.thePlayer.openContainer.windowId && !openInventory && !~isEating && !ScaffoldModule.state && !TowerModule.state && throwTimer.hasTimePassed(throwdelay.get()) && isMovingHorizontally() && !mc.thePlayer.movementInput.jump && !mc.gameSettings.keyBindUseItem.pressed && !mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, new AxisAlignedBB(mc.thePlayer.posX, mc.thePlayer.posY - 0.1, mc.thePlayer.posZ, mc.thePlayer.posX, mc.thePlayer.posY - 0.1, mc.thePlayer.posZ)).isEmpty()) {
        for (var i = 0; i < 9; i++) {
            var stack = mc.thePlayer.inventory.mainInventory[i];
            if (stack && ItemPotion.isSplash(stack.getItemDamage()) && isGoodPotion(stack) && !isActive(stack)) {
                rotations.get() == "Visual" ? (mc.thePlayer.rotationPitch = 90) : RotationUtils.setTargetRotation(new Rotation(mc.thePlayer.rotationYaw, 90), rotationduration.get() - 1);
                throwingPotion = i;
                throwTimer.reset();
                return;
            }
        }
    }
    return true;
}

function throwPotion() {
    sendPacket(new C09PacketHeldItemChange(throwingPotion));
    sendPacket(new C08PacketPlayerBlockPlacement(mc.thePlayer.inventory.mainInventory[throwingPotion]));
    throwingPotion = null;
    timeout(50, function () sendPacket(new C09PacketHeldItemChange(mc.thePlayer.inventory.currentItem)));
}

/*----------------*/
/*Action: Eat Food*/
/*----------------*/

function eatFood () {
    if (isReady("Eat Food") && (~isEating || !mc.gameSettings.keyBindUseItem.pressed) && !mc.thePlayer.openContainer.windowId && !openInventory && !mc.currentScreen && !ScaffoldModule.state && !TowerModule.state) {
        if (mc.objectMouseOver && mc.objectMouseOver.typeOfHit == "BLOCK") {
            var block = mc.theWorld.getBlockState(mc.objectMouseOver.getBlockPos()).getBlock();
            if (block.hasTileEntity() || BLOCK_BLACKLIST_2.includes(block)) return true;
        }   
        var hotbarStacks = Java.from(mc.thePlayer.inventory.mainInventory).slice(0, 8),
            food = hotbarStacks.filter(function (s) s && s.getItem() instanceof ItemFood), item;
        for each (var stack in food) {
            item = stack.getItem();
            if (((20 - mc.thePlayer.getFoodStats().getFoodLevel()) >= item.getHealAmount(stack)) || (item instanceof ItemAppleGold && mc.thePlayer.getHealth() <= healthtohealat.get() && !mc.thePlayer.isPotionActive(Potion.regeneration))) {
                if (!~isEating) isEating = mc.thePlayer.inventory.currentItem;
                mc.thePlayer.inventory.currentItem = hotbarStacks.indexOf(stack);
                mc.playerController.updateController();
                KeyBinding.setKeyBindState(mc.gameSettings.keyBindUseItem.getKeyCode(), true);
                return;
            }
        }
    }
    if (~isEating) {
        KeyBinding.setKeyBindState(mc.gameSettings.keyBindUseItem.getKeyCode(), false);
        mc.thePlayer.inventory.currentItem = isEating;
        mc.playerController.updateController();
        isEating = -1;
    }
    return true;
}

/*---------------------*/
/*Action: Select Blocks*/
/*---------------------*/

function selectBlocks () {
    if (isReady("Select Blocks") && !mc.thePlayer.openContainer.windowId && !openInventory && !mc.currentScreen && !ScaffoldModule.state && !TowerModule.state && !~isEating && mc.gameSettings.keyBindUseItem.isKeyDown()) {
        var stack = mc.thePlayer.getHeldItem();
        if (stack) var item = stack.getItem();
        if (mc.objectMouseOver && mc.objectMouseOver.typeOfHit == "BLOCK" && (!stack || !(stack.getItem() instanceof ItemBlock))) {
            var slot = InventoryUtils.findAutoBlockBlock();
            if (~slot) {
                mc.thePlayer.inventory.currentItem = slot - 36;
                mc.playerController.updateController();
            }
        } 
    }
    return true
}

/*------------------*/
/*Action: Play Again*/
/*------------------*/

function playAgain () {
    if ((!playing || !gamedetection.get()) && isReady("Play Again") && !mc.currentScreen && playAgainTimer.hasTimePassed(playagaininterval.get())) {
        var hotbarStacks = Java.from(mc.thePlayer.inventory.mainInventory).slice(0, 8),
            stack = hotbarStacks.filter(function (s) s && ["Play Again", "Jogar novamente"].some(function (text) s.getDisplayName().contains(text)))[0];
        if (stack) {
            mc.thePlayer.inventory.currentItem = hotbarStacks.indexOf(stack);
            mc.playerController.updateController();
            sendPacket(new C08PacketPlayerBlockPlacement(stack));
            playAgainTimer.reset();
        }
    }
}

/*-----------*/
/*Is in game?*/
/*-----------*/

function checkPlaying() {
    if (gamedetection.get()) {
        if (!mc.thePlayer.capabilities.allowEdit || mc.thePlayer.capabilities.allowFlying || mc.thePlayer.capabilities.disableDamage ||
            mc.getNetHandler().getPlayerInfoMap().size() == 1 || mc.thePlayer.isSpectator() ||
            (mc.thePlayer.getTeam() && ((mc.theWorld.getScoreboard().getTeams().size() == 1 && !mc.thePlayer.getTeam().getAllowFriendlyFire()) || (mc.thePlayer.getTeam().getTeamName() == "1y|1"))) ||
            (mc.thePlayer.getActivePotionEffect(Potion.invisibility) && mc.thePlayer.getActivePotionEffect(Potion.invisibility).getIsPotionDurationMax())) return playing = false;

        for each (var e in mc.theWorld.loadedEntityList) {
            if (e instanceof IBossDisplayData || e instanceof EntityArmorStand) {
                tag = e.getCustomNameTag();
                if (tag && !tag.contains(":") && !tag.contains("Vazio!") && !tag.contains("§6§lRumble Box") && !tag.contains("§5§lDivine Drop")) return playing = false;
            }
        }
    }
    return playing = true;
}

/*--------------*/
/*Item utilities*/
/*--------------*/

function getPriority(array, stack) stack && array ? array.find(function (v) v.toLowerCase() == "food" ? stack.getItem() instanceof ItemFood : ["block", "blocks"].includes(v.toLowerCase()) ? stack.getItem() instanceof ItemBlock : stack.getItem().getItemStackDisplayName(stack).contains(v), true) : -1;

function isUseful (stack, stacks) {
    if (stack) {
        var item = stack.getItem(), listed = checkListed(stack);
        if (listed != null) return listed;
        else if (item instanceof ItemBlock) return isUsefulBlock(stack);
        else if (item instanceof ItemFood || item instanceof ItemEnderPearl || item instanceof ItemEnchantedBook || item instanceof ItemBucket || ITEM_WHITELIST.includes(item)) return true;
        else if (item instanceof ItemArmor || item instanceof ItemTool || item instanceof ItemSword || item instanceof ItemBow) return isBest(stack, stacks);
        else if (item instanceof ItemPotion) return isGoodPotion(stack);
    }
}

function isBest (stack, stacks) {
    var hotbarIndex = stacks.length - 9,
        itemIndex = stacks.indexOf(stack),
        item = stack.getItem();
    return !stacks.some(function (s, i) {
        if (s && s != stack && s.getItem().class == item.class && checkListed(s) !== false) {
            if (item instanceof ItemArmor) {
                if (item.armorType != s.getItem().armorType) return;
                var result1 = 0,
                    result2 = compareArmor(stack, s);
            } else if (item instanceof ItemTool)
                var blockType = stack instanceof ItemAxe ? Blocks.log : stack instanceof ItemPickaxe ? Blocks.stone : Blocks.dirt,
                    result1 = stack.getItem().getStrVsBlock(stack, blockType) * getDurability(stack),
                    result2 = s.getItem().getStrVsBlock(s, blockType) * getDurability(s);
            else if (item instanceof ItemSword) 
                var result1 = getAttackDamage(stack), result2 = getAttackDamage(s);
            else if (item instanceof ItemBow) 
                var result1 = ItemUtils.getEnchantment(stack, Enchantment.power),
                    result2 = ItemUtils.getEnchantment(s, Enchantment.power);
            if (result1 != result2) return result1 < result2;
            else {
                var enchantments1 = ItemUtils.getEnchantmentCount(stack),
                    enchantments2 = ItemUtils.getEnchantmentCount(s);
                if (enchantments1 != enchantments2) return enchantments1 < enchantments2;
                else {
                    var durability1 = getDurability(stack),
                        durability2 = getDurability(s);
                    if (durability1 != durability2) return durability1 < durability2;
                    else {
                        if (item instanceof ItemArmor) {
                            if (itemIndex == item.armorType + 5) return false;
                        } else {
                            var priority1 = getPriority(sortValues[itemIndex - hotbarIndex], stack),
                                priority2 = getPriority(sortValues[i - hotbarIndex], s);
                            if (priority1 != priority2) return !~priority1 || (~priority2 && (priority1 >= priority2));
                        }
                        return itemIndex > i;
                    }
                }
            }
        }
    });
}

function isGoodPotion (stack) {
    if (stack && stack.getItem() instanceof ItemPotion) {
        for each (var e in ITEM_POTION.getEffects(stack)) if (e && ["potion.poison", "potion.harm", "potion.moveSlowdown", "potion.weakness"].includes(e.getEffectName())) return;
        return true;
    }
}

function isActive (stack) {
    for each (var e in ITEM_POTION.getEffects(stack)) {
        if (e) {
            for each (var a in mc.thePlayer.getActivePotionEffects()) if (a.getEffectName() == e.getEffectName()) return true;
            return mc.thePlayer.getHealth() > healthtohealat.get() && ["potion.regeneration", "potion.heal"].includes(e.getEffectName());
        }
    }
}

function click (slotId, clicked, mode) {
    if (invopen.get() == "Simulate" && !openInventory && !mc.thePlayer.openContainer.windowId) sendPacket(new C16PacketClientStatus(C16PacketClientStatus.EnumState.OPEN_INVENTORY_ACHIEVEMENT));
    mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, slotId, clicked, mode, mc.thePlayer);
}

function checkListed (stack) {
    if (stack) {
        var whitelisted = userWhitelist.some(function (entry) stack.getDisplayName().contains(entry)),
            blacklisted = userBlacklist.some(function (entry) stack.getDisplayName().contains(entry));
        return whitelisted ? !blacklisted : blacklisted ? false : null;
    }
}

function shouldManageInventory () mc.thePlayer.inventory.inventoryChanged && !~isEating && (invopen.get() == "Simulate" ? !mc.thePlayer.openContainer.windowId : invopen.get() != "Require" || mc.currentScreen instanceof GuiInventory);

function isUsefulBlock (stack) {
    if (stack) {
        var item = stack.getItem();
        if (item instanceof ItemBlock) {
            var block = item.getBlock();
            return BLOCK_WHITELIST.includes(block) || (block.isFullBlock() && !block.hasTileEntity() && !BLOCK_BLACKLIST.includes(block) && !(block instanceof BlockFalling));
        }
    }
}

function isReady (action) actions[action].module.state && (!actions[action].delay || attackTimer.hasTimePassed(actions[action].delay.get()));