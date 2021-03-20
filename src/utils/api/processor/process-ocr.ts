import axios from 'axios'
import { v4 } from 'uuid'

import { RequestImage } from '../mapper/create-request-image'

export interface RequestParam {
  images: RequestImage[]
  version: string
  lang: string
  requestId: string
  timestamp: number
}

export interface Vertex {
  x: number
  y: number
}

export interface TextField {
  valueType: 'ALL' | 'NUMERIC'
  inferText: string
  inferConfidence: number
  type: 'NORMAL' | 'MULTI_BOX' | 'CHECKBOX'
  lineBreak: boolean
  boundingPoly: {
    vertices: Vertex[]
  }
}

export interface ScannedImage {
  uid: string
  name: string
  inferResult: string
  message: string
  validationResult: {
    result: string
  }
  fields: TextField[]
}

export interface ResponseBody {
  version: string
  requestId: string
  images: ScannedImage[]
}

export default async (images: RequestImage[]) => {
  const { INVOKE_URL, SECRET_KEY } = process.env
  const res = await axios.post<ResponseBody>(
    INVOKE_URL,
    <RequestParam>{
      images,
      version: 'V2',
      lang: 'ja',
      requestId: v4(),
      timestamp: new Date().getTime(),
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-OCR-SECRET': SECRET_KEY,
      },
    }
  )
  return res
}
