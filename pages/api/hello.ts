import { NextApiResponse, NextApiRequest } from 'next'
import axios from 'axios'
import { v4 } from 'uuid'
import nextConnect from 'next-connect'
import multer from 'multer'
import sharp from 'sharp'
import sizeOf from 'buffer-image-size'
import fs from 'fs'

type NextApiRequestWithFormData = NextApiRequest & {
  file: Express.Multer.File
}

interface OcrRequestParam {
  images: {
    name: string
    format: string
    data: string
  }[]
  version: string
  lang: string
  requestId: string
  timestamp: number
}

interface OcrResponseBody {
  version: string
  requestId: string
  images: {
    uid: string
    name: string
    inferResult: string
    message: string
    validationResult: {
      result: string
    }
    fields: {
      valueType: string
      boundingPoly: {
        vertices: { x: number; y: number }[]
        inferText: string
        inferConfidence: number
        type: string
        lineBreak: boolean
      }
    }[]
  }[]
}

export type ResponseBody = OcrResponseBody

const apiRoute = nextConnect()
  .use(multer({ storage: multer.memoryStorage() }).single('file'))
  .post(async (req: NextApiRequestWithFormData, res: NextApiResponse) => {
    const images = [
      {
        name: req.file.originalname,
        format: req.file.originalname.split('.').pop(),
        data: req.file.buffer.toString('base64'),
      },
    ]
    const { INVOKE_URL, SECRET_KEY } = process.env
    try {
      const { data } = await axios.post<OcrResponseBody>(
        INVOKE_URL,
        <OcrRequestParam>{
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
      console.log('✅ OCR process succeeded')

      const { width, height } = sizeOf(req.file.buffer)

      const destination = process.env.UPLOAD_FILE_DESTINATION ?? 'out'

      if (!fs.existsSync(destination)) {
        fs.mkdir(destination, { recursive: true }, err =>
          err ? Promise.reject(err) : Promise.resolve()
        )
      }

      sharp(req.file.buffer)
        .composite([
          {
            input: Buffer.from(`
            <svg width="${width}" height="${height}" viewBox="0, 0, ${width}, ${height}">
            ${data.images[0].fields.map(
              ({ boundingPoly: { vertices } }) => `
              <polygon
                points="${vertices.map(v => Object.values(v).join()).join(' ')}"
                stroke="blue"
                fill-opacity="0"
                stroke-opacity="0.8"
                stroke-width="5"
              />
            `
            )}
          </svg>`),
          },
        ])
        .toFile(`${destination}/${req.file.originalname}`)

      res.status(200).json(data)
    } catch (e) {
      res.status(400).json({ message: e })
    }
  })

export const config = {
  api: {
    bodyParser: false,
  },
}

export default apiRoute
