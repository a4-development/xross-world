import { NextApiResponse, NextApiRequest } from 'next'
import nextConnect from 'next-connect'
import multer from 'multer'

import processOcr, {
  ResponseBody as OcrResponseBody,
} from '../../utils/api/processor/process-ocr'
import createTextDictionary from '../../utils/api/mapper/create-text-dictionary'
import processBlindfold from '../../utils/api/processor/process-blindfold'
import createRequestImage from '../../utils/api/mapper/create-request-image'

// import data from '../../data/test-data.json'

type NextApiRequestWithFormData = NextApiRequest & {
  file: Express.Multer.File
}

export type ResponseBody = OcrResponseBody

const apiRoute = nextConnect()
  .use(multer({ storage: multer.memoryStorage() }).single('file'))
  .post(async ({ file }: NextApiRequestWithFormData, res: NextApiResponse) => {
    try {
      const { data } = await processOcr([createRequestImage(file)])
      console.log('✅ OCR process succeeded')

      const { requestId, images } = data
      const textDictionary = createTextDictionary(images as any)
      console.log(textDictionary)

      /** TODO: Process of generating crossword puzzle data */
      const dummyData = {
        text: 'そーすこーど',
        direction: 'horizontal',
        head: { x: 0, y: 3 },
      }
      const puzzleData = Object.keys(textDictionary)
        .slice(0, 20)
        .map((t, i) => ({ ...dummyData, id: i }))
      /** End of TODO */

      const blindfoldVertexes = puzzleData.map(
        data => textDictionary[data.id].boundingPoly.vertices
      )

      processBlindfold(blindfoldVertexes, file)

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
