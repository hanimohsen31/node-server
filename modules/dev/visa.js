const axios = require("axios");

function checkVisaTrigger() {
    function hasTarget(html, target) {
        return typeof html === "string" && html.includes(target);
    }

    function isWithinWorkingHours() {
        // const hour = new Date().getHours();
        // return hour >= 8 && hour < 15;
        return true; // disable time check for now
    }

    function checkVisa() {
        const URL = "https://www.eg.emb-japan.go.jp/itpr_en/11_000001_pick.html";
        const TARGET_NUMBER = "75837891";
        let found = false;
        let running = false;
        const check = async () => {
            if (running || found) return;
            if (!isWithinWorkingHours()) {
                console.log("⏱ Outside working hours");
                return;
            }
            running = true;
            try {
                console.log("Checking...", new Date().toLocaleString());
                const { data } = await axios.get(URL, {
                    timeout: 10000, headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                    }
                });
                if (hasTarget(data, TARGET_NUMBER)) {
                    found = true;
                    console.log("🔥 FOUND");
                    notifier.notify({
                        title: "🔥 Visa FOUND",
                        message: `Number ${TARGET_NUMBER} is available`,
                        sound: true,
                    });
                    let count = 0;
                    const elements = [1, 2, 3, 4, 5];
                    const intervalId = setInterval(() => {
                        if (count < elements.length) {
                            sendTelegramMessage("🔥 Visa FOUND");
                            count++;
                        } else {
                            clearInterval(intervalId); // Stop the interval when all elements are processed
                        }
                    }, 5000);
                } else {
                    console.log("Not found");
                }
            } catch (err) {
                console.error("Request failed:", err.message);
            } finally {
                running = false;
            }
        };
        // ✅ run immediately
        check();
        // ✅ safer than setInterval (no overlap)
        const loop = async () => {
            await check();
            setTimeout(loop, 2 * 60 * 60 * 1000); // 3 hours
        };
        setTimeout(loop, 2 * 60 * 60 * 1000);
    }

    checkVisa();
}
