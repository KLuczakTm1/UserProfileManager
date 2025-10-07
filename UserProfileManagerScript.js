// Przyk³adowe dane wydarzeñ
const eventsData = [
    { id: 1, name: "Warsztaty programowania", date: "2025-10-20", description: "Nauka podstaw JS" },
    { id: 2, name: "Hackathon AI", date: "2025-11-05", description: "Projekty z AI" },
    { id: 3, name: "Webinar React", date: "2025-11-15", description: "Zrozumienie React" }
];

let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let users = JSON.parse(localStorage.getItem("users")) || [];
let eventSeats = JSON.parse(localStorage.getItem("eventSeats")) || {}; // { eventId: [emails] }

document.addEventListener("DOMContentLoaded", () => {
    if (currentUser) {
        document.getElementById("goToProfileBtn").style.display = "inline-block";
    }
    loadHomePage();
});

// === Funkcje prze³¹czania stron ===
function showPage(id) {
    ["homePage", "registerPage", "loginPage", "profilePage", "coursesPage"].forEach(page => {
        document.getElementById(page).style.display = page === id ? "block" : "none";
    });
}

function loadHomePage() {
    showPage("homePage");
    const eventList = document.getElementById("eventList");
    eventList.innerHTML = "";

    eventsData.forEach(event => {
        const card = document.createElement("div");
        card.classList.add("event-card");
        card.innerHTML = `
            <h3>${event.name}</h3>
            <p>${event.date}</p>
            <p>${event.description}</p>
            <button onclick="showCoursesPage(${event.id})">Zobacz uczestników</button>
        `;
        eventList.appendChild(card);
    });
}

// === Rejestracja ===
document.getElementById("registerBtn").onclick = () => showPage("registerPage");
document.getElementById("homeBtn").onclick = () => loadHomePage();

document.getElementById("registrationForm").onsubmit = e => {
    e.preventDefault();
    const firstName = regFirstName.value;
    const lastName = regLastName.value;
    const email = regEmail.value;
    const password = regPassword.value;
    const confirmPassword = regConfirmPassword.value;

    if (password !== confirmPassword) {
        registerError.textContent = "Has³a musz¹ byæ identyczne!";
        return;
    }

    if (users.find(u => u.email === email)) {
        registerError.textContent = "Ten e-mail ju¿ istnieje!";
        return;
    }

    const user = { firstName, lastName, email, password };
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Rejestracja zakoñczona!");
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    document.getElementById("goToProfileBtn").style.display = "inline-block";
    loadHomePage();
};

// === Logowanie ===
document.getElementById("loginBtn").onclick = () => showPage("loginPage");
document.getElementById("homeBtn2").onclick = () => loadHomePage();

document.getElementById("loginForm").onsubmit = e => {
    e.preventDefault();
    const email = loginEmail.value;
    const password = loginPassword.value;

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        loginError.textContent = "Nieprawid³owy e-mail lub has³o!";
        return;
    }

    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert("Zalogowano!");
    document.getElementById("goToProfileBtn").style.display = "inline-block";
    loadHomePage();
};

// === Profil u¿ytkownika ===
document.getElementById("goToProfileBtn").onclick = loadProfilePage;

function loadProfilePage() {
    if (!currentUser) return;

    showPage("profilePage");
    userEmail.textContent = currentUser.email;
    userFirstName.textContent = currentUser.firstName;
    userLastName.textContent = currentUser.lastName;

    const list = document.getElementById("userEventsList");
    list.innerHTML = "";

    for (const [eventId, emails] of Object.entries(eventSeats)) {
        if (emails.includes(currentUser.email)) {
            const event = eventsData.find(e => e.id == eventId);
            const li = document.createElement("li");
            li.textContent = `${event.name} (${event.date})`;
            list.appendChild(li);
        }
    }
}

document.getElementById("logoutBtn").onclick = () => {
    currentUser = null;
    localStorage.removeItem("currentUser");
    document.getElementById("goToProfileBtn").style.display = "none";
    loadHomePage();
};

// === Edycja profilu ===
document.getElementById("editProfileBtn").onclick = () => {
    editProfileForm.style.display = "block";
    userInfo.style.display = "none";
    editFirstName.value = currentUser.firstName;
    editLastName.value = currentUser.lastName;
    editEmail.value = currentUser.email;
    editPassword.value = currentUser.password;
};

document.getElementById("cancelEditBtn").onclick = () => {
    editProfileForm.style.display = "none";
    userInfo.style.display = "block";
};

document.getElementById("saveProfileBtn").onclick = () => {
    currentUser.firstName = editFirstName.value;
    currentUser.lastName = editLastName.value;
    currentUser.email = editEmail.value;
    currentUser.password = editPassword.value;

    users = users.map(u => u.email === currentUser.email ? currentUser : u);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    alert("Profil zaktualizowany!");
    editProfileForm.style.display = "none";
    userInfo.style.display = "block";
    loadProfilePage();
};

// === Kursy i uczestnicy ===
function showCoursesPage(selectedId) {
    showPage("coursesPage");
    const container = document.getElementById("courseList");
    container.innerHTML = "";

    eventsData.forEach(event => {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("course-container");

        const title = document.createElement("div");
        title.classList.add("course-title");
        title.textContent = `${event.name} (${event.date})`;
        eventDiv.appendChild(title);

        const seatsDiv = document.createElement("div");
        seatsDiv.classList.add("seats");

        const seats = eventSeats[event.id] || [];
        for (let i = 0; i < 5; i++) {
            const seat = document.createElement("div");
            seat.classList.add("seat");

            if (seats[i]) {
                seat.textContent = seats[i];
                seat.classList.add("taken");
            } else {
                seat.textContent = "Wolne";
                seat.classList.add("free");
                seat.onclick = () => registerForSeat(event.id, i);
            }
            seatsDiv.appendChild(seat);
        }

        const leaveBtn = document.createElement("button");
        leaveBtn.textContent = "Wypisz siê";
        leaveBtn.onclick = () => leaveEvent(event.id);

        eventDiv.appendChild(seatsDiv);
        eventDiv.appendChild(leaveBtn);
        container.appendChild(eventDiv);
    });
}

function registerForSeat(eventId, seatIndex) {
    if (!currentUser) return alert("Zaloguj siê najpierw!");
    const seats = eventSeats[eventId] || [];

    if (seats.includes(currentUser.email))
        return alert("Ju¿ jesteœ zapisany na ten kurs!");

    seats[seatIndex] = currentUser.email;
    eventSeats[eventId] = seats;
    localStorage.setItem("eventSeats", JSON.stringify(eventSeats));

    showCoursesPage();
}

function leaveEvent(eventId) {
    if (!currentUser) return;
    const seats = eventSeats[eventId] || [];
    const newSeats = seats.map(email => email === currentUser.email ? null : email);
    eventSeats[eventId] = newSeats;
    localStorage.setItem("eventSeats", JSON.stringify(eventSeats));

    showCoursesPage();
}

document.getElementById("backToHomeBtn").onclick = () => loadHomePage();
