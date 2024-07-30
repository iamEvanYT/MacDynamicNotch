const notch = document.getElementById('notch');

const setupContainer = document.getElementById('setup');
const setupHelloVideo = document.getElementById('setup-hello');

var state = "normal"

let resizeTimer;
let isResizing = false;
let isHovering = false;

var oldSizeState = "default"
function setSizeState(state) {
    if (state !== oldSizeState) {
        sizeState.set(state);
        oldSizeState = state;
        return true
    }
    return false
}

async function stateChanged() {
    if (state == "normal") {
        if (oldSizeState == "setup") {
            setSizeState("default");
        }
    } else if (state == "setup") {
        setSizeState("setup");
        setupHelloVideo.play()
    }

    if (state == "setup") {
        setupContainer.style.setProperty("visibility", "visible");
    } else {
        setupContainer.style.setProperty("visibility", "hidden");
    }
}

setTimeout(() => {
    state = "setup";
    stateChanged()
}, 2000)

function handleMouseEnter() {
    if (state != "normal") {
        return
    }

    isHovering = true;
    if (!isResizing) {
        setSizeState("expanded");
    }
}

function handleMouseLeave() {
    if (state != "normal") {
        return
    }

    isHovering = false;
    if (!isResizing) {
        setSizeState("default");
    }
}

notch.addEventListener("mouseenter", handleMouseEnter);
notch.addEventListener("mouseleave", handleMouseLeave);

window.addEventListener("resize", () => {
    isResizing = true;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        isResizing = false;
        if (isHovering) {
            handleMouseEnter();
        } else {
            handleMouseLeave();
        }
    }, 250);
});

stateChanged()