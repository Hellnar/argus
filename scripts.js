import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getFirestore, collection, getDocs, updateDoc, doc, query, where, writeBatch, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js"
import * as EMAILS from './testmails.json' assert { type: "json" }
const firebaseConfig = {
    apiKey: "AIzaSyCOQhsXWANNs3Shl_HmNzF0SeWXTpAH5EI",
    authDomain: "argus-1a2aa.firebaseapp.com",
    projectId: "argus-1a2aa",
    storageBucket: "argus-1a2aa.appspot.com",
    messagingSenderId: "628663199277",
    appId: "1:628663199277:web:d5ac86c6bc2491ec5fbaa4"
}
let USER_ID = ""

initializeApp(firebaseConfig)
const db = getFirestore()
handleBallClick()
handleCloseModal()
// fillFirebase()


// ============== DB REFS ====================

const prizesRef = doc(db, "prizes", "AcPRU8K5FoFnxiD1fMLQ")
const usersRef = collection(db, "users")



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
    const randomNum = random(1, 7)
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
    // const response = await getDocs(collection(db, "prizes"))
    // return response.docs[0].data()

    const prizes = await fetch("https://argus-server.onrender.com/api/prizes/", {
        method: "GET"
    })
    const prizesJSON = await prizes.json()
    return prizesJSON.prizes[0]
}

async function updateUser(user, prize, chocolate, jewelry) {
    // const userRef = doc(db, "users", USER_ID)
    // updateDoc(userRef, {prize: prize, active: false})
    
    const userPatch = await fetch("https://argus-server.onrender.com/api/users/", {
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
    document.querySelector(".enter-email").addEventListener("submit", async (e) => {
        e.preventDefault()
        const user = await checkEmail(e.target[0].value)
        if(user === null) {
            userDoesntExist()
        } else {
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

async function checkEmail(email) {
    const user = await fetch("https://argus-server.onrender.com/api/users/", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: email})
    })
    const userJSON = await user.json()
    return !userJSON.data ? null : userJSON.data
}

function userDoesntExist() {
    document.querySelector(".email-error").style.display = "block"
    document.querySelector(".add-email").style.display = "none"
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
    // document.querySelector("#phone").value = ""
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

// function fillFirebase() {
//     const users = EMAILS.default.map(email => {
//         return {
//             email: email,
//             active: true,
//             prize: ""
//         }
//     })
//     const batch = writeBatch(db)
//     users.forEach((user) => {
//         const docRef = doc(collection(db, "users"))
//         batch.set(docRef, user);
//     })
//     batch.commit()
// }