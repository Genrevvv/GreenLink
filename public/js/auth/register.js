
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#register-form");
    const usernameInput = document.querySelector("#username");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const confirmPasswordInput = document.querySelector("#confirm-password");
    const submitButton = document.querySelector("#register");

    if (
        !form ||
        !usernameInput ||
        !emailInput ||
        !passwordInput ||
        !confirmPasswordInput ||
        !submitButton
    ) {
        console.error("Registration form or required fields could not be found.");
        return;
    }

    let toastTimeout;

    document.querySelectorAll(".password-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const input = button.parentElement.querySelector("input");
            if (!input) return;

            const showing = input.type === "text";
            input.type = showing ? "password" : "text";
            button.textContent = showing ? "Show" : "Hide";
            button.setAttribute("aria-pressed", String(!showing));
            button.setAttribute(
                "aria-label",
                showing ? "Show password" : "Hide password"
            );
        });
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!username || !email || !password || !confirmPassword) {
            showMessage("Please complete all fields.");
            return;
        }

        if (!/^[A-Za-z0-9_.-]{3,50}$/.test(username)) {
            showMessage(
                "Username must be 3–50 characters and contain only letters, numbers, underscores, dots, or hyphens."
            );
            usernameInput.focus();
            return;
        }

        if (!emailInput.validity.valid || email.length > 255) {
            showMessage("Please enter a valid email address.");
            emailInput.focus();
            return;
        }

        if (password.length < 8) {
            showMessage("Your password must contain at least 8 characters.");
            passwordInput.focus();
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");
            confirmPasswordInput.focus();
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirmPassword
                })
            });

            const data = await response.json();

            if (!response.ok || data.success !== true) {
                showMessage(
                    data.message || "Unable to create your account. Please try again."
                );
                return;
            }

            showMessage(
                data.message || "Registration successful! You can now sign in.",
                "success"
            );

            form.reset();

            window.setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } catch (error) {
            console.error("Registration error:", error);
            showMessage("Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    });

    function setLoading(loading) {
        submitButton.disabled = loading;
        submitButton.querySelector("span").textContent =
            loading ? "Creating account..." : "Create Account";
    }

    function showMessage(text, type = "error") {
        let toast = document.querySelector(".auth-toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.className = "auth-toast";
            toast.setAttribute("role", "alert");
            toast.setAttribute("aria-live", "polite");

            const icon = document.createElement("span");
            icon.className = "auth-toast-icon";
            icon.setAttribute("aria-hidden", "true");

            const message = document.createElement("span");
            message.className = "auth-toast-message";

            toast.append(icon, message);
            document.body.appendChild(toast);
        }

        toast.querySelector(".auth-toast-icon").textContent =
            type === "success" ? "✓" : "!";
        toast.querySelector(".auth-toast-message").textContent = text;

        toast.classList.remove("success", "error", "show");
        toast.classList.add(type);

        clearTimeout(toastTimeout);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add("show"));
        });

        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 3500);
    }
});
