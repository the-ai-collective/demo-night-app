export default function Emoji({
  children,
}: {
  children: string
}) {
  const codePoints = children.includes("-") ?
    children.split("-").map((code: string) => Number(`0x${code}`)) : [Number(`0x${children}`)];

  if (codePoints.some((point) => Number.isNaN(point))) {
    return <></>
  }

  return <span>{String.fromCodePoint(...codePoints)}</span>
}