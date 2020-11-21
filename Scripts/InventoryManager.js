///api_version=2
(script = registerScript({
    name: "InventoryManager",
    version: "7.0",
    authors: ["CzechHek"]
})).import("Core.lib");

list = [
    actions = value.createText("Actions", (ACTIONS = ["Open Chests", "Steal Items", "Drop Garbage", "Equip Armor", "Sort Hotbar", "Select Weapons", "Select Tools", "Throw Potions"]).join(", ")),
    binds = value.createText("Binds", "{}"),
    posx = value.createInteger("PosX", 0, 0, 1),
    posy = value.createInteger("PosY", 0, 0, 1),
    experimental = value.createBoolean("Experimental lobby detection", true),
    randomize = value.createBoolean("Randomize", false),
    invopen = value.createBoolean("InvOpen", false),
    maxinvdelay = new (Java.extend(IntegerValue))("MaxInvDelay", 50, 0, 1000) {onChanged: function (o, n) {n < mininvdelay.get() && maxinvdelay.set(mininvdelay.get())}},
    mininvdelay = new (Java.extend(IntegerValue))("MinInvDelay", 50, 0, 1000) {onChanged: function (o, n) {n > maxinvdelay.get() && mininvdelay.set(maxinvdelay.get())}},
    maxstealdelay = new (Java.extend(IntegerValue))("MaxStealDelay", 50, 0, 1000) {onChanged: function (o, n) {n < minstealdelay.get() && maxstealdelay.set(minstealdelay.get())}},
    minstealdelay = new (Java.extend(IntegerValue))("MinStealDelay", 50, 0, 1000) {onChanged: function (o, n) {n > maxstealdelay.get() && minstealdelay.set(maxstealdelay.get())}},
    startdelay = value.createInteger("StartDelay", 100, 0, 1000),
    closedelay = value.createInteger("CloseDelay", 100, 0, 1000),
    noattackdelay = value.createInteger("NoAttackDelay", 500, 0, 1000),
    openinterval = value.createInteger("OpenInterval", 250, 0, 1000),
    openrange = value.createFloat("OpenRange", 5, 3, 8),
    openwallsrange = value.createFloat("OpenWallsRange", 3, 1, 8),
    openswing = value.createList("OpenSwing", ["Visual", "Packet", "None"], "Packet"),
    rotations = new (Java.extend(ListValue)) ("Rotations", ["Visual", "Packet", "None"], "Packet") {onChanged: function () {toggle()}},
    rotationslength = value.createInteger("RotationsLength", 1, 1, 100),
    healthtohealat = value.createInteger("HealthToHealAt", 15, 1, 20),
    throwdelay = value.createInteger("ThrowDelay", 250, 0, 1000),
    slot1 = value.createText("Slot1", "Sword"),
    slot2 = value.createText("Slot2", "Pickaxe"),
    slot3 = value.createText("Slot3", "Shovel"),
    slot4 = value.createText("Slot4", "Axe"),
    slot5 = value.createText("Slot5", "Bow"),
    slot6 = value.createText("Slot6", "Golden Apple, Food"),
    slot7 = value.createText("Slot7", "Splash Potion, Ender Pearl"),
    slot8 = value.createText("Slot8", "Water Bucket, Block"),
    slot9 = value.createText("Slot9", "Block"),
    modifylistings = new (Java.extend(ListValue))("ModifyListings", ["Whitelist", "Blacklist", "", "Reset"], "") {onChanged: function (o, n) {n == "Reset" && (whitelist.set(""), blacklist.set(""), modifylistings.set(""))}},
    whitelist = value.createText("Whitelist", ""),
    blacklist = value.createText("Blacklist", "")
]

module = {
    category: "Player",
    values: list,
    onMotion: function (e) {
        if (e.getEventState() == "PRE") {
            !attackTimer.hasTimePassed(noattackdelay.get()) && mc.currentScreen instanceof GuiChest && shouldOpen && (mc.thePlayer.closeScreen(), chestList.pop());
            
            if (shouldOperate()) {
                !openInventory && openTimer.hasTimePassed(openinterval.get()) && actions.get().contains("Open Chests") && (!mc.currentScreen || mc.currentScreen instanceof ClickGui || mc.currentScreen instanceof GuiIngameMenu || mc.currentScreen instanceof GuiChat) && rotateToOpen();
                timer.hasTimePassed(rand(minstealdelay.get(), maxstealdelay.get())) && actions.get().contains("Steal Items") && mc.currentScreen instanceof GuiChest && received && steal() && closeTimer.hasTimePassed(closedelay.get()) && mc.thePlayer.closeScreen();
                timer.hasTimePassed(rand(mininvdelay.get(), maxinvdelay.get())) && (mc.currentScreen instanceof GuiInventory || (!invopen.get() && (!mc.currentScreen || mc.currentScreen instanceof ClickGui || mc.currentScreen instanceof GuiIngameMenu || mc.currentScreen instanceof GuiChat))) && (getItems(), sort() && drop() && equip() && !mc.currentScreen && openInventory ? mc.getNetHandler().addToSendQueue(new C0DPacketCloseWindow(mc.thePlayer.openContainer.windowId)) : rotateToThrow());
            }
        } else {
            shouldOpen && openChest();
            shouldThrow && throwPotion();
        }
    },
    onPacket: function (e) {
        e.getPacket() instanceof C16PacketClientStatus && e.getPacket().getStatus() == "OPEN_INVENTORY_ACHIEVEMENT" && (openInventory ? e.cancelEvent() : openInventory = true);
        (e.getPacket() instanceof C0DPacketCloseWindow || e.getPacket() instanceof S2EPacketCloseWindow) && (openInventory = received = opened = false, shouldOpen = null);
        e.getPacket() instanceof S30PacketWindowItems && timeout(startdelay.get(), function () {received = true});
        e.getPacket() instanceof C02PacketUseEntity && e.getPacket().getAction() == "ATTACK" && (attackTimer.reset(), selectWeapon());
        lastChest && e.getPacket() instanceof S2DPacketOpenWindow && e.getPacket().getGuiId() == "minecraft:chest" && (chestList.push(lastChest), lastChest = null);
        if (e.getPacket() instanceof C01PacketChatMessage && modifylistings.get()) {
            msg = e.getPacket().getMessage().toLowerCase().replaceAll(" ", "_");
            if (Blocks[msg] || Items[msg]) {
                value = modifylistings.get() == "Whitelist" ? whitelist : blacklist;
                array = value.get() ? value.get().replaceAll(" ", "").replaceAll(";", ",").split(",") : [];
                if (array.remove(msg)) {
                    print("§a▏§2§l", "Un" + value.name.toLowerCase() + "ed§a", msg + "§2.");
                } else {
                    array.push(msg);
                    print("§a▏§2§l", value.name + "ed§a", msg + "§2.");
                }
                value.set(array.join(", "));
            } else {
                print("§c▏ §4§lInvalid§4 item name§c:", msg + "§4.");
            }
            modifylistings.set("");
            e.cancelEvent();
        }
    },
    onClickBlock: function (b) {
        if (!ScaffoldModule.state && !TowerModule.state && actions.get().contains("Select Tools")) {
            state = mc.theWorld.getBlockState(b.getClickedBlock());
            for (i = bestTool = -1; ++i < 9;) (stack = mc.thePlayer.inventory.mainInventory[i]) && (item = stack.getItem()) && item.getStrVsBlock(stack, state.getBlock()) > (~bestTool ? mc.thePlayer.inventory.mainInventory[i].getItem().getStrVsBlock(stack, state.getBlock()) : 1) && (bestTool = i);
    
            ~bestTool && mc.thePlayer.inventory.currentItem != bestTool && (mc.thePlayer.inventory.currentItem = bestTool, mc.playerController.updateController());
        }
    },
    onClickGuiOpen: function () {
        toggle();
        panel.x = posx.get(); panel.y = posy.get();
    },
    onClickGuiClosed: function () {
        setValues(InventoryManagerModule, list);
        posx.set(panel.x); posy.set(panel.y);
    },
    onClickGuiLoaded: function () {
        panel = Java.extend(Panel, {setupItems: function () {}}).class.getDeclaredConstructors()[0].newInstance("IntentoryManager", posx.get(), posy.get(), 100, 18, true);

        ACTIONS.forEach(function (a, i) {
            scriptModule = new ScriptModule({
                name: a, category: "",
                description: ["Open chests around you.", "Steal items from chests.", "Drop useless items from inventory.", "Equip the best armor.", "Sort your hotbar slots.", "Select weapon when attacking.", "Select tools when mining.", "Throw useful potions."][i],
                settings: {
                    bind: value.createText("Bind", JSON.parse(binds.get())[a] ? Keyboard.getKeyName(JSON.parse(binds.get())[a]).replace("KEY_", "") : ""),
                    info: value.createText("", "Change bind by middle clicking.")
                }
            });

            stateField.set(scriptModule, actions.get().contains(a));

            var element = new (Java.extend(ModuleElement)) (scriptModule) {
                mouseClicked: function (x, y, i) {
                    if (element.isHovering(x, y) && element.isVisible()) {
                        switch (i) {
                            case 0:
                                toggle(element.module);
                                break
                            case 1:
                                element.setShowSettings(!element.isShowSettings());
                                break
                            case 2:
                                mc.displayGuiScreen(null);
                                bindingModule = element.module;
                        }
                        playSound("gui.button.press");
                    }
                }
            }

            panel.elements.add(element);
        });

        LiquidBounce.clickGui.panels.add(panel);
    },
    onKey: function (e) {
        key = e.getKey();
        if (bindingModule) {
            if (key != 1) {
                targetKey = ~[14, 211].indexOf(key) ? "" : Keyboard.getKeyName(key).replace("KEY_", "").replace("NONE", "");
                bindingModule.getValue("Bind").set(targetKey);
            
                obj = JSON.parse(binds.get());
                targetKey ? obj[bindingModule.name] = key : delete obj[bindingModule.name];
                binds.set(JSON.stringify(obj));

                printLB("Bound module§a§l", bindingModule.name, "§3to key§a§l", (targetKey || "NONE") + "§3.");
                LiquidBounce.hud.addNotification(new Notification("Bound " + bindingModule.name + " to " + (targetKey || "NONE")));
                playSound("random.anvil_use");
            }
            bindingModule = mc.displayGuiScreen(LiquidBounce.clickGui); 
        } else Object.keys(obj = JSON.parse(binds.get())).filter(function (n) obj[n] == key).forEach(function (name) toggle(Java.from(panel.elements).find(function (elem) elem.displayName == name).module));
    },
    onRender2D: function () {
        if (bindingModule) {
            Gui.drawRect(0, 0, mc.displayWidth, mc.displayHeight, new Color(255, 255, 255, 100).getRGB());
            mc.ingameGUI.drawCenteredString(mc.fontRendererObj, "§ePress §6§la key", mc.displayWidth / 4, mc.displayHeight / 4 + 10, -1);
            mc.ingameGUI.drawCenteredString(mc.fontRendererObj, "§eto bind §6§l" + bindingModule.name, mc.displayWidth / 4, mc.displayHeight / 4 + 20, -1);
            mc.ingameGUI.drawCenteredString(mc.fontRendererObj, "§8DEL §7/ §8BACKSLASH §7to §8unbind", mc.displayWidth / 4, mc.displayHeight / 4 + 50, -1);
            mc.ingameGUI.drawCenteredString(mc.fontRendererObj, "§8ESC §7to §8leave", mc.displayWidth / 4, mc.displayHeight / 4 + 60, -1);
        }
    }
}

function sort() {
    if (!actions.get().contains("Sort Hotbar")) return true;
    toSort = findToSort();

    return !(toSort.some(function (values) {openInv(); mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, stacks.indexOf(values[0]), values[1], 2, mc.thePlayer); timer.reset(); return !instaInv}) && toSort.length);
}

function shouldSet(i1, i2) {
    priority1 = getPriority(values[i1].split(","), stacks[i2]);
    priority2 = getPriority(values[i1].split(","), stacks[i1 + 36]);
    i2 > 35 && (priority3 = getPriority(values[i2 - 36].split(","), stacks[i2]));
    
    return ~priority1 && (!~priority2 || (priority1 < priority2)) && (i2 < 36 || !~priority3 || (priority1 < priority3));
}

function getPriority(array, stack) stack ? array.find(function (v) v == "Food" ? stack.getItem() instanceof ItemFood : (v == "Block" || v == "Blocks") ? stack.getItem() instanceof ItemBlock : stack.getDisplayName().contains(v), true) : -1;

function drop() !actions.get().contains("Drop Garbage") || !(garbage.some(function (value) {openInv(); mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, value, 1, 4, mc.thePlayer); timer.reset(); return !instaInv}) && garbage.length);

function equip() {
    if (!actions.get().contains("Equip Armor")) return true;
    armor = findToSort(true);
    
    return !(armor.some(function (value) {openInv(); mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, stacks.indexOf(value), 0, 1, mc.thePlayer); timer.reset(); return !instaInv}) && armor.length);
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
            else !checkListed(whitelist, item) && (checkListed(blacklist, item) || (item instanceof ItemBlock ? BLOCK_BLACKLIST.includes(item.getBlock()) : !(item instanceof ItemFood || (item instanceof ItemPotion && !isBad(itemStack)) || item instanceof ItemEnderPearl || item instanceof ItemEnchantedBook || item instanceof ItemBucket || ITEM_WHITELIST.includes(item)))) && garbage.push(i);
        }
    });
    [helmets, chestplates, leggings, boots].forEach(function (c) c.sort(function (b, a) getDurability(stacks[a]) - getDurability(stacks[b])).sort(function (b, a) ARMOR_COMPARATOR.compare(new ArmorPiece(stacks[a], a), new ArmorPiece(stacks[b], b))));
    [Blocks.log, Blocks.stone, Blocks.dirt].forEach(function (t, i2) [axes, pickaxes, spades][i2].sort(function (b, a) getDurability(stacks[a]) - getDurability(stacks[b])).sort(function (b, a) ItemUtils.getEnchantmentCount(stacks[a]) - ItemUtils.getEnchantmentCount(stacks[b])).sort(function (a, b) stacks[a].getItem().getStrVsBlock(stacks[a], t) / getDurability(stacks[a]) - stacks[b].getItem().getStrVsBlock(stacks[b], t) / getDurability(stacks[b])));
    swords.sort(function (b, a) getDurability(stacks[a]) - getDurability(stacks[b])).sort(function (b, a) ItemUtils.getEnchantmentCount(stacks[a]) - ItemUtils.getEnchantmentCount(stacks[b])).sort(function (b, a) getAttackDamage(stacks[a]) - getAttackDamage(stacks[b]));
    bows.sort(function (b, a) getDurability(stacks[a]) - getDurability(stacks[b])).sort(function (b, a) ItemUtils.getEnchantmentCount(stacks[a]) - ItemUtils.getEnchantmentCount(stacks[b])).sort(function (a, b) ItemUtils.getEnchantment(stacks[a], Enchantment.power) - ItemUtils.getEnchantment(stacks[b], Enchantment.power));
    [helmets, chestplates, leggings, boots, swords, pickaxes, axes, spades, bows].forEach(function (c) c.length > 1 && (garbage = garbage.concat(c.slice(1))));
    garbage = garbage.filter(function (a) !stacks.find(function (b) a != b && stacks[b] && ItemStack.areItemStacksEqual(stacks[a], stacks[b]))).shuffle(randomize.get());
    instaInv = !(mininvdelay.get() + maxinvdelay.get());
}

function steal() {
    useful = []; helmets = []; chestplates = []; leggings = []; boots = []; swords = []; pickaxes = []; axes = []; spades = []; bows = [];
    (stacks = Java.from(mc.thePlayer.openContainer.getInventory())).some(function (itemStack, i) {
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
            else i < mc.currentScreen.lowerChestInventory.getSizeInventory() && checkUseful(item) && useful.push(i);
        };
    });
    [helmets, chestplates, leggings, boots].forEach(function (c, i) {c.sort(function (b, a) getDurability(stacks[a]) - getDurability(stacks[b])).sort(function (b, a) ARMOR_COMPARATOR.compare(new ArmorPiece(stacks[a], 0), new ArmorPiece(stacks[b], 0))); if (c.length && c[0] < mc.currentScreen.lowerChestInventory.getSizeInventory() && mc.thePlayer.inventory.armorInventory[3 - i] && ARMOR_COMPARATOR.compare(new ArmorPiece(stacks[c[0]], 0), new ArmorPiece(mc.thePlayer.inventory.armorInventory[3 - i], 0)) <= 0) [helmets, chestplates, leggings, boots][i][0] = 54});
    [Blocks.log, Blocks.stone, Blocks.dirt].forEach(function (t, i2) {[axes, pickaxes, spades][i2].sort(function (a, b) b - a).sort(function (b, a) getDurability(stacks[a]) - getDurability(stacks[b])).sort(function (a, b) stacks[a].getItem().getStrVsBlock(stacks[a], t) / (stacks[a].getMaxDamage() - stacks[a].getItemDamage()) - stacks[b].getItem().getStrVsBlock(stacks[b], t) / (stacks[b].getMaxDamage() - stacks[b].getItemDamage()))});
    swords.sort(function (a, b) b - a).sort(function (b, a) getDurability(stacks[a]) - getDurability(stacks[b])).sort(function (b, a) (stacks[a].getItem().getDamageVsEntity() + 4 + 1.25 * ItemUtils.getEnchantment(stacks[a], Enchantment.sharpness)) - (stacks[b].getItem().getDamageVsEntity() + 4 + 1.25 * ItemUtils.getEnchantment(stacks[b], Enchantment.sharpness)));
    bows.sort(function (a, b) b - a).sort(function (b, a) getDurability(stacks[a]) - getDurability(stacks[b])).sort(function (a, b) ItemUtils.getEnchantment(stacks[a], Enchantment.power) - ItemUtils.getEnchantment(stacks[b], Enchantment.power));
    [helmets, chestplates, leggings, boots, swords, pickaxes, axes, spades, bows].forEach(function (c) {c.length && c[0] < mc.currentScreen.lowerChestInventory.getSizeInventory() && useful.push(c[0])});
    useful.sort().shuffle(randomize.get()); instaSteal = !(minstealdelay.get() + maxstealdelay.get());
    if (!actions.get().contains("Sort Hotbar")) return !(useful.some(function (value) {mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, value, 0, 2, mc.thePlayer); timer.reset(); closeTimer.reset(); return !instaSteal}) && useful.length);

    toSteal = []; values = [slot1.get(), slot2.get(), slot3.get(), slot4.get(), slot5.get(), slot6.get(), slot7.get(), slot8.get(), slot9.get()];
    useful.forEach(function (s) !values.some(function (v, i) shouldSet(i, s) && ~toSteal.push([s, i])) && toSteal.push([s, 0, 1]));

    return !(toSteal.some(function (values) {mc.playerController.windowClick(mc.thePlayer.openContainer.windowId, values[0], values[1], values[2] || 2, mc.thePlayer); timer.reset(); closeTimer.reset(); return !instaSteal}) && toSteal.length);
}

function openChest() {
    mc.playerController.onPlayerRightClick(mc.thePlayer, mc.theWorld, null, shouldOpen.getPos(), EnumFacing.DOWN, mc.thePlayer.getLookVec()); openTimer.reset();
    openswing.get() == "Visual" ? mc.thePlayer.swingItem() : openswing.get() == "Packet" && mc.getNetHandler().addToSendQueue(new C0APacketAnimation());
    shouldOpen = null;
}

function throwPotion() {
    mc.getNetHandler().addToSendQueue(new C08PacketPlayerBlockPlacement(shouldThrow));
    mc.getNetHandler().addToSendQueue(new C09PacketHeldItemChange(mc.thePlayer.inventory.currentItem));
    shouldThrow = null; throwTimer.reset(); timer.reset();
}

function rotateToOpen() {
    Java.from(mc.theWorld.loadedTileEntityList).some(function (chest) {
        if (chest instanceof TileEntityChest && !chestList.includes(chest)) {
            eyes = mc.thePlayer.getPositionEyes(.0);
            if (bb = (state = mc.theWorld.getBlockState(chest.getPos())).getBlock().getCollisionBoundingBox(mc.theWorld, chest.getPos(), state)) {
                distances = []; visible = false;
                [new Vec3(bb.minX, bb.minY, bb.minZ), new Vec3(bb.minX, bb.minY, bb.maxZ), new Vec3(bb.minX, bb.maxY, bb.minZ), new Vec3(bb.minX, bb.maxY, bb.maxZ), new Vec3(bb.maxX, bb.minY, bb.minZ), new Vec3(bb.maxX, bb.minY, bb.maxZ), new Vec3(bb.maxX, bb.maxY, bb.minZ), new Vec3(bb.maxX, bb.maxY, bb.maxZ)].forEach(function (v) {visible = visible || !(result = mc.theWorld.rayTraceBlocks(eyes, v)) || result.getBlockPos().equals(chest.getPos()); distances.push(Math.sqrt(Math.pow(eyes.xCoord - v.xCoord, 2) + Math.pow(eyes.yCoord - v.yCoord, 2) + Math.pow(eyes.zCoord - v.zCoord, 2)))});
                if (Math.min.apply(null, distances) < (visible ? openrange.get() : openwallsrange.get())) {
                    rotations.get() == "Packet" && RotationUtils.setTargetRotation(rot = RotationUtils.faceBlock(chest.getPos()).getRotation(), rotationslength.get() - 1);
                    rotations.get() == "Visual" && (mc.thePlayer.rotationYaw = rot.getYaw(), mc.thePlayer.rotationPitch = rot.getPitch());
                    return lastChest = shouldOpen = chest;
                }
            }
        }
    });
}

function rotateToThrow() {
    if (mc.thePlayer.onGround && actions.get().contains("Throw Potions") && throwTimer.hasTimePassed(throwdelay.get()))
        for (i = 35; i++ < 44;) {
            if (stacks[i] && stacks[i].getItem() instanceof ItemPotion && ItemPotion.isSplash(stacks[i].getItemDamage()) && !isBad(stacks[i]) && !Java.from(new ItemPotion().getEffects(stacks[i])).some(function (e) {return Java.from(mc.thePlayer.getActivePotionEffects()).some(function (e2) {return e.getEffectName() == e2.getEffectName()}) || (mc.thePlayer.getHealth() > healthtohealat.get() && ["potion.regeneration", "potion.heal"].includes(e.getEffectName()))})) {
                mc.getNetHandler().addToSendQueue(new C09PacketHeldItemChange(i - 36));
                rotations.get() == "Visual" ? (mc.thePlayer.rotationPitch = 90) : RotationUtils.setTargetRotation(new Rotation(mc.thePlayer.rotationYaw, 90), rotationslength.get() - 1);
                return shouldThrow = stacks[i];
            }
        }
}

function selectWeapon() {
    if (!ScaffoldModule.state && !TowerModule.state && actions.get().contains("Select Weapons")) {
        for (i = bestSword = bestTool = -1; ++i < 9;) (stack = mc.thePlayer.inventory.mainInventory[i]) && (item = stack.getItem()) && (item instanceof ItemSword ? (!~bestSword || getAttackDamage(stack) > getAttackDamage(mc.thePlayer.inventory.mainInventory[bestSword])) && (bestSword = i) : !~bestSword && item instanceof ItemTool && (!~bestTool || getAttackDamage(stack) > getAttackDamage(mc.thePlayer.inventory.mainInventory[bestTool])) && (bestTool = i));

        (~(targetSlot = ~bestSword ? bestSword : bestTool) && mc.thePlayer.inventory.currentItem != targetSlot) && (mc.thePlayer.inventory.currentItem = targetSlot, mc.playerController.updateController());
    }
}

function shouldOperate() {
    if (mc.thePlayer.isSpectator() || mc.thePlayer.itemInUseCount || !attackTimer.hasTimePassed(noattackdelay.get()) || !mc.thePlayer.capabilities.allowEdit || mc.thePlayer.capabilities.allowFlying || mc.thePlayer.capabilities.disableDamage || (mc.thePlayer.getTeam() && ((mc.theWorld.getScoreboard().getTeams().size() == 1 && !mc.thePlayer.getTeam().getAllowFriendlyFire()) || (mc.thePlayer.getTeam().getTeamName() == "1y|1")))) return false
    if (experimental.get()) for (i in mc.theWorld.loadedEntityList) if (((e = mc.theWorld.loadedEntityList[i]) instanceof IBossDisplayData || e instanceof EntityArmorStand) && (tag = e.getCustomNameTag()) && !tag.contains(":") && !tag.contains("Vazio!")) {/*chat.print(mc.theWorld.loadedEntityList[i].getCustomNameTag());*/ return false};
    return true
}

function toggle(module) {
    actionsArray = actions.get().split(", ");

    if (module) {
        module.toggle();
        module.state ? actionsArray.push(module.name) : actionsArray.remove(module.name);
    }

    actionsArray = actionsArray.filter(Boolean).sort(function (a, b) ACTIONS.indexOf(a) - ACTIONS.indexOf(b));
    actions.set(actionsArray.join(", "));

    visible = [experimental];
    actionsArray.forEach(function (a) {
        switch (a) {
            case "Open Chests": visible.push(openinterval, openrange, openwallsrange, openswing, rotations, rotations.get() == "Packet" ? rotationslength : null); break;
            case "Steal Items": visible.push(maxstealdelay, minstealdelay, startdelay, closedelay, randomize, modifylistings, whitelist, blacklist); break
            case "Drop Garbage": case "Equip Armor": visible.push(maxinvdelay, mininvdelay, noattackdelay, randomize, invopen, modifylistings, whitelist, blacklist); break
            case "Sort Hotbar": visible.push(maxinvdelay, mininvdelay, noattackdelay, randomize, invopen, slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9); break
            case "Throw Potions": visible.push(rotations, rotations.get() == "Packet" ? rotationslength : null, healthtohealat, throwdelay);
        }
    });

    setValues(InventoryManagerModule, visible.filter(Boolean).sort(function (a, b) list.indexOf(a) - list.indexOf(b)).filter(function (item, pos, ary) !pos || item != ary[pos - 1]));
}

function openInv() (!openInventory && sendPacket(new C16PacketClientStatus(C16PacketClientStatus.EnumState.OPEN_INVENTORY_ACHIEVEMENT)), !timer.reset());

function isBad(stack) Java.from(new ItemPotion().getEffects(stack)).some(function (e) ["potion.poison", "potion.harm", "potion.moveSlowdown", "potion.weakness"].includes(e.getEffectName()));

function checkListed(type, item) type.get().length && type.get().replaceAll(" ", "").replaceAll(";", ",").split(",").find(function (entry) Blocks[entry] ? item instanceof ItemBlock && item.getBlock() == Blocks[entry] : item == Items[entry]);

function printLB () ClientUtils.displayChatMessage("§8[§9§l" + LiquidBounce.CLIENT_NAME + "§8] §3" + Array.prototype.slice.call(arguments).join(" "));

function findToSort(armor) {
    blackList = []; all = [];
    sortValues = [slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9].map(function (e) e.get().replaceAll(";", ",").replaceAll(", ", ",").split(","));
    sortTargets = sortValues.map(function (e, i) [e, i]).sort(function (a, b) a[0].length - b[0].length);
    (armor ? [0, 1, 2, 3] : sortTargets).forEach(function (data) {
        if (armor) {
            if (!stacks[data + 5] && (suitable = sortArray(stacks.filter(function (s) s && (item = s.getItem()) && item instanceof ItemArmor && item.armorType == data)))) return all.push(suitable[0]);
        } else {
            targets = data[0]; slot = data[1];
            targets.some(function (target, priority) {
                if (suitable = sortArray(stacks.filter(function (s) s && !blackList.includes(s) && (item = s.getItem()) && checkUseful(item) && (target == "Food" ? item instanceof ItemFood : (target == "Block" || target == "Blocks") ? item instanceof ItemBlock : s.getDisplayName().contains(target))))) {
                    if (suitable[0] == stacks[slot + 36]) return true;
                    if ((suitable = suitable.filter(function (e) {
                        if ((index = stacks.indexOf(e)) > 35) {
                            result = getPriority(sortValues[index - 36], e);
                            result2 = getPriority(targets, stacks[slot + 36]);
                            return (!~result || (priority <= result)) && (!~result2 || priority <= result2);
                        } else {
                            result = getPriority(targets, stacks[slot + 36]);
                            return !~result || priority <= result;
                        }
                    })).length) {
                        if (suitable[0] != stacks[slot + 36]) all.push([suitable[0], slot]), blackList.push(suitable[0]);
                        return true;
                    }
                }
            });
        }
    });
    return all;
}

function sortArray(array) {
    if (array.length) {
        array.reverse().sort(function (b, a) a.stackSize - b.stackSize).sort(function (b, a) getDurability(a) - getDurability(b)).sort(function (b, a) ItemUtils.getEnchantmentCount(a) - ItemUtils.getEnchantmentCount(b));

        if (array[0] instanceof ItemArmor) array.sort(function (b, a) ARMOR_COMPARATOR.compare(new ArmorPiece(a, a), new ArmorPiece(b, b)));
        else if (array[0] instanceof ItemTool) {
            blockType = array[0] instanceof ItemAxe ? Blocks.log : array[0] instanceof ItemPickaxe ? Blocks.stone : Blocks.dirt;
            array.sort(function (a, b) a.getItem().getStrVsBlock(a, blockType) / getDurability(a) - b.getItem().getStrVsBlock(b, blockType) / getDurability(b));
        } else if (array[0] instanceof ItemSword) array.sort(function (b, a) getAttackDamage(a) - getAttackDamage(b));
        else if (array[0] instanceof ItemBow) array.sort(function (b, a) ItemUtils.getEnchantment(a, Enchantment.power) - ItemUtils.getEnchantment(b, Enchantment.power));
    
        return array;
    }
}

function checkUseful(item) !checkListed(blacklist, item) && (checkListed(whitelist, item) || (item instanceof ItemBlock ? !BLOCK_BLACKLIST.includes(item.getBlock()) : item instanceof ItemArmor || item instanceof ItemTool || item instanceof ItemSword || item instanceof ItemBow || item instanceof ItemFood || item instanceof ItemPotion || item instanceof ItemEnderPearl || item instanceof ItemEnchantedBook || item instanceof ItemBucket || ITEM_WHITELIST.includes(item)));

Enchantment = Java.type("net.minecraft.enchantment.Enchantment");
ClickGui = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.ClickGui");
TileEntityChest = Java.type("net.minecraft.tileentity.TileEntityChest");
Panel = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.Panel");
ModuleElement = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.elements.ModuleElement");
Notification = Java.type("net.ccbluex.liquidbounce.ui.client.hud.element.elements.Notification");
Module = Java.type("net.ccbluex.liquidbounce.features.module.Module");
Color = Java.type("java.awt.Color");
var timer = new MSTimer(), openTimer = new MSTimer(), attackTimer = new MSTimer(), closeTimer = new MSTimer(), throwTimer = new MSTimer(), ARMOR_COMPARATOR = new ArmorComparator(), received = openInventory = updated = rotated = false, shouldOpen, chestList = [], ghostItems = [], closeTimer, toOpen, prevMode = rotations.get(), shouldThrow, lastChest, bindingModule, stateField = getField(Module, "state");

BLOCK_BLACKLIST = [Blocks.enchanting_table, Blocks.chest, Blocks.ender_chest, Blocks.trapped_chest, Blocks.anvil, Blocks.sand, Blocks.web, Blocks.torch, Blocks.crafting_table, Blocks.furnace, Blocks.waterlily, Blocks.dispenser, Blocks.stone_pressure_plate, Blocks.wooden_pressure_plate, Blocks.noteblock, Blocks.dropper, Blocks.tnt, Blocks.standing_banner, Blocks.wall_banner, Blocks.redstone_torch, Blocks.deadbush];
ITEM_WHITELIST = [Items.arrow, Items.stick, Items.compass];