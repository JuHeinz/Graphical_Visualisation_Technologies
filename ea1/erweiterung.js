let prevBtn = document.querySelector('#prevBtn');
let animationBtnE = document.querySelector('#animation-btn-e');
let nextBtn = document.querySelector('#nextBtn');
let spriteWindow = document.querySelector('#sprite-window');
let spriteAnimationInterval = null;


prevBtn.addEventListener("click", decreaseSpriteIndex)
animationBtnE.addEventListener("click", toggleSpriteAnimation)
nextBtn.addEventListener("click", increaseSpriteIndex)

let currentSpriteIndex = 0;
let maxSpriteIndex = 4
let doAnimateSprites = false;



function increaseSpriteIndex() {
    if (currentSpriteIndex >= maxSpriteIndex) {
        currentSpriteIndex = 0
    } else {
        currentSpriteIndex++
    }
    setSprite();
}

function decreaseSpriteIndex() {

    if (currentSpriteIndex <= 0) {
        currentSpriteIndex = maxSpriteIndex
    } else {
        currentSpriteIndex--
    }
    setSprite();

}

function setSprite() {
    //Calculate backgroundposition
    //Sprite 0 = 0px
    //Sprite 1 = -100px
    //Sprite 2 = -200px 
    let backgroundPosition = currentSpriteIndex * -500;
    spriteWindow.style.backgroundPosition = backgroundPosition + "px";
}

function toggleSpriteAnimation() {
    doAnimateSprites = !doAnimateSprites;
    if (doAnimateSprites) {
        console.log("Started Animation")
        animationBtnE.innerHTML = stopAnimationText;

    } else {
        console.log("Stopped Animation")
        animationBtnE.innerHTML = startAnimationText;
    }

    animateSprites()
}

function animateSprites() {

    if (spriteAnimationInterval) {
        clearInterval(spriteAnimationInterval); //cancel previous intervall
    }


    spriteAnimationInterval = setInterval(() => {
        if (!doAnimateSprites) {
            clearInterval(spriteAnimationInterval) //cancel currently running intervall
        } else {
            increaseSpriteIndex()
        }
    }, 200);

}