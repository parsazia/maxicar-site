"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "عملیات انجام نشد.");
      if (data.access_token) {
        localStorage.setItem("maxicar_access_token", data.access_token);
        localStorage.setItem("maxicar_user_email", data.user?.email || email);
        window.location.href = "/account/cashback";
      } else {
        setMessage("ثبت‌نام انجام شد. اگر تأیید ایمیل فعال باشد، ایمیل خود را تأیید کنید و سپس وارد شوید.");
        setMode("login");
      }
    } catch (error) { setMessage(error.message || "خطا در ارتباط با سرور."); }
    finally { setBusy(false); }
  }
  return <main className="auth-page" dir="rtl">
    <section className="auth-card">
      <Link href="/" className="auth-brand">ماکسیکار</Link>
      <h1>{mode === "login" ? "ورود به حساب کاربری" : "ساخت حساب کاربری"}</h1>
      <p>برای مشاهده و ثبت درخواست بازگشت وجه وارد حساب خود شوید.</p>
      <form onSubmit={submit}>
        <label>ایمیل<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>رمز عبور<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button disabled={busy} type="submit">{busy ? "در حال انجام..." : mode === "login" ? "ورود" : "ثبت‌نام"}</button>
      </form>
      {message && <p role="status" className="auth-message">{message}</p>}
      <button type="button" className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
        {mode === "login" ? "حساب ندارید؟ ثبت‌نام کنید" : "قبلاً حساب ساخته‌اید؟ وارد شوید"}
      </button>
      <Link href="/" className="auth-back">بازگشت به فروشگاه</Link>
    </section>
    <style jsx>{`
      .auth-page{min-height:75vh;display:grid;place-items:center;padding:32px 16px;background:#f5f7fa;color:#182230}
      .auth-card{width:min(100%,440px);background:#fff;padding:32px;border:1px solid #e3e8ef;border-radius:18px;box-shadow:0 16px 45px #1420330d}
      .auth-brand{font-size:24px;font-weight:800;color:#173d70;text-decoration:none}
      h1{font-size:24px;margin:24px 0 8px} p{color:#64748b;line-height:1.9}
      form{display:grid;gap:16px;margin-top:24px} label{display:grid;gap:8px;font-size:14px}
      input{width:100%;box-sizing:border-box;padding:13px;border:1px solid #cbd5e1;border-radius:10px;font:inherit}
      form button{border:0;border-radius:10px;padding:14px;background:#173d70;color:white;font:inherit;font-weight:700;cursor:pointer}
      button:disabled{opacity:.6}.auth-switch,.auth-back{display:block;margin-top:18px;text-align:center;background:none;border:0;color:#173d70;font:inherit;cursor:pointer;text-decoration:none}
      .auth-message{background:#f1f5f9;padding:12px;border-radius:8px;font-size:14px}
    `}</style>
  </main>;
}