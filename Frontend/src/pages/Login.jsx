import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://mern-social-platform.onrender.com:3000/auth/login",
        form
      );

      const token = res.data?.token;

      if (!token) {
        throw new Error("Token not received");
      }

      // ✅ Store token
      localStorage.setItem("token", token);

      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password");
    }
  }

  return (
    <div className="screen">
      <div className="container">
        <div className="card form-card" aria-label="Login">
          <div className="form-header">
            <h1>Welcome back</h1>
            <p className="muted">Sign in to continue.</p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button className="btn-block">Sign in</button>
          </form>

          <div className="form-footer">
            <span>Don’t have an account? </span>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
