let image = document.querySelector('#img');
let frameCount = document.querySelector('#frame-count');
let leftBtn = document.querySelector('#left-btn');
let animationBtn = document.querySelector('#animation-btn');
let righttBtn = document.querySelector('#right-btn');

const startAnimationText = "▶️ <strong>A</strong>nimation starten</button>"
const stopAnimationText = "⏹️ <strong>A</strong>nimation stoppen</button>"
let animationInterval = null;
let doAnimate = false;

leftBtn.addEventListener("click", decreaseFrames)
animationBtn.addEventListener("click", toggleAnimation)
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

function toggleAnimation() {
    doAnimate = !doAnimate;
    if (doAnimate) {
        console.log("Started Animation")
        animationBtn.innerHTML = stopAnimationText;

    } else {
        console.log("Stopped Animation")
        animationBtn.innerHTML = startAnimationText;
    }

    animate()
}

function animate() {

    if (animationInterval) {
        clearInterval(animationInterval); //cancel previous intervall
    }


    animationInterval = setInterval(() => {
        if (!doAnimate) {
            clearInterval(animationInterval) //cancel currently running intervall
        } else {
            increaseFrames()
        }
    }, 200);

}


addEventListener("keydown", (event) => {

    if (event.code == "ArrowLeft" || event.code == "KeyL") {
        decreaseFrames();
    }

    if (event.code == "ArrowRight" || event.code == "KeyR") {
        increaseFrames();
    }

    if (event.code == "ArrowUp" || event.code == "KeyA") {
        toggleAnimation();
    }
})
