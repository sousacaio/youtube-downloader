exports.toHumanTime = (seconds) => {
    let h = Math.floor(seconds / 3600);
    let m = Math.floor(seconds / 60) % 60;

    let time;
    if (h > 0) {
        time = h + ':';
        if (m < 10) { m = '0' + m; }
    } else {
        time = '';
    }

    let s = seconds % 60;
    if (s < 10) { s = '0' + s; }

    return time + m + ':' + s;
};
