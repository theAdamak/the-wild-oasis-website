"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error(" must be logged in");

  const nationalID = formData.get("natinalID");
  const [nationality, countryFlag] = formData.get("nationality").spllit("%");
  if (!/[a-zA-Z0-9]{6,12}$/.test(nationalID)) throw new Error("unvalid number");
  const updateData = { nationalID, nationality, countryFlag };

  const { error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }
  revalidatePath("/account/profile");
}
export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error(" must be logged in");

  const newBooking = {
    ...bookingData,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    guestId: session.user.guestId,
    totalPrice: 0,
    idPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };
  const { error } = await supabase.from("bookings").insert([newBooking]);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be created");
  }
  revalidatePath(`/cabins/${bookingData.cabinId}`);
}
export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session) throw new Error(" must be logged in");

  const guestBookings = getBookings("session.user.guestId");
  const guestBookingsIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingsIds.includes(bookingId))
    throw new Error("not allow to delete this booking");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }
  revalidatePath("/account/reservations");
  redirect("/cabins/thankyou");
}
export async function updateReservation(formData) {
  const bookingId = Number(formData.get("bookingId"));
  const session = await auth();
  if (!session) throw new Error(" must be logged in");

  const guestBookings = getBookings("session.user.guestId");
  const guestBookingsIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingsIds.includes(bookingId))
    throw new Error("not allow to update this booking");

  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  redirect("/account/reservations");
}
export async function signinAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
