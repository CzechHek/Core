///api_version=2
(script = registerScript({
    name: "BridgeAssist",
    authors: ["CzechHek"],
    version: "1.4"
})).import("Core.lib");

module = {
    category: "World",
    description: "Assists you in bridging in a semi-legit way.",
    values: [
        safewalk = value.createBoolean("SafeWalk", true),
        sprint = value.createBoolean("Sprint", false),
        selectblock = value.createBoolean("SelectBlock", true),
        sneakonplace = value.createBoolean("SneakOnPlace", true),
        autoplace = value.createBoolean("AutoPlace", true),
        delay = value.createInteger("Delay", 0, 0, 1000),
        pitch = new (Java.extend(FloatValue)) ("Pitch", 79.5, 75, 85) {
            onChanged: function () {
                BridgeAssistModule.state && updatePitch();
            }
        },
        speedpercentage = value.createInteger("Speed%", 75, 1, 100),
        jumppercentage = value.createInteger("Jump%", 50, 1, 100),
        timer = value.createFloat("Timer", 1, 0.1, 1),
        togglemodules = new (Java.extend(TextValue)) ("ToggleModules", "KillAura, InventoryManager") {
            onChanged: function () {
                updateModules();
            }
        }
    ],
    onClickGuiLoaded: function () {
        updateModules();
    },
    onEnable: function () {
        updatePitch();
        for each (module in modulesList) {
            modulesStates.push(module.state);
            module.state = false;
        }

        forwardCode = forwardKeyBinding.getKeyCode();
        leftCode = leftKeyBinding.getKeyCode();
        backCode = backKeyBinding.getKeyCode();
        rightCode = rightKeyBinding.getKeyCode();

        if (forwardKeyBinding.pressed) {
            forwardKeyBinding.pressed = false;
            leftKeyBinding.pressed = false;
            backKeyBinding.pressed = true;
            rightKeyBinding.pressed = true;
        }

        forwardKeyBinding.setKeyCode(backCode);
        backKeyBinding.setKeyCode(forwardCode);
        rightKeyBinding.setKeyCode(forwardCode);

        switch (mc.thePlayer.getHorizontalFacing()) {
            case EnumFacing.NORTH: startYaw = 180 + rand(0.001, 0.01); break
            case EnumFacing.EAST: startYaw = -90 + rand(0.001, 0.01); break
            case EnumFacing.SOUTH: startYaw = 0 + rand(0.001, 0.01); break
            case EnumFacing.WEST: startYaw = 90 + rand(0.001, 0.01); break
        }

        mc.thePlayer.rotationYaw = startYaw - 135;

        direction = "right";
    },
    onPacket: function (e) {
        if (sneakonplace.get() && e.getPacket() instanceof C08PacketPlayerBlockPlacement && e.getPacket().getPlacedBlockDirection() != 255) {
            e.cancelEvent();
            sendPacket(new C0BPacketEntityAction(mc.thePlayer, C0BPacketEntityAction.Action.START_SNEAKING));
            sendPacket(e.getPacket());
            sendPacket(new C0BPacketEntityAction(mc.thePlayer, C0BPacketEntityAction.Action.STOP_SNEAKING));
        }
    },
    onMove: function (e) {
        mc.gameSettings.keyBindUseItem.pressed = autoplace.get();
        e.setSafeWalk(safewalk.get());

        mc.thePlayer.rotationPitch = targetPitch;

        mc.thePlayer.setSprinting(sprint.get());
        
        if (selectblock.get()) {
            slot = InventoryUtils.findAutoBlockBlock();
            if (~slot && (mc.thePlayer.inventory.currentItem != slot - 36)) {
                mc.thePlayer.inventory.currentItem = slot - 36;
                mc.playerController.updateController();
            }
        }

        if (delaytimer.hasTimePassed(delay.get())) {
            mc.rightClickDelayTimer = 0;
            delaytimer.reset();
        } else mc.rightClickDelayTimer = 20;

        e.setX(e.getX() * (mc.thePlayer.movementInput.jump ? jumppercentage : speedpercentage).get() / 100);
        e.setZ(e.getZ() * (mc.thePlayer.movementInput.jump ? jumppercentage : speedpercentage).get() / 100);
        mc.timer.timerSpeed = timer.get();

        if (direction == "right") {
            if (Keyboard.isKeyDown(rightCode) && !Keyboard.isKeyDown(leftCode)) {
                direction = "left";
                mc.thePlayer.rotationYaw = startYaw - 225;
                rightKeyBinding.setKeyCode(rightCode);
                leftKeyBinding.setKeyCode(forwardCode);
                rightKeyBinding.pressed = true;
                leftKeyBinding.pressed = true;
            }
        } else {
            if (Keyboard.isKeyDown(leftCode) && !Keyboard.isKeyDown(rightCode)) {
                direction = "right";
                mc.thePlayer.rotationYaw = startYaw - 135;
                leftKeyBinding.setKeyCode(leftCode);
                rightKeyBinding.setKeyCode(forwardCode);
                leftKeyBinding.pressed = true;
                rightKeyBinding.pressed = true;
            }
        }
    },
    onDisable: function () {
        mc.timer.timerSpeed = 1;
        mc.thePlayer.rotationPitch = 0;
        modulesList.forEach(function (module, i) module.state = modulesStates[i]);
        modulesStates = [];

        forwardKeyBinding.setKeyCode(forwardCode);
        leftKeyBinding.setKeyCode(leftCode);
        backKeyBinding.setKeyCode(backCode);
        rightKeyBinding.setKeyCode(rightCode);

        forwardKeyBinding.pressed = Keyboard.isKeyDown(forwardCode);
        leftKeyBinding.pressed = Keyboard.isKeyDown(leftCode);
        backKeyBinding.pressed = Keyboard.isKeyDown(backCode);
        rightKeyBinding.pressed = Keyboard.isKeyDown(rightCode);
        mc.gameSettings.keyBindUseItem.pressed = false;

        mc.thePlayer.rotationYaw = startYaw;
    }
}

var delaytimer = new MSTimer(), modulesStates = [], modulesList = [], targetPitch;

var forwardKeyBinding = mc.gameSettings.keyBindForward,
    leftKeyBinding = mc.gameSettings.keyBindLeft,
    backKeyBinding = mc.gameSettings.keyBindBack,
    rightKeyBinding = mc.gameSettings.keyBindRight,
    forwardCode, leftCode, backCode, rightCode;

function updatePitch() targetPitch = pitch.get() + rand(0.001, 0.01);

function updateModules() modulesList = togglemodules.get().replaceAll(" ", "").split(",").map(function (name) moduleManager.getModule(name)).filter(Boolean);