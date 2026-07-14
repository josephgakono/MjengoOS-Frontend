import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API_BASE_URL = "https://mjengoos.onrender.com";

const initialForm = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  user_type: "customer",
  profile_picture: null,
};
function getErrorMessage(errorData) {
  if (!errorData) return "Something went wrong. Please try again.";

  if (typeof errorData === "string") return errorData;

  if (errorData.detail) return errorData.detail;

  const firstKey = Object.keys(errorData)[0];
  const firstValue = errorData[firstKey];

  if (Array.isArray(firstValue)) {
    return `${firstKey}: ${firstValue.join(" ")}`;
  }

  if (typeof firstValue === "string") {
    return `${firstKey}: ${firstValue}`;
  }

  return "Please check your details and try again.";
}

function saveAuth({ tokens, user }) {
  localStorage.setItem("access", tokens.access);
  localStorage.setItem("refresh", tokens.refresh);
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("storage"));
}

function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = location.pathname === "/signup" ? "signup" : "login";
  const isSignup = mode === "signup";
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageCopy = useMemo(
    () =>
      isSignup
        ? {
            eyebrow: "Create your MjengoOS account",
            title: "Start hiring or winning construction work.",
            lead: "Join as a customer to post jobs or as a worker to send quotations and manage projects.",
            button: "Create Account",
            switchText: "Already have an account?",
            switchLink: "Log in",
            switchPath: "/login",
          }
        : {
            eyebrow: "Welcome back",
            title: "Log in to manage your construction work.",
            lead: "Access your jobs, quotations, projects, payments, updates, and messages.",
            button: "Log In",
            switchText: "New to MjengoOS?",
            switchLink: "Create an account",
            switchPath: "/signup",
          },
    [isSignup],
  );

  const updateField = (event) => {
    const { name, value, files } = event.target;

    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value,
    }));
  };

  const requestData = async (endpoint, payload, isFormData = false) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: isFormData
        ? {}
        : {
            "Content-Type": "application/json",
          },
      body: isFormData ? payload : JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(getErrorMessage(data));
    }

    return data;
  };

  const login = async ({ username, password, user }) => {
    //----------------------------------------------------
    // Get JWT Tokens
    //----------------------------------------------------

    const tokens = await requestData("/api/token/", {
      username,
      password,
    });

    //----------------------------------------------------
    // Get Logged-in User
    //----------------------------------------------------

    const meRes = await fetch(`${API_BASE_URL}/me/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.access}`,
      },
    });

    if (!meRes.ok) {
      throw new Error("Unable to load your account.");
    }

    const me = await meRes.json();

    //----------------------------------------------------
    // Save EVERYTHING from /me/
    //----------------------------------------------------

    saveAuth({
      tokens,
      user: me,
    });

    //----------------------------------------------------
    // Redirect based on account type
    //----------------------------------------------------

    switch (me.user_type) {
      case "worker":
        navigate("/worker-dashboard");
        break;

      case "customer":
        navigate("/dashboard");
        break;

      case "contractor":
        navigate("/contractor-dashboard");
        break;

      default:
        navigate("/dashboard");
        break;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (isSignup && form.password !== form.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignup) {
        const formData = new FormData();

        formData.append("username", form.username.trim());
        formData.append("first_name", form.first_name.trim());
        formData.append("last_name", form.last_name.trim());
        formData.append("email", form.email.trim());
        formData.append("phone", form.phone.trim());
        formData.append("password", form.password);
        formData.append("user_type", form.user_type);

        if (form.profile_picture) {
          formData.append("profile_picture", form.profile_picture);
        }

        const user = await requestData("/signup/", formData, true);

        await login({
          username: form.username.trim(),
          password: form.password,
          user,
        });
      } else {
        await login({
          username: form.username.trim(),
          password: form.password,
        });
      }

    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to complete this request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page page-with-navbar-offset">
      <div className="page-container">

      <section className="auth-shell" aria-labelledby="auth-title">
        <div className="auth-panel auth-panel--copy">
          <span className="auth-panel__eyebrow">{pageCopy.eyebrow}</span>
          <h1 id="auth-title">{pageCopy.title}</h1>
          <p>{pageCopy.lead}</p>

          <div className="auth-benefits" aria-label="Account benefits">
            <span>Post jobs</span>
            <span>Review quotations</span>
            <span>Track payments</span>
            <span>Manage updates</span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__header">
            <strong>{isSignup ? "Sign up" : "Login"}</strong>
            <span>
              {pageCopy.switchText}{" "}
              <Link to={pageCopy.switchPath}>{pageCopy.switchLink}</Link>
            </span>
          </div>

          <label className="auth-field">
            <span>Username</span>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={updateField}
              autoComplete="username"
              required
            />
          </label>

          {isSignup && (
            <>
              <label className="auth-field">
                <span>First Name</span>
                <input
                  name="first_name"
                  type="text"
                  value={form.first_name}
                  onChange={updateField}
                  required
                />
              </label>

              <label className="auth-field">
                <span>Last Name</span>
                <input
                  name="last_name"
                  type="text"
                  value={form.last_name}
                  onChange={updateField}
                  required
                />
              </label>
              <label className="auth-field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="auth-field">
                <span>Phone Number</span>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField}
                  autoComplete="tel"
                  placeholder="0712345678"
                  required
                />
              </label>

              <label className="auth-field">
                <span>Account Type</span>
                <select
                  name="user_type"
                  value={form.user_type}
                  onChange={updateField}
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="worker">Worker</option>
                </select>
              </label>

              <label className="auth-field">
                <span>Profile Picture (Optional)</span>

                <input
                  type="file"
                  name="profile_picture"
                  accept="image/*"
                  onChange={updateField}
                />
              </label>
            </>
          )}

          <label className="auth-field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </label>

          {isSignup && (
            <label className="auth-field">
              <span>Confirm Password</span>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={updateField}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          )}

          {status.message && (
            <p
              className={`auth-form__status auth-form__status--${status.type}`}
              role="alert"
            >
              {status.message}
            </p>
          )}

          <button
            className="auth-form__button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Please wait..." : pageCopy.button}
          </button>
        </form>
      </section>
      </div>
    </main>
  );
}

export default Auth;
