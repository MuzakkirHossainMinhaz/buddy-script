"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useRegisterMutation } from "@/lib/api";
import { AuthError } from "./AuthError";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: { error?: string; message?: string } }).data;
    return data?.error || data?.message || "Unable to register. Please try again.";
  }

  return "Unable to register. Please try again.";
}

export function RegistrationForm() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== repeatPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await register({ firstName, lastName, email, password }).unwrap();
      router.replace("/");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form className="_social_registration_form" onSubmit={onSubmit}>
      <AuthError message={error} />
      <div className="row">
        <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8" htmlFor="first-name">
              First name
            </label>
            <input
              id="first-name"
              type="text"
              className="form-control _social_registration_input"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </div>
        </div>
        <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8" htmlFor="last-name">
              Last name
            </label>
            <input
              id="last-name"
              type="text"
              className="form-control _social_registration_input"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </div>
        </div>
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              className="form-control _social_registration_input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              className="form-control _social_registration_input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>
        </div>
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8" htmlFor="repeat-password">
              Repeat Password
            </label>
            <input
              id="repeat-password"
              type="password"
              className="form-control _social_registration_input"
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
          <div className="form-check _social_registration_form_check">
            <input
              className="form-check-input _social_registration_form_check_input"
              type="checkbox"
              id="terms"
              required
            />
            <label className="form-check-label _social_registration_form_check_label" htmlFor="terms">
              I agree to terms & conditions
            </label>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
          <div className="_social_registration_form_btn _mar_t40 _mar_b60">
            <button type="submit" className="_social_registration_form_btn_link _btn1" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register now"}
            </button>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_registration_bottom_txt">
            <p className="_social_registration_bottom_txt_para">
              Already have an account? <Link href="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
