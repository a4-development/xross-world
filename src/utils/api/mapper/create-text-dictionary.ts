import { ScannedImage, TextField } from '../processor/process-ocr'

const MIN_TEXT_LENGTH = 3
const MAX_TEXT_LENGTH = 10

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
    .filter(
      text =>
        MIN_TEXT_LENGTH < text.inferText.length &&
        text.inferText.length < MAX_TEXT_LENGTH
    ) // Remove short or long texts
    .filter(text => !/\d/.test(text.inferText)) // Remove texts contains number
    .reduce(
      (accumulator, current, index) => ({ ...accumulator, [index]: current }),
      {}
    ) // Convert array to object with index key
