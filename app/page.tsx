import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login"); // Redirect to another page
  return ; // Avoid rendering anything after redirect
}
