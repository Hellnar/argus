import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyCOQhsXWANNs3Shl_HmNzF0SeWXTpAH5EI",
    authDomain: "argus-1a2aa.firebaseapp.com",
    projectId: "argus-1a2aa",
    storageBucket: "argus-1a2aa.appspot.com",
    messagingSenderId: "628663199277",
    appId: "1:628663199277:web:d5ac86c6bc2491ec5fbaa4"
};
initializeApp(firebaseConfig);
const db = getFirestore()
handleBallClick()
handleCloseModal()

// initPrize()
const prizesRef = doc(db, "prizes", "AcPRU8K5FoFnxiD1fMLQ")
const usersRef = collection(db, "users")

async function initPrize() {
    const prize = await choosePrize()
    document.querySelector(".prize-text").innerText = `Ура! ${prize}`
}

async function choosePrize() {
    const prizes = await getPrizes()
    const randomInfinitePrize = randomFromArray(prizes.infinite)
    if(prizes.jewelry === 0 && prizes.chocolate === 0) {
        return `Вы выиграли ${randomInfinitePrize}!`
    }
    const randomNum = random(1, 7)
    if(prizes.jewelry > 0) {
        if(randomNum === 5) {
            updateDoc(prizesRef, {jewelry: prizes.jewelry - 1})
            return `Вы выиграли украшение!`
        }
    }
    if(prizes.chocolate > 0) {
        if(randomNum === 6) {
            updateDoc(prizesRef, {chocolate: prizes.chocolate - 1})
            return `Вы выиграли шоколадку!`
        }
    }
    return `Вы выиграли ${randomInfinitePrize}!`
}

async function getPrizes() {
    const response = await getDocs(collection(db, "prizes"))
    return response.docs[0].data()
}



// SEND EMAIL

function submitEmail() {
    document.querySelector(".enter-email").addEventListener("submit", async (e) => {
        console.log(`submit clicked`)
        e.preventDefault()
        const user = await checkEmail(e.target[0].value)
        if(user === null) {
            userDoesntExist()
        } else {
            if(!user.active) {
                document.querySelector(".prize-text").innerText = `Поздравляем! Вы уже выиграли ${user.prize}!`
            } else {
                initPrize()
            }
            document.querySelector(".enter-email").style.display = "none"
            document.querySelector(".modal-body").style.display = "flex"
        }
    })
}

async function checkEmail(email) {
    console.log(`checking ${email}`)
    const findEmail = await query(usersRef, where("email", "==", email))
    const user = await getDocs(findEmail)
    return user.docs.length > 0 ? user.docs[0].data() : null
}

function userDoesntExist() {
    console.log(`user doesn't exist`)
    document.querySelector(".email-error").style.display = "block"
}



// ============== MODALS ====================

function handleBallClick() {
    document.querySelectorAll(".ball").forEach(ball => {
        ball.addEventListener("click", () => {
            resetModal()
            document.querySelector(".modal-box").style.display = "flex"
            submitEmail()
        })
    })
}

function resetModal() {
    document.querySelector(".enter-email").style.display = "flex"
    document.querySelector(".modal-body").style.display = "none"
    document.querySelector(".enter-email input").value = ""
    document.querySelector(".enter-email input").value = ""
    document.querySelector("#phone").value = ""
}

function handleCloseModal() {
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".modal-box").style.display = "none"
    })
}



// ============== UTILS ====================

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFromArray(items) {
    return items[Math.floor(Math.random()*items.length)]
}