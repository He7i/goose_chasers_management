import { CreditCard } from 'lucide-react'

export default function BillingPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Billing coming soon</h2>
        <p className="text-sm text-gray-400">Manage your subscription, invoices, and payment methods here.</p>
      </div>
    </div>
  )
}
