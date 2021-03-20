import sizeOf from 'buffer-image-size'
import sharp from 'sharp'
import fs from 'fs'

import { TextDictionary } from '../mapper/create-text-dictionary'
import { Vertex } from './process-ocr'

// TODO: Process multi images (multi EmbeddedImage and multi Express.Multer.File)
export default (
  vertexesList: Vertex[][],
  { originalname, buffer }: Express.Multer.File
) => {
  const { width, height } = sizeOf(buffer)

  const destination = process.env.UPLOAD_FILE_DESTINATION ?? 'out'

  if (!fs.existsSync(destination)) {
    fs.mkdir(destination, { recursive: true }, err => {
      if (err) {
        throw err
      }
    })
  }

  sharp(buffer)
    .composite([
      {
        input: Buffer.from(`
          <svg width="${width}" height="${height}" viewBox="0, 0, ${width}, ${height}">
            ${createPolygon(vertexesList)}
          </svg>
        `),
      },
    ])
    .toFile(`${destination}/${originalname}`)
}

// Like <polygon points="0,0 10,0 10,10 0,10" />
const createPolygon = (vertexesList: Vertex[][]) =>
  Object.values(vertexesList).map(
    vertexes =>
      `<polygon points="${vertexes
        .map(v => Object.values(v).join())
        .join(' ')}" />`
  )
