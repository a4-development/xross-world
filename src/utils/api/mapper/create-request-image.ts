export interface RequestImage {
  name: string
  format: string
  data: string
}

export default ({
  originalname,
  buffer,
}: Express.Multer.File): RequestImage => ({
  name: originalname,
  format: originalname.split('.').pop(),
  data: buffer.toString('base64'),
})
