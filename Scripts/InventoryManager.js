///api_version=2
scriptAutoUpdate = false;

(script = registerScript({
    name: "InventoryManager",
    authors: ["CzechHek"],
    version: "7.1"
})).import("Core.lib");

list = [
    lobbydetection = value.createBoolean("LobbyDetection", true),
    nowindowpackets = new value.createBoolean("NoWindowPackets", true),
    invopen = value.createList("InvOpen", ["Require", "Simulate", "None"], "None"),
    maxinvdelay = new (Java.extend(IntegerValue)) ("MaxInvDelay", 50, 0, 1000) {onChanged: function (o, n) {n < mininvdelay.get() && maxinvdelay.set(mininvdelay.get())}},
    mininvdelay = new (Java.extend(IntegerValue)) ("MinInvDelay", 50, 0, 1000) {onChanged: function (o, n) {n > maxinvdelay.get() && mininvdelay.set(maxinvdelay.get())}},
    maxstealdelay = new (Java.extend(IntegerValue)) ("MaxStealDelay", 50, 0, 1000) {onChanged: function (o, n) {n < minstealdelay.get() && maxstealdelay.set(minstealdelay.get())}},
    minstealdelay = new (Java.extend(IntegerValue)) ("MinStealDelay", 50, 0, 1000) {onChanged: function (o, n) {n > maxstealdelay.get() && minstealdelay.set(maxstealdelay.get())}},
    startdelay = value.createInteger("StartDelay", 100, 0, 1000),
    closedelay = value.createInteger("CloseDelay", 100, 0, 1000),
    openinterval = value.createInteger("OpenInterval", 500, 0, 1000),
    openrange = value.createFloat("OpenRange", 5, 3, 8),
    openwallsrange = value.createFloat("OpenWallsRange", 5, 1, 8),
    ignorelootedchests = value.createBoolean("IgnoreLootedChests", true),
    openswing = value.createList("OpenSwing", ["Visual", "Packet", "None"], "None"),
    rotations = new (Java.extend(ListValue)) ("Rotations", ["Visual", "Packet", "None"], "None") {onChanged: function () {updateValues()}},
    rotationduration = value.createInteger("RotationDuration", 1, 1, 100),
    healthtohealat = value.createInteger("HealthToHealAt", 15, 1, 20),
    throwdelay = value.createInteger("ThrowDelay", 500, 0, 1000),
    noattackdelay = value.createInteger("NoAttackDelay", 500, 0, 1000),
    slot1 = new (Java.extend(TextValue)) ("Slot1", "Sword") {onChanged: function () {mc.thePlayer.inventory.inventoryChanged = true}},
    slot2 = new (Java.extend(TextValue)) ("Slot2", "Pickaxe") {onChanged: function () {mc.thePlayer.inventory.inventoryChanged = true}},
    slot3 = new (Java.extend(TextValue)) ("Slot3", "Spade") {onChanged: function () {mc.thePlayer.inventory.inventoryChanged = true}},
    slot4 = new (Java.extend(TextValue)) ("Slot4", "Axe") {onChanged: function () {mc.thePlayer.inventory.inventoryChanged = true}},
    slot5 = new (Java.extend(TextValue)) ("Slot5", "Bow") {onChanged: function () {mc.thePlayer.inventory.inventoryChanged = true}},
    slot6 = new (Java.extend(TextValue)) ("Slot6", "Golden Apple, Food") {onChanged: function () {mc.thePlayer.inventory.inventoryChanged = true}},
    slot7 = new (Java.extend(TextValue)) ("Slot7", "Splash Potion, Ender Pearl") {onChanged: function () {mc.thePlayer.inventory.inventoryChanged = true}},
    slot8 = new (Java.extend(TextValue)) ("Slot8", "Bucket, Block") {onChanged: function () {mc.thePlayer.inventory.inventoryChanged = true}},
    slot9 = new (Java.extend(TextValue)) ("Slot9", "Block") {onChanged: function () {mc.thePlayer.inventory.inventoryChanged = true}},
    modifylistings = new (Java.extend(ListValue))("ModifyListings", ["Whitelist", "Blacklist", "", "List", "Reset"], "") {
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
            userWhitelist = whitelist.get().split(", ").filter(Boolean);
            userBlacklist = blacklist.get().split(", ").filter(Boolean);
        },
        onClickGuiOpen: function () {
            updateValues();
        },
        onClickGuiClosed: function () {
            updateValues(true);
        },
        onMotion: function (e) {
            if (e.getEventState() == "PRE") {
                if (shouldOperate()) {
                    instantSteal = minstealdelay.get() + maxstealdelay.get() == 0;
                    instantInv = mininvdelay.get() + maxinvdelay.get() == 0
                    stealItems() && sortHotbar() && dropGarbage() && equipArmor() && prepareToThrow() && lookAtChest();
                }
            } else {
                lookingAtChest && openChest();
                throwingPotion && throwPotion();
            }
        },
        onPacket: function (e) {
            if (e.getPacket() instanceof C16PacketClientStatus && e.getPacket().getStatus() == "OPEN_INVENTORY_ACHIEVEMENT") {
                if (openInventory) e.cancelEvent();
                else openInventory = true;
                if (nowindowpackets.get()) e.cancelEvent();
            } else if (e.getPacket() instanceof C0DPacketCloseWindow || e.getPacket() instanceof S2EPacketCloseWindow) {
                if (openInventory) {
                    openInventory = false;
                    if (nowindowpackets.get() && e.getPacket() instanceof C0DPacketCloseWindow) e.cancelEvent();
                }
            } else if (e.getPacket() instanceof S30PacketWindowItems) {
                if (lastChest) chestBlacklist.push(lastChest), lastChest = null;
                timeout(startdelay.get(), function () receivedItems = true);
            } else if (e.getPacket() instanceof C02PacketUseEntity) {
                if (e.getPacket().getAction() == "ATTACK") {
                    attackTimer.reset();
                    if (selectWeapon()) e.cancelEvent(), timeout(1, function () sendPacket(e.getPacket()));
                }
            } else if (e.getPacket() instanceof C01PacketChatMessage) {
                if (modifylistings.get()) {
                    e.cancelEvent();
                    value = this.module.getValue(modifylistings.get());
                    array = value.get().split(", ").filter(Boolean);
                    msg = e.getPacket().getMessage();
                    if (array.remove(msg)) printLB("Removed§a§l", msg, "§3from§a§l", value.getName().toLowerCase() + "§3.");
                    else {
                        array.push(msg);
                        printLB("Added§a§l", msg, "§3to§a§l", value.getName().toLowerCase() + "§3.");
                    }
                    if (value == whitelist) userWhitelist = array;
                    else userBlacklist = array;
                    playSound("random.anvil_use");
                    value.set(array.join(", "));
                    modifylistings.set("");
                    mc.thePlayer.inventory.inventoryChanged = true;
                }
            } else if (e.getPacket() instanceof S24PacketBlockAction) {
                if (actions["Open Chests"].state && ignorelootedchests.get() && e.getPacket().getBlockType() == Blocks.chest && e.getPacket().getData2()) chestBlacklist.push(mc.theWorld.getTileEntity(e.getPacket().getBlockPosition()));
            }
        },
        onClickBlock: function (e) {
            if (actions["Select Tools"].state && !ScaffoldModule.state && !TowerModule.state) {
                block = mc.theWorld.getBlockState(e.getClickedBlock()).getBlock();
                currentSpeed = getBreakingSpeed(mc.thePlayer.getHeldItem(), block);
                hotbarStacks = Java.from(mc.thePlayer.inventory.mainInventory).slice(0, 8);
                stack = hotbarStacks.slice().filter(function (stack) getBreakingSpeed(stack, block) > currentSpeed).sort(function (b, a) getBreakingSpeed(a, block) - getBreakingSpeed(b, block))[0];
                if (stack) {
                    targetSlot = hotbarStacks.indexOf(stack);
                    if (mc.thePlayer.inventory.currentItem != targetSlot) mc.thePlayer.inventory.currentItem = targetSlot, mc.playerController.updateController();
                }
            }
        },
        onLoad: function () {
            module.slice(1).map(function (object) object.module).forEach(function (m) actions[m.name] = m);
        },
        onDisable: function () {
            for each (m in actions) m.array = false;
        },
        onEnable: function () {
            for each (m in actions) m.array = m.getValue("In array").get();
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
Notification = Java.type("net.ccbluex.liquidbounce.ui.client.hud.element.elements.Notification");
TileEntityChest = Java.type("net.minecraft.tileentity.TileEntityChest");
var targetModule, chestBlacklist = [], openInventory = false, actions = {}, lookingAtChest, lastChest, receivedItems, throwingPotion, userWhitelist, userBlacklist;
openTimer = new MSTimer(), stealTimer = new MSTimer(), invTimer = new MSTimer(), blacklistTimer = new MSTimer(), attackTimer = new MSTimer(), throwTimer = new MSTimer();
ACTIONS = ["Open Chests", "Steal Items", "Drop Garbage", "Equip Armor", "Sort Hotbar", "Select Weapons", "Select Tools", "Throw Potions"];
DESCRIPTIONS = ["Open chests around you.", "Steal items from chests.", "Drop useless items from inventory.", "Equip the best armor.", "Sort your hotbar slots.", "Select weapon when attacking.", "Select tools when mining.", "Throw useful potions."];
BLOCK_WHITELIST = [Blocks.glass, Blocks.stained_glass];
BLOCK_BLACKLIST = [Blocks.sand, Blocks.gravel, Blocks.soul_sand, Blocks.tnt];
ITEM_WHITELIST = [Items.arrow, Items.stick, Items.compass];
ITEM_POTION = new ItemPotion();
ARMOR_COMPARATOR = new ArmorComparator();

/*--------------*/
/*User interface*/
/*--------------*/

ACTIONS.forEach(function (action, i) {
    module.push({
        name: action,
        category: "InventoryManager",
        description: DESCRIPTIONS[i],
        values: [
            value.createText("Bind", ""),
            new (Java.extend(BoolValue)) ("Change bind", false) {
                onChanged: function (o, n) {
                    if (n) {
                        targetModule = moduleManager.getModule(ACTIONS[i]);
                        targetModule.getValue("Change bind").set(false);
                        mc.displayGuiScreen(bindScreen);
                    }
                }
            },
            new (Java.extend(BoolValue)) ("In array", false) {
                onChanged: function (o, n) {
                    if (InventoryManagerModule.state) moduleManager.getModule(ACTIONS[i]).array = n;
                }
            }
        ],
        onLoad: function () {
            this.module.array = this.module.getValue("In array").get();
        },
        onEnable: function () {
            timeout(20, function () updateValues());
        },
        onDisable: function () {
            this.onEnable();
        }
    });
});

function updateValues (closing) {
    shownValues = [];
    if (closing) shownValues = list;
    else {
        module.slice(1).forEach(function (action) {
            if (action.module.state) {
                switch (action.name) {
                    case "Open Chests": shownValues.push(lobbydetection, openinterval, openrange, openwallsrange, ignorelootedchests, openswing, rotations, rotations.get() == "Packet" ? rotationduration : null, noattackdelay); break;
                    case "Steal Items": shownValues.push(lobbydetection, maxstealdelay, minstealdelay, startdelay, closedelay, modifylistings, whitelist, blacklist); break
                    case "Drop Garbage": case "Equip Armor": shownValues.push(lobbydetection, invopen, nowindowpackets, maxinvdelay, mininvdelay, noattackdelay, modifylistings, whitelist, blacklist); break
                    case "Sort Hotbar": shownValues.push(lobbydetection, invopen, nowindowpackets, maxinvdelay, mininvdelay, noattackdelay, slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9); break
                    case "Throw Potions": shownValues.push(lobbydetection, rotations, rotations.get() == "Packet" ? rotationduration : null, healthtohealat, throwdelay);
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
                targetModule.keyBind = -1;
                targetModule.getValue("Bind").set("");
                printLB("Unbound action§a§l", targetModule.name + "§3.");
                LiquidBounce.hud.addNotification(new Notification("Unbound action " + targetModule.name));
                playSound("random.anvil_use");
                break
            default:
                targetModule.keyBind = char;
                targetModule.getValue("Bind").set(keyName);
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

/*------------------*/
/*Action: Open Chest*/
/*------------------*/

function lookAtChest() {
    if (!actions["Open Chests"].state || !openTimer.hasTimePassed(openinterval.get()) || openInventory || mc.thePlayer.openContainer.windowId) return true;
    for each (tileEntity in mc.theWorld.loadedTileEntityList) {
        if (tileEntity instanceof TileEntityChest && !chestBlacklist.includes(tileEntity)) {
            eyes = mc.thePlayer.getPositionEyes(1);
            if (bb = (state = mc.theWorld.getBlockState(tileEntity.getPos())).getBlock().getCollisionBoundingBox(mc.theWorld, tileEntity.getPos(), state)) {
                distances = []; visible = false;
                [new Vec3(bb.minX, bb.minY, bb.minZ), new Vec3(bb.minX, bb.minY, bb.maxZ), new Vec3(bb.minX, bb.maxY, bb.minZ), new Vec3(bb.minX, bb.maxY, bb.maxZ), new Vec3(bb.maxX, bb.minY, bb.minZ), new Vec3(bb.maxX, bb.minY, bb.maxZ), new Vec3(bb.maxX, bb.maxY, bb.minZ), new Vec3(bb.maxX, bb.maxY, bb.maxZ)].forEach(function (v) {
                    if (!visible) visible = !(result = mc.theWorld.rayTraceBlocks(eyes, v)) || result.getBlockPos().equals(tileEntity.getPos());
                    distances.push(Math.sqrt(Math.pow(eyes.xCoord - v.xCoord, 2) + Math.pow(eyes.yCoord - v.yCoord, 2) + Math.pow(eyes.zCoord - v.zCoord, 2)));
                });
                if (Math.min.apply(null, distances) < (visible ? openrange.get() : openwallsrange.get())) {
                    rotation = RotationUtils.faceBlock(tileEntity.getPos()).getRotation()
                    rotations.get() == "Visual" ? rotation.toPlayer(mc.thePlayer) : rotations.get() == "Packet" && RotationUtils.setTargetRotation(rotation, rotationduration.get() - 1);
                    lookingAtChest = tileEntity;
                    openTimer.reset();
                    return false;
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
}

/*-------------------*/
/*Action: Steal Items*/
/*-------------------*/

function stealItems () {
    if (!actions["Steal Items"].state || !(mc.currentScreen instanceof GuiChest)) return true
    if (receivedItems && stealTimer.hasTimePassed(rand(minstealdelay.get(), maxstealdelay.get()))) {
        chestStacks = Java.from(mc.thePlayer.openContainer.getInventory()).slice(0, mc.currentScreen.lowerChestInventory.getSizeInventory());
        stacks = chestStacks.concat(Java.from(mc.thePlayer.inventoryContainer.getInventory()));
        stealList = [];
    
        if (sortHotbar(chestStacks)) {
            chestStacks.some(function (stack, i) stack && isUseful(stack) && stealList.push(i) && !instantSteal);
            stealList.forEach(function (id) click(id, 0, 1));
            stealList.length && stealTimer.reset()

            if (!stealList.length && stealTimer.hasTimePassed(closedelay.get())) mc.thePlayer.closeScreen();
        }
    }

}

/*-------------------*/
/*Action: Sort Hotbar*/
/*-------------------*/

function sortHotbar (chestStacks) {
    if (!actions["Sort Hotbar"].state || (!chestStacks && !isReady())) return true
    if (chestStacks || invTimer.hasTimePassed(rand(mininvdelay.get(), maxinvdelay.get()))) {
        sortValues = [slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9].map(function (e) e.get().replaceAll(";", ",").replaceAll(", ", ",").split(","));
        sortTargets = sortValues.map(function (e, i) [e, i]).sort(function (a, b) a[0].length - b[0].length);
        sortList = [];
        if (!chestStacks) stacks = Java.from(mc.thePlayer.inventoryContainer.getInventory());
        hotbarIndex = stacks.length - 9;
    
        sortTargets.some(function (data) {
            targets = data[0]; slot = data[1]; found = false;
            variable = targets.some(function (target, priority1) {
                return (!getPriority(targets, stacks[slot + hotbarIndex]) && isUseful(stacks[slot + hotbarIndex])) ||
                (chestStacks || stacks).some(function (stack, i) {
                    if (stack && (item = stack.getItem()) && (target.toLowerCase() == "food" ? item instanceof ItemFood : ["block", "blocks"].includes(target.toLowerCase()) ? item instanceof ItemBlock : item.getItemStackDisplayName(stack).contains(target)) && isUseful(stack)) {
                        priority2 = getPriority(targets, stacks[slot + hotbarIndex]);
                        priority3 = i >= hotbarIndex ? getPriority(sortValues[i - hotbarIndex], stack) : -1;
                        if (~priority1 && (!~priority2 || (priority1 < priority2) || !isUseful(stacks[slot + hotbarIndex])) && (!~priority3 || (priority1 < priority3))) return sortList.push([i, slot]);
                    }
                });
            });
            return sortList.length && !(chestStacks ? instantSteal : instantInv);
        });
        sortList.forEach(function (data) click(data[0], data[1], 2));
        sortList.length && (chestStacks ? stealTimer : invTimer).reset();
    
        return !sortList.length;
    }
}

/*--------------------*/
/*Action: Drop Garbage*/
/*--------------------*/

function dropGarbage () {
    if (!actions["Drop Garbage"].state || !isReady()) return true
    if (invTimer.hasTimePassed(rand(mininvdelay.get(), maxinvdelay.get()))) {
        dropList = [];
        stacks = Java.from(mc.thePlayer.inventoryContainer.getInventory());
        stacks.some(function (stack, i) stack && !isUseful(stack) && dropList.push(i) && !instantInv);
        dropList.forEach(function (id) click(id, 1, 4));
        dropList.length && invTimer.reset();
        return !dropList.length;
    }
}

/*-------------------*/
/*Action: Equip Armor*/
/*-------------------*/

function equipArmor () {
    if (!actions["Equip Armor"].state || !isReady()) return true
    if (invTimer.hasTimePassed(rand(mininvdelay.get(), maxinvdelay.get()))) {
        equipList = [];
        stacks = Java.from(mc.thePlayer.inventoryContainer.getInventory());
        [0, 1, 2, 3].some(function (type) !stacks[type + 5] && stacks.some(function (stack, i) stack && ((item = stack.getItem()) instanceof ItemArmor) && item.armorType == type && isUseful(stack) && equipList.push(i)) && !instantInv);
        equipList.forEach(function (id) click(id, 0, 1));
        equipList.length && invTimer.reset();

        if (!equipList.length) {
            if (openInventory && invopen.get() == "Simulate") sendPacket(new C0DPacketCloseWindow(mc.thePlayer.openContainer.windowId));
            mc.thePlayer.inventory.inventoryChanged = false;
            return true
        }
    }
}

/*----------------------*/
/*Action: Select Weapons*/
/*----------------------*/

function selectWeapon () {
    if (actions["Select Weapons"].state && !ScaffoldModule.state && !TowerModule.state) {
        hotbarStacks = Java.from(mc.thePlayer.inventory.mainInventory).slice(0, 8);
        stack = hotbarStacks.slice().sort(function (b, a) getAttackDamage(a) - getAttackDamage(b))[0];
        if (~getAttackDamage(stack)) {
            targetSlot = hotbarStacks.indexOf(stack);
            if (mc.thePlayer.inventory.currentItem != targetSlot) {
                mc.thePlayer.inventory.currentItem = targetSlot;
                mc.playerController.updateController();
                return true;
            }
        }
    }
}

/*---------------------*/
/*Action: Throw Potions*/
/*---------------------*/

function prepareToThrow () {
    if (!actions["Throw Potions"].state || !mc.thePlayer.onGround || mc.thePlayer.openContainer.windowId || openInventory || !throwTimer.hasTimePassed(throwdelay.get())) return true
    hotbarStacks = Java.from(mc.thePlayer.inventory.mainInventory).slice(0, 8);
    stack = hotbarStacks.filter(function (s) isGoodPotion(s) && ItemPotion.isSplash(s.getItemDamage()) && !isActive(s))[0];
    if (stack && !mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, new AxisAlignedBB(mc.thePlayer.posX, mc.thePlayer.posY - 0.1, mc.thePlayer.posZ, mc.thePlayer.posX, mc.thePlayer.posY - 0.1, mc.thePlayer.posZ)).isEmpty()) {
        targetSlot = hotbarStacks.indexOf(stack);
        sendPacket(new C09PacketHeldItemChange(targetSlot));
        rotations.get() == "Visual" ? (mc.thePlayer.rotationPitch = 90) : RotationUtils.setTargetRotation(new Rotation(mc.thePlayer.rotationYaw, 90), rotationduration.get() - 1);
        throwingPotion = stack;
        throwTimer.reset();
    } else return true;
}

function throwPotion() {
    sendPacket(new C08PacketPlayerBlockPlacement(throwingPotion));
    sendPacket(new C09PacketHeldItemChange(mc.thePlayer.inventory.currentItem));
    throwingPotion = null;
}

/*---------------*/
/*Should operate?*/
/*---------------*/

function shouldOperate() {
    if (!attackTimer.hasTimePassed(noattackdelay.get())) return false
    if (lobbydetection.get()) {
        if (!mc.thePlayer.capabilities.allowEdit || mc.thePlayer.capabilities.allowFlying || mc.thePlayer.capabilities.disableDamage ||
            mc.thePlayer.isSpectator() || mc.thePlayer.itemInUseCount ||
            (mc.thePlayer.getTeam() && ((mc.theWorld.getScoreboard().getTeams().size() == 1 && !mc.thePlayer.getTeam().getAllowFriendlyFire()) || (mc.thePlayer.getTeam().getTeamName() == "1y|1")))) return false

        for each (e in mc.theWorld.loadedEntityList) {
            if (e instanceof IBossDisplayData || e instanceof EntityArmorStand) {
                tag = e.getCustomNameTag();
                if (!tag.contains(":") && !tag.contains("Vazio!")) return false
            }
        }
    }
    return true
}

/*--------------*/
/*Item utilities*/
/*--------------*/

function getPriority(array, stack) stack && array ? array.find(function (v) v.toLowerCase() == "food" ? stack.getItem() instanceof ItemFood : ["block", "blocks"].includes(v.toLowerCase()) ? stack.getItem() instanceof ItemBlock : stack.getItem().getItemStackDisplayName(stack).contains(v), true) : -1;

function isUseful (stack) {
    if (stack) {
        item = stack.getItem();
        listed = checkListed(stack);
        if (listed != null) return listed;
        else if (item instanceof ItemBlock) return isUsefulBlock(stack);
        else if (item instanceof ItemFood || item instanceof ItemEnderPearl || item instanceof ItemEnchantedBook || item instanceof ItemBucket || ITEM_WHITELIST.includes(item)) return true
        else if (item instanceof ItemArmor || item instanceof ItemTool || item instanceof ItemSword || item instanceof ItemBow) return isBest(stack);
        else if (item instanceof ItemPotion) return isGoodPotion(stack);
    }
}

function isBest (stack) {
    sortValues = [slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9].map(function (e) e.get().replaceAll(";", ",").replaceAll(", ", ",").split(","));
    hotbarIndex = stacks.length - 9;
    return !stacks.some(function (s, i) {
        if (s && s != stack && s.getItem().class == (item = stack.getItem()).class) {
            if (item instanceof ItemArmor) {
                if (item.armorType != s.getItem().armorType) return false;
                result1 = 0;
                result2 = ARMOR_COMPARATOR.compare(new ArmorPiece(s, s), new ArmorPiece(stack, stack));
            } else if (item instanceof ItemTool) {
                blockType = stack instanceof ItemAxe ? Blocks.log : stack instanceof ItemPickaxe ? Blocks.stone : Blocks.dirt;
                result1 = stack.getItem().getStrVsBlock(stack, blockType) * getDurability(stack);
                result2 = s.getItem().getStrVsBlock(s, blockType) * getDurability(s);
            } else if (item instanceof ItemSword) {
                result1 = getAttackDamage(stack);
                result2 = getAttackDamage(s);
            } else if (item instanceof ItemBow) {
                result1 = ItemUtils.getEnchantment(stack, Enchantment.power);
                result2 = ItemUtils.getEnchantment(s, Enchantment.power);
            }
            if (result1 != result2) return result1 < result2;
            else {
                enchantments1 = ItemUtils.getEnchantmentCount(stack);
                enchantments2 = ItemUtils.getEnchantmentCount(s);
                if (enchantments1 != enchantments2) return enchantments1 < enchantments2;
                else {
                    durability1 = getDurability(stack);
                    durability2 = getDurability(s);
                    if (durability1 != durability2) return durability1 < durability2;
                    else {
                        index1 = stacks.indexOf(stack);
                        index2 = stacks.indexOf(s);
                        if (item instanceof ItemArmor) {
                            if (index1 == item.armorType + 5) return false;
                        } else {
                            priority1 = getPriority(sortValues[index1 - hotbarIndex], stack);
                            priority2 = getPriority(sortValues[index2 - hotbarIndex], s);
                            if (priority1 != priority2) return !~priority1 || (~priority2 && (priority1 >= priority2));
                        }
                        return index1 > index2;
                    }
                }
            }
        }
    });
}

function isGoodPotion (stack) stack && stack.getItem() instanceof ItemPotion && !Java.from(ITEM_POTION.getEffects(stack)).some(function (e) ["potion.poison", "potion.harm", "potion.moveSlowdown", "potion.weakness"].includes(e.getEffectName()));

function isActive (stack) Java.from(new ItemPotion().getEffects(stack)).some(function (e) Java.from(mc.thePlayer.getActivePotionEffects()).some(function (e2) e.getEffectName() == e2.getEffectName()) || (mc.thePlayer.getHealth() > healthtohealat.get() && ["potion.regeneration", "potion.heal"].includes(e.getEffectName())));

function click (slotId, clicked, mode) {
    if (invopen.get() == "Simulate" && !openInventory && !mc.thePlayer.openContainer.windowId) sendPacket(new C16PacketClientStatus(C16PacketClientStatus.EnumState.OPEN_INVENTORY_ACHIEVEMENT));
    mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, slotId, clicked, mode, mc.thePlayer);
}

function checkListed (stack) {
    if (stack) {
        whitelisted = userWhitelist.some(function (entry) stack.getDisplayName().contains(entry));
        blacklisted = userBlacklist.some(function (entry) stack.getDisplayName().contains(entry));
        return whitelisted ? !blacklisted : blacklisted ? false : null;
    }
}

function isReady () mc.thePlayer.inventory.inventoryChanged && (invopen.get() == "Simulate" ? !mc.thePlayer.openContainer.windowId : invopen.get() != "Require" || mc.currentScreen instanceof GuiInventory);

function isUsefulBlock (stack) {
    if (stack) {
        item = stack.getItem();
        if (item instanceof ItemBlock) {
            block = item.getBlock();
            return BLOCK_WHITELIST.includes(block) || (block.isFullBlock() && !block.hasTileEntity() && !BLOCK_BLACKLIST.includes(block));
        }
    }
}