import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login"); // Redirect to another page
  return null; // Avoid rendering anything after redirect
}
