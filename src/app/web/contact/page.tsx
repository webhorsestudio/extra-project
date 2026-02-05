export default function WebContactPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="text-gray-600 mb-8">
        Get in touch with our team for any inquiries about properties or services.
      </p>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea rows={4} className="w-full px-3 py-2 border rounded-lg"></textarea>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
              Send Message
            </button>
          </form>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Phone</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
            <div>
              <h3 className="font-medium">Email</h3>
              <p className="text-gray-600">info@propertyapp.com</p>
            </div>
            <div>
              <h3 className="font-medium">Address</h3>
              <p className="text-gray-600">123 Main Street, City, State 12345</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 