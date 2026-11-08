import { education, experiences, personal, projects, skillGroups } from '~/data/portfolio'
import { useCopy, type MessageKey } from '~/i18n/config'
import { NoBreakHyphen } from './NoBreakHyphen'
import { SectionHeader } from './SectionHeader'

export function WorkSection() {
  const t = useCopy()
  return (
    <section id="work" aria-labelledby="h-work">
      <SectionHeader id="work" number="01" titleKey="sections.work" metaKey="sections.workMeta" />
      <ul className="work">
        {projects.map((project, index) => {
          const name = t(`projects.${project.id}.name`)
          const summary = t(`projects.${project.id}.summary`)
          const description = t(`projects.${project.id}.description`)
          const image = `/images/${project.image}`
          const demo = 'demo' in project ? project.demo : undefined // links render only when a real URL exists
          return (
            <li key={project.id}>
              <article className="proj">
                <picture>
                  <source type="image/webp" srcSet={`${image}-192.webp 192w, ${image}-480.webp 480w, ${image}-960.webp 960w`} sizes="(min-width:640px) 24rem, 6rem" />
                  <img className="thumb" src={`${image}-480.${project.imageExt}`} srcSet={`${image}-192.${project.imageExt} 192w, ${image}-480.${project.imageExt} 480w, ${image}-960.${project.imageExt} 960w`} sizes="(min-width:640px) 24rem, 6rem" width="960" height="600" alt={t(`projects.${project.id}.alt`)} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
                </picture>
                <div>
                  <h3>{name}</h3>
                  <div className="mono role"><NoBreakHyphen>{t(`projects.${project.id}.role`)}</NoBreakHyphen></div>
                  <p>{summary}</p>
                  <ul className="chips" aria-label="Technologies">{project.tools.map((tool) => <li key={tool}><NoBreakHyphen>{tool}</NoBreakHyphen></li>)}</ul>
                  {demo && (
                    <p className="proj-links">
                      <a href={demo} target="_blank" rel="noreferrer">{t('projects.demo')}<span className="sr-only"> — {name} {t('hero.newTab')}</span></a>
                    </p>
                  )}
                  {description.length > summary.length + 40 && (
                    <details>
                      <summary>{t('projects.details')}<span className="sr-only"> — {name}</span></summary>
                      <p>{description}</p>
                    </details>
                  )}
                  <p className="print-only">{description}</p>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function ExperienceSection() {
  const t = useCopy()
  return (
    <section id="experience" aria-labelledby="h-experience">
      <SectionHeader id="experience" number="02" titleKey="sections.experience" metaKey="sections.experienceMeta" />
      <dl className="exp">{experiences.map(({ id, company, bullets, stack }) => (
        <div key={id}>
          <dt>{t(`experience.${id}.title`)} · {company}</dt>
          <dd className="mono">{t(`experience.${id}.period`)}</dd>
          <dd>
            <ul className="bullets">{Array.from({ length: bullets }, (_, index) => (
              <li key={index}>{t(`experience.${id}.b${index + 1}` as MessageKey)}</li>
            ))}</ul>
          </dd>
          <dd className="stack"><strong>{t('experience.stack')}</strong> {stack.join(', ')}</dd>
        </div>
      ))}</dl>
    </section>
  )
}

export function AboutSection() {
  const t = useCopy()
  return (
    <section id="about" aria-labelledby="h-about">
      <SectionHeader id="about" number="03" titleKey="sections.about" metaKey="sections.aboutMeta" />
      <div className="about">
        <picture><source type="image/webp" srcSet="/images/profile.webp" /><img src="/images/profile.png" width="220" height="220" alt={t('about.imageAlt')} loading="lazy" decoding="async" /></picture>
        <div><p>{t('about.first')}</p><p>{t('about.second')}</p></div>
      </div>
    </section>
  )
}

export function SkillsSection() {
  const t = useCopy()
  return (
    <section id="skills" className="sk" aria-labelledby="h-skills">
      <SectionHeader id="skills" number="04" titleKey="sections.skills" metaKey="sections.skillsMeta" />
      {skillGroups.map((group) => (
        <div className="skill-group" key={group.id}>
          <h3>{t(`skills.${group.id}` as MessageKey)}</h3>
          <ul className="chips">{group.skills.map((skill) => <li key={skill}><NoBreakHyphen>{skill}</NoBreakHyphen></li>)}</ul>
        </div>
      ))}
    </section>
  )
}

export function EducationSection() {
  const t = useCopy()
  return (
    <section id="education" aria-labelledby="h-education">
      <SectionHeader id="education" number="05" titleKey="sections.education" metaKey="sections.educationMeta" />
      <ol className="edu">{education.map(({ id, institution }) => (
        <li key={id}>
          <strong>{t(`education.${id}.title`)}</strong>
          <div>{institution}</div>
          <div className="mono">{t(`education.${id}.period`)}</div>
          <p className="course">{t(`education.${id}.coursework`)}</p>
        </li>
      ))}</ol>
    </section>
  )
}

export function ContactDetails() {
  const t = useCopy()
  return (
    <div>
      <address>
        <a href={`mailto:${personal.email}`}>{personal.email}</a>
        <a href={`tel:${personal.phoneHref}`}>{personal.phone}</a>
        <span>{personal.address}</span>
      </address>
      <ul className="soc">{personal.social.map(({ label, href }) => <li key={label}><a href={href} target="_blank" rel="noreferrer">{label}<span className="sr-only"> {t('hero.newTab')}</span></a></li>)}</ul>
    </div>
  )
}

export function SiteFooter() {
  const t = useCopy()
  return <footer><span>{t('footer.copyright')} · </span><a href={personal.source} target="_blank" rel="noreferrer">{t('footer.source')}<span className="sr-only"> {t('hero.newTab')}</span></a></footer>
}
