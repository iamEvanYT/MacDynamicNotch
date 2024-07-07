
const notch = document.getElementById('notch');

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

var resizing = false

notch.addEventListener("mouseenter", () => {
    setTimeout(() => {
        if (resizing) {
            return
        }
    
        window.mouse.in()
    }, 100)
})
notch.addEventListener("mouseleave", (() => {
    setTimeout(() => {
        if (resizing) {
            return
        }
    
        window.mouse.out()
    }, 150)
}))

var lastResizeId = null
document.addEventListener("resize", () => {
    const resizeId = uuidv4()
    lastResizeId = resizeId

    resizing = true

    setTimeout(() => {
        if (lastResizeId == resizeId) {
            resizing = false
        }
    }, 200)
})