const notifier = require('node-notifier')
const fs = require('fs');
const path = require('path');

function startNotification() {
    let doaa = fs.readFileSync(`${__dirname}/../../public/data/Doaa.json`, "utf-8");
    doaa = JSON.parse(doaa);

    // flatten categories
    doaa = Object.entries(doaa).flatMap(([key, arr]) =>
        arr.map(item => ({ ...item, zikrCategory: key.replace(/_/g, " "), }))
    );

    // to match notifications limit
    doaa = doaa.filter(item => item.zikr && item.zikr.length <= 200);

    const used = new Set();
    function getRandomDoaa() {
        if (used.size === doaa.length) used.clear();
        let i;
        do {
            i = Math.floor(Math.random() * doaa.length);
        } while (used.has(i));
        used.add(i);
        return doaa[i];
    }

    const defaultNotification = {
        title: "Hey Honey!",
        message: "Stand up, drink water, move a bit.",
        wait: false,
        sound: true
    };

    const triggerNotification = (minutes, getNotification) => {
        setInterval(() => {
            let notification = typeof getNotification === "function" ? getNotification() : defaultNotification;
            notifier.notify(notification);
        }, 60 * 1000 * minutes);
    };

    // Water reminder every 60 minutes
    triggerNotification(60);

    // Doaa reminder
    triggerNotification(
        3,
        () => {
            let randomDoaa = getRandomDoaa();
            return {
                title: randomDoaa?.zikrCategory || "Doaa", message: randomDoaa?.zikr,
                wait: true, sound: false,
                icon: "public/images/notification/notification-2.jpg",
            };
        },
        true
    );
}

module.exports = startNotification