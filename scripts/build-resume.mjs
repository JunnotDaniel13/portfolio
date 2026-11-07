// Builds the LaTeX résumés (EN + FR) and publishes the PDFs to public/.
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, rmSync } from 'node:fs'

const out = 'cv'
mkdirSync(out, { recursive: true })

for (const name of ['cv', 'cv-fr']) {
  // Two passes so hyperref outlines / references settle.
  for (let pass = 0; pass < 2; pass++) {
    execFileSync(
      'pdflatex',
      ['-interaction=nonstopmode', '-halt-on-error', `-output-directory=${out}`, `${out}/${name}.tex`],
      { stdio: 'ignore' },
    )
  }
}

// English → Junnot-Daniel-Resume.pdf, French → Junnot-Daniel-CV.pdf.
copyFileSync(`${out}/cv.pdf`, 'public/Junnot-Daniel-Resume.pdf')
copyFileSync(`${out}/cv-fr.pdf`, 'public/Junnot-Daniel-CV.pdf')

// public/ now holds the published copies; drop the generated PDFs from cv/.
for (const file of ['cv.pdf', 'cv-fr.pdf', 'Junnot-Daniel-Resume.pdf', 'Junnot-Daniel-CV.pdf']) {
  rmSync(`${out}/${file}`, { force: true })
}
console.log('Résumé PDFs written to public/')
