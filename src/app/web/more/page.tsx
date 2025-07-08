export default function WebMorePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">More Options</h1>
      <p className="text-gray-600 mb-8">
        Additional features and settings for your account.
      </p>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50">
              Profile Settings
            </button>
            <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50">
              Notification Preferences
            </button>
            <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50">
              Privacy Settings
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Tools & Resources</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50">
              EMI Calculator
            </button>
            <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50">
              Property Valuation
            </button>
            <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50">
              Market Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
