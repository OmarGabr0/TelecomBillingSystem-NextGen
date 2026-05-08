const BASE = "/TelecomBillingWebsite";

// Check if already logged in
window.onload = () => {
    fetch(BASE + "/auth", { credentials: "include" })
        .then(res => {
            if (res.ok) return res.json();
            throw new Error('Not logged in');
        })
        .then(data => {
            if (data.role && data.role.toUpperCase() === "ADMIN") {
                window.location.href = "admin.html";
            } else if (data.role) {
                window.location.href = "user.html";
            }
        })
        .catch(() => {
            // Not logged in, stay on login page
        });
};

function login() {
    const errorMsg = document.getElementById("errorMsg");
    const userVal = document.getElementById("username").value;
    const passVal = document.getElementById("password").value;

    if (!userVal || !passVal) {
        errorMsg.innerText = "Please enter both username and password.";
        return;
    }

    const payload = new URLSearchParams();
    payload.append("username", userVal);
    payload.append("password", passVal);

    fetch(BASE + "/auth", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
        credentials: "include"
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                errorMsg.innerText = "Invalid credentials. Please try again.";
                return;
            }

            if (data.role && data.role.toUpperCase() === "ADMIN") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "user.html";
            }
        })
        .catch(err => {
            console.error("Login failed:", err);
            errorMsg.innerText = "Server error. Please try again later.";
        });
}
