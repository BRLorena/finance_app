import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { InvoiceManagement } from "@/components/invoice-management"

export default async function InvoicesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return <InvoiceManagement user={session.user} />
}