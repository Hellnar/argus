import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getFirestore, collection, getDocs, updateDoc, doc, query, where, writeBatch } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js"
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

if (!iOS()) {
    handleBallClick()
}
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
    if(prizes.jewelry === 0 && prizes.chocolate === 0) {
        document.querySelector(".prize-phone").style.display = "none"
        document.querySelector(".user-phone").style.display = "none"
        document.querySelector(".take-prize").style.display = "block"
        prize = randomInfinitePrize
        await updateUser(user, prize)
        return `Вы выиграли ${randomInfinitePrize}!`
    }
    const randomNum = random(1, 7)
    if(prizes.jewelry > 0) {
        if(randomNum === 5) {
            updateDoc(prizesRef, {jewelry: prizes.jewelry - 1})
            document.querySelector(".prize-phone").style.display = "block"
            document.querySelector(".user-phone").style.display = "block"
            document.querySelector(".take-prize").style.display = "none"
            prize = "украшение"
            await updateUser(user, prize)
            return `Вы выиграли украшение и скидку 15%!`
        }
    }
    if(prizes.chocolate > 0) {
        if(randomNum === 6) {
            updateDoc(prizesRef, {chocolate: prizes.chocolate - 1})
            document.querySelector(".prize-phone").style.display = "block"
            document.querySelector(".user-phone").style.display = "block"
            document.querySelector(".take-prize").style.display = "none"
            prize = "шоколадку"
            await updateUser(user, prize)
            return `Вы выиграли шоколадку и скидку 15%!`
        }
    }
    document.querySelector(".prize-phone").style.display = "none"
    document.querySelector(".user-phone").style.display = "none"
    document.querySelector(".take-prize").style.display = "block"
    prize = randomInfinitePrize
    await updateUser(user, prize)
    return `Вы выиграли ${randomInfinitePrize}!`
}

async function getPrizes() {
    const response = await getDocs(collection(db, "prizes"))
    return response.docs[0].data()
}

async function updateUser(user, prize) {
    const userRef = doc(db, "users", USER_ID)
    updateDoc(userRef, {prize: prize, active: false})
}



// ============== CHECK EMAIL ====================

function submitEmail() {
    document.querySelector(".enter-email").addEventListener("submit", async (e) => {
        e.preventDefault()
        const user = await checkEmail(e.target[0].value)
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

async function checkEmail(email) {
    const findEmail = await query(usersRef, where("email", "==", email))
    const user = await getDocs(findEmail)
    if(user.docs.length <= 0) return null
    USER_ID = user.docs[0].id
    return user.docs.length > 0 ? user.docs[0].data() : null
}

function userDoesntExist() {
    document.querySelector(".email-error").style.display = "block"
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
    // document.querySelector("#phone").value = ""
}


// ============== UTILS ====================

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFromArray(items) {
    return items[Math.floor(Math.random()*items.length)]
}

function fillFirebase() {
    const users = EMAILS.default.map(email => {
        return {
            email: email,
            active: true,
            prize: ""
        }
    })
    const batch = writeBatch(db)
    users.forEach((user) => {
        const docRef = doc(collection(db, "users"))
        batch.set(docRef, user);
    })
    batch.commit()
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