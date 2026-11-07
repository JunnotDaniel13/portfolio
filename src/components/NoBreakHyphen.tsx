const hyphenatedWord = /(\b[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+\b)/gu

export function NoBreakHyphen({ children }: { children: string }) {
  return <>{children.split(hyphenatedWord).map((part, index) => part.length <= 14 && part.includes('-')
    ? <span className="nb" key={index}>{part}</span>
    : part)}</>
}
