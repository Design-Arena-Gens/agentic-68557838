import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { instanceUrl, accessToken } = await request.json()

    if (!instanceUrl || !accessToken) {
      return NextResponse.json(
        { error: 'Instance URL and Access Token are required' },
        { status: 400 }
      )
    }

    const jsforce = require('jsforce')
    const conn = new jsforce.Connection({
      instanceUrl,
      accessToken,
      version: '59.0'
    })

    const metadataTypes = [
      'CustomObject',
      'Flow',
      'ApexClass',
      'ApexTrigger',
      'VisualforcePage',
      'AuraDefinitionBundle',
      'LightningComponentBundle',
      'Profile',
      'PermissionSet'
    ]

    const describeResult = await conn.metadata.describe('59.0')

    const metadataPromises = metadataTypes.map(async (type) => {
      try {
        const result = await conn.metadata.list({ type })
        return { type, data: Array.isArray(result) ? result : [result].filter(Boolean) }
      } catch (err) {
        console.error(`Error fetching ${type}:`, err)
        return { type, data: [] }
      }
    })

    const metadataResults = await Promise.all(metadataPromises)

    let orgInfo
    try {
      orgInfo = await conn.query("SELECT Name, OrganizationType FROM Organization LIMIT 1")
    } catch (err) {
      orgInfo = { records: [{ Name: 'Organization' }] }
    }

    const metadata: any = {
      organizationName: orgInfo.records && orgInfo.records[0] ? orgInfo.records[0].Name : 'Salesforce Org',
      customObjects: [],
      flows: [],
      apexClasses: [],
      apexTriggers: [],
      visualforcePages: [],
      lightningComponents: [],
      profiles: [],
      permissionSets: []
    }

    metadataResults.forEach((result) => {
      switch (result.type) {
        case 'CustomObject':
          metadata.customObjects = result.data
          break
        case 'Flow':
          metadata.flows = result.data
          break
        case 'ApexClass':
          metadata.apexClasses = result.data
          break
        case 'ApexTrigger':
          metadata.apexTriggers = result.data
          break
        case 'VisualforcePage':
          metadata.visualforcePages = result.data
          break
        case 'AuraDefinitionBundle':
        case 'LightningComponentBundle':
          metadata.lightningComponents = [...metadata.lightningComponents, ...result.data]
          break
        case 'Profile':
          metadata.profiles = result.data
          break
        case 'PermissionSet':
          metadata.permissionSets = result.data
          break
      }
    })

    return NextResponse.json(metadata)
  } catch (error: any) {
    console.error('Metadata API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch metadata' },
      { status: 500 }
    )
  }
}
