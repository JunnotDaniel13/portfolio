import { useCopy, type MessageKey } from '~/i18n/config'

export function SectionHeader({ id, number, titleKey, metaKey }: {
  id: string
  number: string
  titleKey: MessageKey
  metaKey: MessageKey
}) {
  const t = useCopy()
  return (
    <>
      <span className="numeral" aria-hidden="true">{number}</span>
      <h2 id={`h-${id}`} tabIndex={-1}>{t(titleKey)}</h2>
      <p className="mono meta" aria-hidden="true">{t(metaKey)}</p>
    </>
  )
}
