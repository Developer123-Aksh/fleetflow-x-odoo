import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "Manager"
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }

    alert("Login Successful ✅");
    console.log(form);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>FleetFlow Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Select Role</label>
            <select name="role" onChange={handleChange}>
              <option>Manager</option>
              <option>Dispatcher</option>
              <option>Safety Officer</option>
              <option>Financial Analyst</option>
            </select>
          </div>

          <button type="submit">Login</button>
        </form>

        <div className="link-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>
            Signup
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;