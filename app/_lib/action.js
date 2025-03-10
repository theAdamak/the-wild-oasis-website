"use server";

import { signIn } from "./auth";

export async function signinAction() {
  await signIn("google", { redirectTo: "/account" });
}
