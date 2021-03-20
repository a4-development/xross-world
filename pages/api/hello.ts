import type { NextApiResponse, NextApiRequest } from 'next'
import axios from 'axios'
import { v4 } from 'uuid'

import nextConnect from 'next-connect';
import multer from 'multer';


type NextApiRequestWithFormData = NextApiRequest & {
  file: Express.Multer.File,
}

interface OcrRequestParam {
  images: {
    name: string,
    format: string,
    data: string
  }[],
  version: string,
  lang: string,
  requestId: string,
  timestamp: number
}

interface OcrResponseBody {
  version: string
  requestId: string
  images: {
    uid: string,
    name: string,
    inferResult: string,
    message: string,
    validationResult: {
      result: string
    },
    fields: {
      valueType: string,
      boundingPoly: {
        vertices: { x: number, y: number }[],
        inferText: string,
        inferConfidence: number,
        type: string,
        lineBreak: boolean
      },
    }[]
  }[]
}

export type ResponseBody = OcrResponseBody

const apiRoute = nextConnect()
  .use(multer({ storage: multer.memoryStorage() }).single('file'))
  .post(async (req: NextApiRequestWithFormData, res: NextApiResponse) => {
    const images = [{
      name: req.file.originalname,
      format: 'jpg',
      data: req.file.buffer.toString('base64'),
    }]
    const { INVOKE_URL, SECRET_KEY } = process.env
    try {
      const { data } = await axios.post<OcrResponseBody>(INVOKE_URL, <OcrRequestParam> {
        images,
        version: 'V2',
        lang: 'ja',
        requestId: v4(),
        timestamp: new Date().getTime(),
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-OCR-SECRET': SECRET_KEY
        }
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(400).json({ message: e })
    }
  })

export const config = {
  api: {
    bodyParser: false
  },
};

export default apiRoute;
