import { redirect } from "next/navigation";

export default function Home() {
  redirect("/home"); // Redirect to another page
  return ; // Avoid rendering anything after redirect
}
