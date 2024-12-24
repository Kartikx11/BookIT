import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // For feedback during registration

  async function registerUser(ev) {
    ev.preventDefault();
    setLoading(true); // Indicate registration in progress
    try {
      await axios.post(
        "/register",
        { name, email, password },
        { withCredentials: true } // Ensures cookies/session tokens are properly handled
      );
      alert("Registration Successful! You can now log in.");
    } catch (e) {
      console.error("Registration Error:", e);
      alert("Registration Failed. Please try again later.");
    } finally {
      setLoading(false); // Stop loading feedback
    }
  }

  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">Register</h1>
        <form className="max-w-md mx-auto" onSubmit={registerUser}>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            required // Ensures the field is filled
          />
          <input
            type="email"
            placeholder="xyz@gmail.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
            minLength="6" // Enforces a minimum password length
          />
          <button className="primary" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          <div className="text-center py-2 text-gray-500">
            Already a member?{" "}
            <Link className="underline text-black" to="/login">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
