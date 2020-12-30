///api_version=2
(script = registerScript({
    name: "BlockAnimations",
    version: "1.0",
    authors: ["CzechHek"]
})).import("Core.lib");

list = [
    posX = value.createFloat("posX", 0, -2, 2),
    posY = value.createFloat("posY", 0.5, -2, 2),
    posZ = value.createFloat("posZ", 0.3, -2, 2),
    rotX = value.createFloat("rotX", 30, -180, 180),
    rotY = value.createFloat("rotY", -80, -180, 180),
    rotZ = value.createFloat("rotZ", 60, -180, 180),
    deviation = value.createFloat("deviation", 75, -500, 500),
    deviateXPos = value.createBoolean("deviateXPos", false),
    deviateYPos = value.createBoolean("deviateYPos", false),
    deviateZPos = value.createBoolean("deviateZPos", false),
    deviateXRot = value.createBoolean("deviateXRot", false),
    deviateYRot = value.createBoolean("deviateYRot", true),
    deviateZRot = value.createBoolean("deviateZRot", false),
    swingDuration = value.createFloat("swingDuration", 500, 0, 2000),
    equipAnimation = value.createBoolean("equipAnimation", false),
    fake = value.createBoolean("fake", false),
    reset = new (Java.extend(BoolValue))("resetValues", false) {onChanged: function () {posX.set(0); posY.set(0.5); posZ.set(0.3); rotX.set(30); rotY.set(-80); rotZ.set(60); deviation.set(75); deviateXPos.set(false); deviateYPos.set(false); deviateZPos.set(false); deviateXRot.set(false); deviateYRot.set(true); deviateZRot.set(false); swingDuration.set(500); equipAnimation.set(false); fake.set(false); reset.set(false)}}
]

module = {
    category: "Render",
    values: list,
    onAttack: function () {
        progress >= 1 && timer.reset();
    },
    onEnable: function () {
        mc.entityRenderer.itemRenderer = new (Java.extend(ItemRenderer))(mc) {
            doBlockTransformations: function () {
                progress = Math.abs(timer.hasTimeLeft(swingDuration.get()) / swingDuration.get() - 1);
                offset2 = (offset = (-Math.pow(progress < 1 ? progress - 0.5 : 0.5, 2) + 0.25) * deviation.get()) / 100;
                GlStateManager.translate(posX.get() + (deviateXPos.get() ? offset2 : 0), posY.get() + (deviateYPos.get() ? offset2 : 0), posZ.get() + (deviateZPos.get() ? -offset2 : 0));
                GlStateManager.rotate(rotX.get() + (deviateXRot.get() ? offset : 0), 0.0, 1.0, 0.0);
                GlStateManager.rotate(rotY.get() + (deviateYRot.get() ? offset : 0), 1.0, 0.0, 0.0);
                GlStateManager.rotate(rotZ.get() + (deviateZRot.get() ? offset : 0), 0.0, 1.0, 0.0);
            },
            func_78440_a: function (partialTicks) {
                prevEquippedProgress = prevEquippedProgressField.get(mc.entityRenderer.itemRenderer);
                equippedProgress = equippedProgressField.get(mc.entityRenderer.itemRenderer);
                itemToRender = itemToRenderField.get(mc.entityRenderer.itemRenderer);
                equipProgress = new Float(1 - (prevEquippedProgress + (equippedProgress - prevEquippedProgress) * partialTicks));
                swingProgress = mc.thePlayer.getSwingProgress(partialTicks);
                partialTicks = new Float(partialTicks);
                pitch = new Float(mc.thePlayer.prevRotationPitch + (mc.thePlayer.rotationPitch - mc.thePlayer.prevRotationPitch) * partialTicks);
                yaw = new Float(mc.thePlayer.prevRotationYaw + (mc.thePlayer.rotationYaw - mc.thePlayer.prevRotationYaw) * partialTicks);

                rotateArroundXAndYMethod.invoke(mc.entityRenderer.itemRenderer, pitch, yaw);
                setLightMapFromPlayerMethod.invoke(mc.entityRenderer.itemRenderer, mc.thePlayer);
                rotateWithPlayerRotationsMethod.invoke(mc.entityRenderer.itemRenderer, mc.thePlayer, partialTicks);

                GlStateManager.enableRescaleNormal();
                GlStateManager.pushMatrix();

                if (itemToRender != null) {
                    if (itemToRender.getItem() == Items.filled_map) renderItemMapMethod.invoke(mc.entityRenderer.itemRenderer, mc.thePlayer, pitch, equipProgress, swingProgress);
                    else if (mc.thePlayer.itemInUseCount > 0 || KillAuraModule.blockingStatus || (KillAuraModule.target && fake.get())) {
                        switch (itemToRender.getItemUseAction()) {
                            case EnumAction.NONE:
                                transformFirstPersonItemMethod.invoke(mc.entityRenderer.itemRenderer, equipProgress, new Float(0));
                                break
                            case EnumAction.EAT:
                            case EnumAction.DRINK:
                                performDrinkingMethod.invoke(mc.entityRenderer.itemRenderer, mc.thePlayer, partialTicks);
                                transformFirstPersonItemMethod.invoke(mc.entityRenderer.itemRenderer, equipProgress, new Float(0));
                                break
                            case EnumAction.BLOCK:
                                    transformFirstPersonItemMethod.invoke(mc.entityRenderer.itemRenderer, equipAnimation.get() ? equipProgress : new Float(0), new Float(0));
                                    this.doBlockTransformations();
                                break
                            case EnumAction.BOW:
                                transformFirstPersonItemMethod.invoke(mc.entityRenderer.itemRenderer, equipProgress, new Float(0));
                                doBowTransformationsMethod.invoke(mc.entityRenderer.itemRenderer, partialTicks, mc.thePlayer);
                        }
                    } else {
                        doItemUsedTransformationsMethod.invoke(mc.entityRenderer.itemRenderer, swingProgress);
                        transformFirstPersonItemMethod.invoke(mc.entityRenderer.itemRenderer, equipProgress, swingProgress);
                    }
                    renderItemMethod.invoke(mc.entityRenderer.itemRenderer, mc.thePlayer, itemToRender, ItemCameraTransforms.TransformType.FIRST_PERSON);
                } else if (!mc.thePlayer.isInvisible()) renderPlayerArmMethod.invoke(mc.entityRenderer.itemRenderer, mc.thePlayer, equipProgress, swingProgress);

                GlStateManager.popMatrix();
                GlStateManager.disableRescaleNormal();
                RenderHelper.disableStandardItemLighting();
            }
        };
    },
    onDisable: function () {
        mc.entityRenderer.itemRenderer = new ItemRenderer(mc);
    }
}

Float = Java.type("java.lang.Float"); timer = new MSTimer(); progress = 1;

prevEquippedProgressField = getField(ItemRenderer, "field_78451_d");
equippedProgressField = getField(ItemRenderer, "field_78454_c");
itemToRenderField = getField(ItemRenderer, "field_78453_b");

rotateArroundXAndYMethod = getMethod(ItemRenderer, "func_178101_a");
setLightMapFromPlayerMethod = getMethod(ItemRenderer, "func_178109_a");
rotateWithPlayerRotationsMethod = getMethod(ItemRenderer, "func_178110_a");
renderItemMapMethod = getMethod(ItemRenderer, "func_178097_a");
transformFirstPersonItemMethod = getMethod(ItemRenderer, "func_178096_b");
performDrinkingMethod = getMethod(ItemRenderer, "func_178104_a");
//doBlockTransformationsMethod = getMethod(ItemRenderer, "func_178103_d");
doBowTransformationsMethod = getMethod(ItemRenderer, "func_178098_a");
doItemUsedTransformationsMethod = getMethod(ItemRenderer, "func_178105_d");
renderItemMethod = getMethod(ItemRenderer, "func_178099_a");
renderPlayerArmMethod = getMethod(ItemRenderer, "func_178095_a");