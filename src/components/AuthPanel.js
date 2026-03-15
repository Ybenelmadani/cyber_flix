import React, { useState } from "react";

export default function AuthPanel({ labels, onLogin, onRegister, onClose }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await onLogin({ email, password });
      } else {
        await onRegister({ name, email, password });
      }
    } catch (err) {
      setError(err.message || labels.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.75rem] border border-cyber-cyan/20 bg-cyber-darker/95 p-5 shadow-2xl shadow-cyber-cyan/10 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-cyber-cyan">
            {mode === "login" ? labels.loginTitle : labels.registerTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-cyber-cyan/70 hover:text-cyber-fuchsia"
          >
            {labels.close}
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" ? (
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={labels.name}
              className="w-full input-cyber"
            />
          ) : null}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={labels.email}
            className="w-full input-cyber"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={labels.password}
            className="w-full input-cyber"
          />

          {error ? <p className="text-rose-300 text-sm">{error}</p> : null}

          <button
            type="submit"
            className="btn-cyber w-full text-sm"
            disabled={loading}
          >
            {loading ? labels.loading : mode === "login" ? labels.login : labels.register}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
          className="mt-4 text-sm text-cyber-cyan/80 hover:text-cyber-fuchsia"
        >
          {mode === "login" ? labels.switchToRegister : labels.switchToLogin}
        </button>
      </div>
    </div>
  );
}
