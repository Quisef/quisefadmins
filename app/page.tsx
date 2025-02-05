import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard"); // Redirect to another page
  return ; // Avoid rendering anything after redirect
}
