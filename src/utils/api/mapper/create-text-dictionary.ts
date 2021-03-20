import { ScannedImage, TextField } from '../processor/process-ocr'

export type TextDictionary = Record<
  number,
  Pick<TextField, 'inferText' | 'inferConfidence' | 'boundingPoly'>
>

export default (images: ScannedImage[]): TextDictionary =>
  images
    .flatMap(image =>
      image.fields.map(({ inferText, inferConfidence, boundingPoly }) => ({
        inferText,
        inferConfidence,
        boundingPoly,
      }))
    ) // Extract properties necessary
    .sort((a, b) => b.inferConfidence - a.inferConfidence) // Sort by reliability
    .filter(
      (text, index, self) =>
        index === self.findIndex(t => t.inferText === text.inferText)
    ) // Remove duplicate elements
    .reduce(
      (accumulator, current, index) => ({ ...accumulator, [index]: current }),
      {}
    ) // Convert array to object with index key
