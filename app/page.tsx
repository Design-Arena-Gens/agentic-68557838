'use client'

import { useState } from 'react'
import MetadataMindMap from './components/MetadataMindMap'

export default function Home() {
  const [credentials, setCredentials] = useState({
    instanceUrl: '',
    accessToken: ''
  })
  const [isConnected, setIsConnected] = useState(false)
  const [metadata, setMetadata] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    if (!credentials.instanceUrl || !credentials.accessToken) {
      setError('Please provide both Instance URL and Access Token')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch metadata')
      }

      setMetadata(data)
      setIsConnected(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setMetadata(null)
    setCredentials({ instanceUrl: '', accessToken: '' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!isConnected ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Salesforce Metadata Mind Map
              </h1>
              <p className="text-gray-600">
                Visualize your org's metadata in an interactive mind map
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instance URL
                </label>
                <input
                  type="text"
                  placeholder="https://yourinstance.salesforce.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={credentials.instanceUrl}
                  onChange={(e) =>
                    setCredentials({ ...credentials, instanceUrl: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token
                </label>
                <input
                  type="password"
                  placeholder="Your Salesforce access token"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={credentials.accessToken}
                  onChange={(e) =>
                    setCredentials({ ...credentials, accessToken: e.target.value })
                  }
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : 'Connect & Visualize'}
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>How to get your Access Token:</strong><br />
                  1. Log in to Salesforce<br />
                  2. Go to Setup → Apps → App Manager<br />
                  3. Create a Connected App with OAuth settings<br />
                  4. Use OAuth 2.0 flow to get an access token
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen flex flex-col">
          <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Salesforce Metadata Mind Map
            </h1>
            <button
              onClick={handleDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Disconnect
            </button>
          </div>
          <div className="flex-1">
            <MetadataMindMap metadata={metadata} />
          </div>
        </div>
      )}
    </main>
  )
}
