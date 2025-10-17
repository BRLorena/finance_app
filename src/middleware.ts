import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // For now, just pass through all requests
  return NextResponse.next()
}

export const config = {
  matcher: [],
}