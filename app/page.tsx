import Image from "next/image";
import { redirect } from "next/navigation";


export default function Home() {
  redirect("/register"); // 👈 yaha change kar sakta hai /login bhi
}