///api_version=2
(script = registerScript({
    name: "BlinkFall",
    authors: ["CzechHek"],
    version: "5.2"
})).import("Core.lib");

module = {
    category: "Movement",
    values: [
        maxfalltime = value.createInteger("MaxFallTime", 1000, 0, 10000),
        nofall = value.createBoolean("NoFall", false),
        simulatedfall = value.createBoolean("SimulatedFall", true),
        simulatedtimer = value.createFloat("SimulatedTimer", 2, 1, 10),
        fakeplayer = value.createBoolean("FakePlayer", true),
        line = value.createBoolean("Line", true)
    ],
    onPacket: function (e) {
        if (mc.thePlayer && catchPackets) {
            if (e.getPacket() instanceof C03PacketPlayer) {
                p = e.getPacket(); e.cancelEvent();
                !isSending && p.isMoving() && (nofall.get() && (p.onGround = mc.thePlayer.fallDistance > 3) && (mc.thePlayer.fallDistance = 0), packets.put(timer.getTimePassed() / simulatedtimer.get(), p));
            }
        }
    },
    onMove: function (e) {
        BlinkFallModule.tag = packets.size();
        if (!catchPackets) {
            if (canStand()) {
                startPos = mc.thePlayer.getEntityBoundingBox();
                if (catchPackets = !isSafe(e)) {
                    timer.reset();
                    if (fakeplayer.get()) {
                        fakePlayer = new EntityOtherPlayerMP(mc.theWorld, mc.thePlayer.getGameProfile());
                        fakePlayer.clonePlayer(mc.thePlayer, true);
                        fakePlayer.copyLocationAndAnglesFrom(mc.thePlayer);
                        fakePlayer.rotationYawHead = mc.thePlayer.rotationYawHead;
                        mc.theWorld.addEntityToWorld(-1, fakePlayer);
                    }
                }
            }
        } else {
            if (fakeplayer.get()) KillAuraModule.target = null;
            if (!isSending && !isSafe(e)) {
                if (!wasInAir) wasInAir = !mc.thePlayer.onGround;
                else if (timer.hasTimePassed(maxfalltime.get())) {
                    mc.thePlayer.setPositionAndUpdate(startPos.minX + 0.3, startPos.minY, startPos.minZ + 0.3);
                    e.zero(); mc.thePlayer.motionX = mc.thePlayer.motionY = mc.thePlayer.motionZ = 0;
                    end();
                }
            } else if (mc.thePlayer.onGround || isSafe(e)) {
                if (!isSending) {
                    isSending = true;
                    timer.reset();
                    lastKey = tailField.get(packets).getKey();
                    packets.forEach(function (delay, packet) {
                        timeout(simulatedfall.get() ? delay : 0, function () {
                            sendPacket(packet);
                            fakeplayer.get() && (packet.getRotating() ? fakePlayer.setPositionAndRotation(packet.x, packet.y, packet.z, packet.yaw, packet.pitch) : fakePlayer.setPosition(packet.x, packet.y, packet.z));
                            if (delay == lastKey) end();
                        });
                    });
                } else if (timer.hasTimePassed(lastKey * 2)) end();
                e.zeroXZ(); e.setY(-1e-14);
            }
        }
    },
    onRender3D: function () {
        if (line.get() && catchPackets) {
            color = BreadcrumbsModule.colorRainbow.get() ? ColorUtils.rainbow() : new Color(BreadcrumbsModule.colorRedValue.get(), BreadcrumbsModule.colorGreenValue.get(), BreadcrumbsModule.colorBlueValue.get());

            GL11.glPushMatrix();
    
            GL11.glDisable(GL11.GL_TEXTURE_2D);
            GL11.glBlendFunc(GL11.GL_SRC_ALPHA, GL11.GL_ONE_MINUS_SRC_ALPHA);
            GL11.glEnable(GL11.GL_LINE_SMOOTH);
            GL11.glEnable(GL11.GL_BLEND);
            GL11.glDisable(GL11.GL_DEPTH_TEST);
            mc.entityRenderer.disableLightmap();
            GL11.glBegin(GL11.GL_LINE_STRIP);
            RenderUtils.glColor(color);
            renderPosX = mc.getRenderManager().viewerPosX;
            renderPosY = mc.getRenderManager().viewerPosY;
            renderPosZ = mc.getRenderManager().viewerPosZ;
    
            packets.forEach(function (delay, packet) GL11.glVertex3d(packet.x - renderPosX, packet.y - renderPosY, packet.z - renderPosZ));
    
            GL11.glColor4d(1, 1, 1, 1);
            GL11.glEnd();
            GL11.glEnable(GL11.GL_DEPTH_TEST);
            GL11.glDisable(GL11.GL_LINE_SMOOTH);
            GL11.glDisable(GL11.GL_BLEND);
            GL11.glEnable(GL11.GL_TEXTURE_2D);
            GL11.glPopMatrix();
        }
    },
    onDisable: function () {
        end();
    }
}

function isSafe(e) {
    if (mc.thePlayer.isSpectator() || !mc.thePlayer.capabilities.allowEdit || mc.thePlayer.capabilities.allowFlying || mc.thePlayer.capabilities.disableDamage || FlyModule.state || ScaffoldModule.state || TowerModule.state || !canStand(startPos) || mc.thePlayer.isOnLadder() || mc.thePlayer.isInWater() || mc.thePlayer.isInWeb) return true;
    if (!catchPackets || mc.thePlayer.onGround) {
        if (mc.thePlayer.onGround && (wasInAir || mc.thePlayer.isSneaking() || !isMovingHorizontally())) return true;

        yaw = MovementUtils.getDirection();
        speed = MovementUtils.getSpeed();

        if (!mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(-Math.sin(yaw) * speed, -2, Math.cos(yaw) * speed).expand(0, 2, 0)).isEmpty()) return true;
        blockPos = new BlockPos(mc.thePlayer.posX - Math.sin(yaw) * speed, mc.thePlayer.posY + 2, mc.thePlayer.posZ + Math.cos(yaw) * speed);
        for (i = -1; i++ < 6;) if (!mc.theWorld.isAirBlock(blockPos.down(i))) return true;
    }
}

function ATimer() {
    this.time = System.currentTimeMillis();
    this.hasTimePassed = function (ms) System.currentTimeMillis() >= this.time + ms;
    this.getTimePassed = function () System.currentTimeMillis() - this.time;
    this.reset = function () this.time = System.currentTimeMillis();
}

function end() {
    catchPackets = isSending = wasInAir = false;
    fakeplayer.get() && fakePlayer && mc.theWorld.removeEntity(fakePlayer);
    packets.clear();
}

function canStand(bb) {
    bb = bb || mc.thePlayer.getEntityBoundingBox();
    minX = Math.floor(bb.minX);
    maxX = Math.floor(bb.maxX + 1);
    minZ = Math.floor(bb.minZ);
    maxZ = Math.floor(bb.maxZ + 1);

    if (!mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, bb).isEmpty()) return false;

    for (x = minX; x < maxX; ++x) {
        for (z = minZ; z < maxZ; ++z){
            if (!mc.theWorld.isAirBlock(bp = new BlockPos(x, bb.minY - 1e-14, z))) return true
        }
    }
}

System = Java.type("java.lang.System");
EntityOtherPlayerMP = Java.type("net.minecraft.client.entity.EntityOtherPlayerMP");
Color = Java.type("java.awt.Color");
GL11 = Java.type("org.lwjgl.opengl.GL11");
tailField = getField(LinkedHashMap, "tail");

var packets = new LinkedHashMap(), catchPackets, lastPos = [], timer = new ATimer(), isSending, wasInAir, fakePlayer;