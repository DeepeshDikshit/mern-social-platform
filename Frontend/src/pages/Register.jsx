import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:3000/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Registration failed");
    }
  }

  return (
    <div className="screen">
      <div className="container">
        <div className="card form-card" aria-label="Register">
          <div className="form-header">
            <h1>Create your account</h1>
            <p className="muted">Join the community.</p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

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

            <div className="field">
              <label>Confirm password</label>
              <input
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button className="btn-block">Create account</button>
          </form>

          <div className="form-footer">
            <span>Already have an account? </span>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
