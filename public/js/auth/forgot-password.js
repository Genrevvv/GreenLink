document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#forgot-password-form");
    const emailInput = document.querySelector("#email");
    const submitButton = document.querySelector("#forgot-password");

    if (!form || !emailInput || !submitButton) {
        console.error("Forgot password form or required fields could not be found.");
        return;
    }

    let toastTimeout;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();

        if (!email || !emailInput.checkValidity()) {
            showMessage("Please enter a valid email address.");
            emailInput.focus();
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok || data.success !== true) {
                showMessage(
                    data.message || "Unable to process your request. Please try again."
                );
                return;
            }

            showMessage(
                data.message || "If an account exists with that email, a password reset link will be sent.",
                "success"
            );

            form.reset();

        } catch (error) {
            console.error("Forgot password error:", error);
            showMessage("Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    });

    function setLoading(loading) {
        submitButton.disabled = loading;

        submitButton.querySelector("span").textContent =
            loading ? "Sending..." : "Send Reset Link";
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
        }, 5000);
    }
});
