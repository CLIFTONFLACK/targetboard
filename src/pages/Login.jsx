import { ShieldCheck } from "lucide-react";

export default function Login({ onLogin }) {
  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="logo-box">TB</div>
        <h1>TargetBoard Content Agent</h1>
        <p>Sign in with an approved reviewer account.</p>
        <button className="primary-button" type="button" onClick={onLogin}>
          <ShieldCheck size={17} />
          Continue with Google
        </button>
      </section>
    </main>
  );
}
