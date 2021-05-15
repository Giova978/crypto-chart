/**
 * Slightly modified version to accept object arrays, take the x property and average it
 * TODO: Make it not harcoded and able to select the object property
 * @param {Array} array
 * @param {number} window
 * @param {number} minPeriod
 * @returns {Array}
 */
function roll(array, window, minPeriod = window) {
    // Format MinPeriod and window to match index in array
    const formattedMinPeriod = minPeriod - 1;
    const formattedWindow = window - 1;

    return array.reduce((acc, currValue, index, array) => {
        curValue = currValue.y;
        // Make sure to respect minPeriod
        if (index < formattedMinPeriod) {
            acc.push({ x: currValue.x, y: NaN });
            return acc;
        }

        let temp = [curValue];
        // Get values respecting windows
        // Start in the past index as we already added currValue
        for (let i = index - 1; i >= index - formattedWindow; i--) {
            if (!array[i]) break;
            temp.push(array[i].y);
        }

        // Get the average of the indexes
        const avg = temp.reduce((acc, cur) => acc + cur) / temp.length;

        acc.push({ x: currValue.x, y: avg });
        return acc;
    }, []);
}

async function main() {
    const { records: data } = await window.yhApi.history("btc-usd", {
        interval: "90m",
        range: "1mo",
    });

    console.log(data);

    const dates = data.map((v) => window.moment(v.time * 1000).format("MM/DD"));
    const prices = data.map((v, i) => ({
        y: v.close?.toFixed(1),
        x: dates[i],
        open: v.open?.toFixed(1),
        low: v.low?.toFixed(1),
        high: v.high?.toFixed(1),
    }));

    const closeData = data.map((v, i) => ({ x: dates[i], y: v.close }));

    const m5 = roll(closeData, 5);
    const m20 = roll(closeData, 20);

    const chartData = {
        labels: dates,
        datasets: [
            {
                label: "Market Value",
                backgroundColor: "rgb(255, 99, 132)",
                borderColor: "rgb(255, 99, 132)",
                data: prices,
            },
            {
                label: "Short Term",
                backgroundColor: "rgb(252, 177, 3)",
                borderColor: "rgb(252, 177, 3)",
                data: m5,
            },
            {
                label: "Long Term",
                backgroundColor: "rgb(8, 72, 199)",
                borderColor: "rgb(8, 72, 199)",
                data: m20,
            },
        ],
    };

    const config = {
        type: "line",
        data: chartData,
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (context.dataset.label !== "Market Value") return context.formattedValue;
                            let string = [context.raw.y];
                            string.push(`open: ${context.raw.open}`);
                            string.push(`high: ${context.raw.high}`);
                            string.push(`low: ${context.raw.low}`);

                            return string;
                        },
                    },
                },

                zoom: {
                    zoom: {
                        enabled: true,
                        mode: "xy",
                    },
                    pan: {
                        enabled: true,
                        mode: "xy",
                    },
                },
            },
        },
    };

    const chart = new Chart(document.getElementById("chart"), config);
}

main();
