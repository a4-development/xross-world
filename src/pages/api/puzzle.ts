import { NextApiResponse, NextApiRequest } from 'next'
import nextConnect from 'next-connect'
import multer from 'multer'
import { createCrosswordWords } from 'crossword-generate'
import { BaseWord } from 'crossword-generate/lib/crossword'

import createTextDictionary from '../../utils/api/mapper/create-text-dictionary'
import processBlindfold from '../../utils/api/processor/process-blindfold'
import createRequestImage from '../../utils/api/mapper/create-request-image'
import processOcr from '../../utils/api/processor/process-ocr'

// import data from '../../data/test-data.json'

type NextApiRequestWithFormData = NextApiRequest & {
  file: Express.Multer.File
}

export type ResponseBody = {
  image?: string
  data?: ReturnType<typeof createCrosswordWords>
}

const apiRoute = nextConnect()
  .use(multer({ storage: multer.memoryStorage() }).single('file'))
  .post(async ({ file }: NextApiRequestWithFormData, res: NextApiResponse) => {
    try {
      const { data } = await processOcr([createRequestImage(file)])
      console.log('✅ OCR process succeeded')

      const { images } = data
      const textDictionary = createTextDictionary(images as any)

      const recipe = Object.entries(textDictionary).map(
        ([key, value]): BaseWord => ({
          id: key,
          text: value.inferText,
        })
      )
      const result = createCrosswordWords(recipe)
      const minX = Math.min(...result.map(d => d.head.x))
      const minY = Math.min(...result.map(d => d.head.y))
      const crossWordsData = result.map(data => ({
        ...data,
        head: {
          x: data.head.x - minX,
          y: data.head.y - minY,
        },
      }))

      console.log(crossWordsData)

      const blindfoldVertexes = crossWordsData.map(
        data => textDictionary[data.id].boundingPoly.vertices
      )

      const buffer = await processBlindfold(blindfoldVertexes, file)
      res.status(200).json({
        data: crossWordsData,
        image: `data:image/png;base64,${buffer.toString('base64')}`,
      })
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
