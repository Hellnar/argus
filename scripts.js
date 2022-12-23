// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
// import { getFirestore, collection, getDocs, updateDoc, doc, query, where, writeBatch, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js"

// const firebaseConfig = {
//     apiKey: "AIzaSyCOQhsXWANNs3Shl_HmNzF0SeWXTpAH5EI",
//     authDomain: "argus-1a2aa.firebaseapp.com",
//     projectId: "argus-1a2aa",
//     storageBucket: "argus-1a2aa.appspot.com",
//     messagingSenderId: "628663199277",
//     appId: "1:628663199277:web:d5ac86c6bc2491ec5fbaa4"
// }
// let USER_ID = ""

// initializeApp(firebaseConfig)
// const db = getFirestore()

let EVENT_LISTENER = false

if (!iOS()) {
    handleBallClick()
}

// ============== GIVE PRIZES ====================

async function initPrize(user) {
    const prize = await choosePrize(user)
    document.querySelector(".prize-text").innerText = `Ура! ${prize}`
}

async function choosePrize(user) {
    const prizes = await getPrizes()
    const randomInfinitePrize = randomFromArray(prizes.infinite)
    let prize = ""
    console.log(user)
    if(prizes.jewelry === 0 && prizes.chocolate === 0) {
        document.querySelector(".prize-phone").style.display = "none"
        document.querySelector(".user-phone").style.display = "none"
        document.querySelector(".take-prize").style.display = "block"
        prize = randomInfinitePrize
        await updateUser(user, prize, 0, 0)
        return `Вы выиграли ${randomInfinitePrize}!`
    }
    const randomNum = random(1, 200)
    if(prizes.jewelry > 0) {
        if(randomNum === 5) {
            // updateDoc(prizesRef, {jewelry: prizes.jewelry - 1})
            document.querySelector(".prize-phone").style.display = "block"
            document.querySelector(".user-phone").style.display = "block"
            document.querySelector(".take-prize").style.display = "none"
            prize = "украшение"
            await updateUser(user, prize, 0, -1)
            return `Вы выиграли украшение и скидку 15%!`
        }
    }
    if(prizes.chocolate > 0) {
        if(randomNum === 6) {
            // updateDoc(prizesRef, {chocolate: prizes.chocolate - 1})
            document.querySelector(".prize-phone").style.display = "block"
            document.querySelector(".user-phone").style.display = "block"
            document.querySelector(".take-prize").style.display = "none"
            prize = "шоколадку"
            await updateUser(user, prize, -1, 0)
            return `Вы выиграли шоколадку и скидку 15%!`
        }
    }
    document.querySelector(".prize-phone").style.display = "none"
    document.querySelector(".user-phone").style.display = "none"
    document.querySelector(".take-prize").style.display = "block"
    prize = randomInfinitePrize
    await updateUser(user, prize, 0, 0)
    return `Вы выиграли ${randomInfinitePrize}!`
}

async function getPrizes() {

    const prizes = await fetch("http://3.222.117.165/api/prizes/", {
        method: "GET"
    })
    const prizesJSON = await prizes.json()
    return prizesJSON.prizes[0]
}

async function updateUser(user, prize, chocolate, jewelry) {
    
    const userPatch = await fetch("http://3.222.117.165/api/users/", {
        method: "PATCH",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            email: user.email,
            prize: prize,
            chocolate: chocolate,
            jewelry: jewelry
        })
    })
    const userJSON = await userPatch.json()
}



// ============== CHECK EMAIL ====================

function submitEmail() {
    if(!EVENT_LISTENER) {
        const loader = document.querySelector("#loader")
        document.querySelector(".enter-email").addEventListener("submit", async (e) => {
            EVENT_LISTENER = true
            e.preventDefault()
            loader.style.display = "flex"
            document.querySelector(".enter-email").style.display = "none"
            const user = await checkEmail(e.target[0].value)
            loader.style.display = "none"
            if(user === null) {
                userDoesntExist()
            } else {
                document.querySelector(".enter-email").style.display = "none"
                if(!user.active) {
                    document.querySelector(".prize-text").innerText = `Поздравляем! Вы уже выиграли ${user.prize}!`
                    if(user.prize === "шоколадку" || user.prize === "украшение") {
                        document.querySelector(".prize-phone").style.display = "block"
                        document.querySelector(".user-phone").style.display = "block"
                        document.querySelector(".take-prize").style.display = "none"
                    } else {
                        document.querySelector(".prize-phone").style.display = "none"
                        document.querySelector(".user-phone").style.display = "none"
                        document.querySelector(".take-prize").style.display = "block"
                    }
                } else {
                    initPrize(user)
                }
                document.querySelector(".enter-email").style.display = "none"
                document.querySelector(".modal-body").style.display = "flex"
            }
        })
    }
}

async function checkEmail(email) {
    console.log(`check email`)
    const user = await fetch("http://3.222.117.165/api/users/", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: email})
    })
    const userJSON = await user.json()
    return !userJSON.data ? null : userJSON.data
}

function userDoesntExist() {
    document.querySelector(".email-error").style.display = "block"
    document.querySelector(".add-email").style.display = "block"
    document.querySelector(".enter-email").style.display = "flex"
    document.querySelector(".add-email").textContent = "Упс! У Деда Мороза нет такого Email адреса"
}



// ============== MODALS ====================

function handleBallClick() {
    document.querySelectorAll(".ball").forEach(ball => {
        ball.addEventListener("click", () => {
            resetModal()
            submitEmail()
            document.querySelector(".modal-box").style.display = "flex"
        })
    })
}

function resetModal() {
    document.querySelector(".enter-email").style.display = "flex"
    document.querySelector(".modal-body").style.display = "none"
    document.querySelector(".enter-email input").value = ""
    document.querySelector(".enter-email input").value = ""
    document.querySelector(".add-email").style.display = "block"
    document.querySelector(".email-error").style.display = "none"
    document.querySelector(".add-email").textContent = "Для новогоднего чуда введите email на который Вы получили нашу рассылку"
    // document.querySelector("#phone").value = ""
}


// ============== UTILS ====================

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFromArray(items) {
    return items[Math.floor(Math.random()*items.length)]
}

function iOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  }


// ============== EVENTS ====================

document.addEventListener("click", (e) => {
    if(e.target.classList.contains("modal-box")) {
        document.querySelector(".modal-box").style.display = "none"
    }
})