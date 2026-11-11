document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#reset-password-form");

    // Stop if the reset form is not present.
    // This happens when the reset link is invalid or expired.
    if (!form) {
        return;
    }

    const tokenInput = document.querySelector("#token");
    const passwordInput = document.querySelector("#password");
    const confirmPasswordInput = document.querySelector("#confirm-password");
    const submitButton = document.querySelector("#reset-password");

    let toastTimeout;

    // Handle password visibility toggles.
    document.querySelectorAll(".password-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const input = button.parentElement.querySelector("input");
            const isPassword = input.type === "password";

            input.type = isPassword ? "text" : "password";
            button.textContent = isPassword ? "Hide" : "Show";
            button.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
            button.setAttribute("aria-pressed", String(isPassword));
        });
    });

    // Submit the new password.
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const token = tokenInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!password || !confirmPassword) {
            showMessage("Please complete both password fields.");
            return;
        }

        if (password.length < 8) {
            showMessage("Your password must contain at least 8 characters.");
            passwordInput.focus();
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Your passwords do not match.");
            confirmPasswordInput.focus();
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token,
                    password,
                    confirmPassword
                })
            });

            const data = await response.json();

            if (!response.ok || data.success !== true) {
                showMessage(
                    data.message || "Unable to reset your password. Please try again."
                );
                return;
            }

            showMessage(
                data.message || "Your password has been updated successfully.",
                "success"
            );

            form.reset();

            // Redirect to the login page after a successful reset.
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);

        } catch (error) {
            console.error("Reset password error:", error);
            showMessage("Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    });

    function setLoading(loading) {
        submitButton.disabled = loading;

        submitButton.querySelector("span").textContent =
            loading ? "Updating..." : "Update Password";
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
