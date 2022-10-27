///api_version=2
(script = registerScript({
    name: "Incognito",
    authors: ["CzechHek"],
    version: "1.0"
})).import("Core.lib");

module = {
    category: "Misc",
    description: "Changes your nickname after starting LB or getting kicked. Handles logins.",
    values: [
        handlesessions = value.createBoolean("HandleSessions", true, 
            value.createButton("Change Now", function () {
                changeSession();
                mc.theWorld.sendQuittingDisconnectingPacket();
                mc.loadWorld(null);

                if (mc.isIntegratedServerRunning()) mc.displayGuiScreen(new GuiMainMenu());
                else ServerUtils.connectToLastServer();
            }),
            maxlength = value.createInteger("MaxLength", 16, 6, 16),
            afterstartup = value.createBoolean("AfterStartup", true),
            afterkick = value.createBoolean("AfterKick", true,
                reconnect = value.createBoolean("Reconnect", true)
            ),
            value.createSpacer()
        ),
        handlelogins = value.createBoolean("HandleLogins", true,
            password = value.createText("Password", "incognito")
        )
    ],
    onPacket: function (e) {
        var p = e.getPacket();
        if (p instanceof S40PacketDisconnect && handlesessions.get() && afterkick.get()) {
            wasKicked = true;
            //Cannot put onScreen part here, because ServerUtils requires OpenGL context in current thread.
        } else if ((p instanceof S02PacketChat || p instanceof S45PacketTitle) && handlelogins.get()) {
            var component = p[p instanceof S02PacketChat ? "getChatComponent" : "getMessage"]();
            if (!component) return

            var msg = component.getUnformattedText();
            if (msg.contains("email")) return

            if (msg.contains("/reg")) sendPacket(new C01PacketChatMessage("/register " + password.get() + " " + password.get())), print("Automatically registered");
            else if (msg.contains("/log")) sendPacket(new C01PacketChatMessage("/login " + password.get())), print("Automatically logged in");
            e.cancelEvent();
        }
    },
    onScreen: function (e) {
        if (wasKicked && e.getGuiScreen() instanceof GuiDisconnected) {
            wasKicked = false;
            changeSession();
            reconnect.get() && ServerUtils.connectToLastServer();
        }
    },
    onClickGuiLoaded: function () {
        //Checks if LB is actually starting up in order to prevent your name from getting changed after every reload.
        //By doing this when ClickGui gets loaded guarantees that module values were loaded before.
        !LiquidBounce.hud && afterstartup.get() && changeSession();
    }
}

function getRandom(arr, limit) {
    var text = arr.filter(function (str) str.length <= limit).random();
    return text[0].toUpperCase() + text.slice(1);
}

function changeSession() {
    var adjective, animal;
    //For all combinations to be equally probable, it is randomised whether adjective or animal is chosen first.
    if (Math.random() < 0.5) {
        adjective = getRandom(ADJECTIVES, maxlength.get() - 3);
        animal = getRandom(ANIMALS, maxlength.get() - adjective.length);
    } else {
        animal = getRandom(ANIMALS, maxlength.get() - 3);
        adjective = getRandom(ADJECTIVES, maxlength.get() - animal.length);
    }

    mc.session = new Session(adjective + (adjective.length + animal.length < maxlength.get() ? "_" : "") + animal, "", "", "");
    print("Changed name to " + mc.session.getUsername());
}

var wasKicked;
ADJECTIVES = HttpUtils.get("https://raw.githubusercontent.com/ShareX/ShareX/master/ShareX.HelpersLib/Resources/adjectives.txt").split("\n").filter(function (str) str.length <= 13);
ANIMALS = HttpUtils.get("https://raw.githubusercontent.com/ShareX/ShareX/master/ShareX.HelpersLib/Resources/animals.txt").split("\n").filter(function (str) str.length <= 13);