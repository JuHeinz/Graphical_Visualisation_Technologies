console.log("hello")

let image = document.querySelector('#img');
let frameCount = document.querySelector('#frame-count');
let leftBtn = document.querySelector('#left-btn');
let animationBtn = document.querySelector('#animation-btn');
let righttBtn = document.querySelector('#right-btn');


leftBtn.addEventListener("click", decreaseFrames)
animationBtn.addEventListener("click", startAnimation)
righttBtn.addEventListener("click", increaseFrames)

let currentFrame = 1;
let maxFrames = 11;

/**
 * Set frame for image source
 * @param {} frame frame to set in image 
 */
function setFrame(frame) {
    currentFrame = frame;
    image.src = "./frames/" + frame + ".jpg"
    frameCount.innerHTML = frame
}

/**
 * Decrease frame by one
 */
function decreaseFrames() {

    if (currentFrame <= 1) { //lower bound
        setFrame(maxFrames)
    } else {
        setFrame(currentFrame - 1)
    }
}

/**
 * Increase frame by one
 */
function increaseFrames() {
    if (currentFrame >= maxFrames) { //upper bound
        setFrame(1)
    } else {
        setFrame(currentFrame + 1)
    }
}

function startAnimation() {
}

function stopAnimation() { }
