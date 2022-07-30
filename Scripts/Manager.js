///api_version=2
(script = registerScript({
    name: "Manager",
    authors: ["CzechHek"],
    version: "3.2"
})).import("Core.lib");

fileManager = LiquidBounce.fileManager;
themeDir = new File(fileManager.dir, "themes");
Fonts = Java.type("net.ccbluex.liquidbounce.ui.font.Fonts");

command = {
    aliases: ["manager", "mngr", "m"],
    handler: {
        config: {
            list: {
                online: function () {
                    try {
                        var configs = JSON.parse(HttpUtils.get("https://api.github.com/repos/CCBlueX/LiquidCloud/contents/LiquidBounce/settings")).map(function (config) config.name);

                        print("§8▏ §7§lAvailable configs§8: (§7§l" + configs.length + "§8)");
                        print("§8▏ §f" + configs.join("§7, §f"));
                    } catch (e) {
                        print("§4▏ §c§lFailed§c to fetch online configs §8(§7" + e.toString().split(":")[0] + "§8)");
                    }

                },
                local: function () {
                    var configs = Java.from(fileManager.settingsDir.listFiles()).map(function (file) file.name);

                    print("§8▏ §7§lAvailable configs§8: (§7§l" + configs.length + "§8)");
                    print("§8▏ §f" + configs.join("§7, §f"));
                }
            },
            download: function (name_or_URL, name_to_save_with) {
                try {
                    HttpUtils.download(new URL(name_or_URL.includes("/") ? name_or_URL : "https://raw.githubusercontent.com/CCBlueX/LiquidCloud/master/LiquidBounce/settings/" + name_or_URL.toLowerCase()), new File(fileManager.settingsDir, name_to_save_with));

                    print("§2▏ §a§lDownloaded§a config§2: §a„§2" + name_to_save_with + "§a“");
                } catch (e) {
                    print("§4▏ §c§lFailed§c to download config§4: §c„§4" + name_to_save_with + "§c“ §8(§7" + e.toString().split(":")[0] + "§8)")
                }
            },
            load: function (name) {
                commandManager.executeCommands(".localconfig load " + name);
            },
            save: function (name) {
                commandManager.executeCommands(".localconfig save " + name);
            },
            delete: function (name) {
                var file = new File(fileManager.settingsDir, name);

                if (file.exists()) file.delete(), print("§2▏ §a§lDeleted§a config§2: §a„§2" + name + "§a“");
                else print("§4▏ §cConfig §c„§4" + name + "§c“ §ldoes not exist");
            },
            folder: function () {
                openFolder(fileManager.settingsDir);
                
                print("§2▏ §a§lOpened§a config folder§2. §8(§7" + fileManager.settingsDir + "§8)");
            }
        },
        theme: {
            list: {
                online: function () {
                    try {
                        var themes = JSON.parse(HttpUtils.get("https://api.github.com/repos/CzechHek/Core/contents/Themes")).map(function (config) config.name);

                        print("§8▏ §7§lAvailable online themes§8: (§7§l" + themes.length + "§8)");
                        print("§8▏ §f" + themes.join("§7, §f"));
                    } catch (e) {
                        print("§4▏ §c§lFailed§c to fetch online themes §8(§7" + e.toString().split(":")[0] + "§8)");
                    }
                },
                local: function () {
                    var themes = Java.from(themeDir.listFiles()).map(function (file) file.isDirectory() ? file.name : null).filter(Boolean);

                    print("§8▏ §7§lAvailable local themes§8: (§7§l" + themes.length + "§8)");
                    print("§8▏ §f" + themes.join("§7, §f"));
                }
            },
            download: function (name) {
                var directory = new File(themeDir, name);
                if (directory.exists()) return print("§4▏ §cTheme §c„§4" + name + "§c“ §c§lalready exists");

                print("§6▏ §e§lTrying§e to download theme...");
                downloadDirectory("https://api.github.com/repos/CzechHek/Core/contents/Themes/" + name, directory,
                    function () print("§2▏ §a§lDownloaded§a theme§2: §a„§2" + name + "§a“"),
                    function (e) print("§4▏ §c§lFailed§c to download theme§4: §c„§4" + name + "§c“ §8(§7" + e.toString().split(":")[0] + "§8)")
                );
            },
            save: function (name) {
                name = Array.prototype.slice.call(arguments).join(" ");
                var directory = new File(themeDir, name);
                if (directory.exists()) return print("§4▏ §cTheme §c„§4" + name + "§c“ §c§lalready exists");

                var themeFiles = [], fontFiles = [];

                themeFiles.push(new File("LiquidBounce-1.8/hud.json"));
                Array.prototype.push.apply(fontFiles, JSON.parse(FileUtils.readFileToString(new File(fileManager.fontsDir, "fonts.json"))).map(function (font) new File(fileManager.fontsDir, font.fontFile)));
                fontFiles.push(new File(fileManager.fontsDir, "fonts.json"));

                for each (var file in themeFiles) FileUtils.copyFile(file, new File(directory, file.name));
                for each (var file in fontFiles) FileUtils.copyFile(file, new File(directory, "fonts/" + file.name));

                print("§2▏ §a§lSaved§a theme§2: §a„§2" + name + "§a“ §8(§7" + directory + "§8)");
            },
            load: function (name) {
                name = Array.prototype.slice.call(arguments).join(" ");
                var directory = new File(themeDir, name);
                if (!directory.exists()) return print("§4▏ §cTheme §c„§4" + name + "§c“ §ldoes not exist");

                FileUtils.copyDirectory(directory, fileManager.dir);
                Fonts.loadFonts();

                fileManager.loadConfig(fileManager.hudConfig);

                print("§2▏ §a§lLoaded§a theme§2: §a„§2" + name + "§a“");
            },
            delete: function (name) {
                var file = new File(themeDir, name);
                if (file.exists()) FileUtils.deleteDirectory(file), print("§2▏ §a§lDeleted§a theme§2: §a„§2" + name + "§a“");
                else print("§4▏ §cTheme §c„§4" + name + "§c“ §ldoes not exist");
            },
            folder: function () {
                openFolder(themeDir);

                print("§2▏ §a§lOpened§a theme folder§2. §8(§7" + themeDir + "§8)");
            }
        },
        script: {
            list: {
                online: function () {
                    try {
                        var scripts = JSON.parse(HttpUtils.get("https://api.github.com/repos/CzechHek/Core/contents/Scripts")).map(function (script) script.name.endsWith(".js") ? script.name.slice(0,-3) : null).filter(Boolean);
                    
                        print("§8▏ §7§lAvailable online scripts§8: (§7§l" + scripts.length + "§8)");
                        print("§8▏ §f" + scripts.join("§7, §f"));
                    } catch (e) {
                        print("§4▏ §c§lFailed§c to fetch online scripts §8(§7" + e.toString().split(":")[0] + "§8)");
                    }
                },
                local: function () {
                    var scripts = Java.from(scriptManager.scripts).map(function (script) script.scriptName);

                    print("§8▏ §7§lAvailable local scripts§8: (§7§l" + scripts.length + "§8)");
                    print("§8▏ §f" + scripts.join("§7, §f"));
                }
            },
            download: function (name_or_URL, name_to_save_with) {
                try {
                    name_to_save_with = name_to_save_with.endsWith(".js") ? name_to_save_with : name_to_save_with + ".js";
                    var file = new File(scriptManager.scriptsFolder, name_to_save_with);
                    HttpUtils.download(new URL(name_or_URL.includes("/") ? name_or_URL : "https://raw.githubusercontent.com/CzechHek/Core/master/Scripts/" + name_or_URL + ".js"), file);

                    scriptManager.loadScript(file);
                    Core.hookClickGui();
                    print("§2▏ §a§lDownloaded§a script§2: §a„§2" + name_to_save_with + "§a“");
                } catch (e) {
                    print("§4▏ §c§lFailed§c to download script§4: §c„§4" + name + "§c“ §8(§7" + e.toString().split(":")[0] + "§8)")
                }
            },
            delete: function (name) {
                name = name.endsWith(".js") ? name.slice(0, -3) : name;
                var script = Java.from(scriptManager.scripts).find(function (script) script.scriptName.equalsIgnoreCase(name));

                if (script) {
                    scriptManager.deleteScript(script);
                    Core.hookClickGui();
                    print("§2▏ §a§lDeleted§a script§2: §a„§2" + name + "§a“");
                } else print("§4▏ §cScript §c„§4" + name + "§c“ §ldoes not exist");
            },
            folder: function () {
                openFolder(scriptManager.scriptsFolder);
                print("§2▏ §a§lOpened§a script folder§2. §8(§7" + scriptManager.scriptsFolder + "§8)");
            },
            reload: function () {
                scriptManager.reloadScripts();
            }
        }
    }
}