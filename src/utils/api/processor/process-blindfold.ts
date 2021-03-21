import sizeOf from 'buffer-image-size'
import sharp from 'sharp'

import { Vertex } from './process-ocr'

// TODO: Process multi images (multi EmbeddedImage and multi Express.Multer.File)
export default (
  vertexesList: Vertex[][],
  { buffer }: Express.Multer.File
) => {
  const { width, height } = sizeOf(buffer)

  return sharp(buffer)
    .composite([
      {
        input: Buffer.from(`
          <svg width="${width}" height="${height}" viewBox="0, 0, ${width}, ${height}">
            ${createPolygon(vertexesList)}
          </svg>
        `),
      },
    ])
    .toBuffer()
}

// Like <polygon points="0,0 10,0 10,10 0,10" />
const createPolygon = (vertexesList: Vertex[][]) =>
  Object.values(vertexesList).map(
    vertexes =>
      `<polygon points="${vertexes
        .map(v => Object.values(v).join())
        .join(' ')}" />`
  )
