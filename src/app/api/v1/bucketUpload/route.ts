import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userName = formData.get('userName') as string
    const category = formData.get('category') as string // e.g., 'taste-videos', 'best-videos', 'growth-videos'

    if (!file || !userName || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const uniqueName = `${crypto.randomUUID()}-${file.name}`
    const destinationPath = `${userName}/${category}/${uniqueName}`
    const gcsUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${destinationPath}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const response = await fetch(gcsUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: buffer,
    })

    if (!response.ok) {
      throw new Error(`GCS upload failed: ${response.statusText}`)
    }

    return NextResponse.json({
      success: true,
      url: gcsUrl,
      path: destinationPath,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
