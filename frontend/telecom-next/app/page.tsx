import { redirect } from "next/navigation";

export default function RootPage() {
  // Automatically routes visitor straight to the glassmorphic login interface
  redirect("/login");
}