"use client";

import { useRef, useState, type FormEvent } from "react";
import { DiyaMark, Mandala } from "./ui";
import { BRAND } from "@/lib/brand";

export default function Newsletter() {
  const [msg, setMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // TODO: connect to a mailing-list provider; for now this only validates and confirms.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = inputRef.current!;
    if (!input.value.trim() || !input.checkValidity()) {
      setMsg("Please enter a valid email address.");
      input.focus();
      return;
    }
    setMsg(`🪔 Dhanyavaad! You’re now connected with the ${BRAND.name}.`);
    e.currentTarget.reset();
  };

  return (
    <section className="newsletter" id="contact">
      <Mandala className="newsletter__mandala" />
      <div className="container newsletter__inner reveal">
        <DiyaMark className="newsletter__diya" />
        <p className="eyebrow">Contact</p>
        <h2 className="h2">Stay Connected With the <em>Committee</em></h2>
        <p>Be the first to hear about upcoming Leela, events, volunteer opportunities and committee updates.</p>
        <form className="newsletter__form" id="newsletterForm" noValidate onSubmit={onSubmit}>
          <label className="visually-hidden" htmlFor="email">Email address</label>
          <input ref={inputRef} id="email" name="email" type="email" placeholder="Enter your email" autoComplete="email" required />
          <button type="submit" className="btn btn--dark">Stay Connected</button>
        </form>
        <p className="newsletter__msg" id="newsletterMsg" role="status" aria-live="polite">{msg}</p>
      </div>
    </section>
  );
}
