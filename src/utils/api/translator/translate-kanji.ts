import Kuroshiro from 'kuroshiro'
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji'

const kuroshiro = new Kuroshiro()
kuroshiro.init(new KuromojiAnalyzer())

export default async (text: string): Promise<string> => {
  return await kuroshiro.convert(text, { to: 'hiragana' })
}
