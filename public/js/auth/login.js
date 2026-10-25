
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#login-form");
    const identifierInput = document.querySelector("#username");
    const passwordInput = document.querySelector("#password");
    const submitButton = document.querySelector("#login");

    if (!form || !identifierInput || !passwordInput || !submitButton) {
        console.error("Login form or required fields could not be found.");
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

        const username = identifierInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password.trim()) {
            showMessage("Please enter your username or email and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok || data.success !== true) {
                showMessage(data.message || "Unable to sign in. Please try again.");
                return;
            }

            if (data.user) {
                sessionStorage.setItem("user", JSON.stringify(data.user));
            }

            window.location.href = "/";
        } catch (error) {
            console.error("Login error:", error);
            showMessage("Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    });

    function setLoading(loading) {
        submitButton.disabled = loading;
        submitButton.querySelector("span").textContent =
            loading ? "Signing in..." : "Sign In";
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
