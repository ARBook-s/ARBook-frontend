import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  PageNumber,
  ImageRun,
  LevelFormat,
} from 'docx'
import {
  title,
  annotation,
  sections,
  tableCaption,
  tableHeaders,
  tableRows,
  table2Caption,
  table2Headers,
  table2Rows,
  sources,
  appendixNotes,
} from './nir-report-content.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outPath = path.join(root, 'docs', 'Отчет_НИР_ARBook.docx')

const FONT = 'Times New Roman'
const SIZE = 28 // 14pt
const SIZE_SM = 24
const GREEN = '0D5C63'
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: '999999' }
const cellBorders = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 200, line: 360 },
    alignment: opts.align ?? AlignmentType.JUSTIFIED,
    indent: opts.indent === false ? undefined : { firstLine: 360 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: opts.size ?? SIZE,
        bold: opts.bold,
        italics: opts.italics,
      }),
    ],
  })
}

function h(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, font: FONT, size: level === HeadingLevel.HEADING_1 ? 32 : 28, bold: true })],
  })
}

function caption(text) {
  return new Paragraph({
    spacing: { before: 120, after: 200 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: FONT, size: SIZE_SM, italics: true })],
  })
}

function cell(text, opts = {}) {
  return new TableCell({
    borders: cellBorders,
    width: { size: opts.width ?? 20, type: WidthType.PERCENTAGE },
    shading: opts.header ? { fill: 'E8F2F2' } : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: FONT,
            size: 20,
            bold: !!opts.header,
          }),
        ],
      }),
    ],
  })
}

function makeTable(headers, rows, widths) {
  const header = new TableRow({
    children: headers.map((t, i) => cell(t, { header: true, width: widths[i] })),
  })
  const body = rows.map(
    (r) => new TableRow({ children: r.map((t, i) => cell(t, { width: widths[i] })) }),
  )
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [header, ...body],
  })
}

async function maybeImage(rel, captionText) {
  const abs = path.join(root, rel)
  if (!fs.existsSync(abs)) return []
  const data = fs.readFileSync(abs)
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 80 },
      children: [
        new ImageRun({
          type: 'png',
          data,
          transformation: { width: 280, height: 480 },
        }),
      ],
    }),
    caption(captionText),
  ]
}

function toc() {
  const items = [
    'Аннотация',
    'Введение',
    '1 Анализ предметной области и постановка задач второго этапа',
    '2 Фактические результаты разработки системы ARBook',
    '3 Архитектура и реализация клиентской части',
    '4 Цель, задачи, технические параметры и конструктивные требования по договору',
    '5 Архитектура и реализация серверной части',
    '6 Диагностические средства и экспериментальные материалы',
    '7 Проектные решения по направлениям календарного плана',
    '8 Анализ соответствия календарному плану',
    'Заключение',
    'Список использованных источников',
    'Приложения',
  ]
  return [
    h('Содержание'),
    ...items.map(
      (t) =>
        new Paragraph({
          spacing: { after: 80, line: 360 },
          children: [new TextRun({ text: t, font: FONT, size: SIZE })],
        }),
    ),
  ]
}

const children = []

children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: 'ФОНД СОДЕЙСТВИЯ РАЗВИТИЮ МАЛЫХ ФОРМ ПРЕДПРИЯТИЙ В НАУЧНО-ТЕХНИЧЕСКОЙ СФЕРЕ',
        font: FONT,
        size: 24,
        bold: true,
      }),
    ],
  }),
)

for (const line of title.split('\n')) {
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: line, font: FONT, size: 32, bold: true })],
    }),
  )
}

children.push(
  p(
    'Документ подготовлен по ГОСТ 7.32–2017. Титульный лист в системе ФСИ формируется автоматически и в файл не включается. В тексте разделены фактически реализованные механизмы, проектные решения и работы, не подтверждённые исходным кодом.',
    { align: AlignmentType.CENTER, indent: false, italics: true, size: SIZE_SM },
  ),
)

children.push(h('Аннотация'))
for (const para of annotation.split('\n\n')) {
  children.push(p(para.trim()))
}

children.push(...toc())

for (const section of sections) {
  children.push(h(section.heading))
  for (const para of section.paragraphs) children.push(p(para))
  if (section.sub) {
    for (const sub of section.sub) {
      children.push(h(sub.heading, HeadingLevel.HEADING_2))
      for (const para of sub.paragraphs) children.push(p(para))
    }
  }
  if (section.heading.startsWith('2 ')) {
    const imgs = await maybeImage(
      'docs/screenshots/01-start-screen.png',
      'Рисунок 1 — Стартовый экран клиентского приложения ARBook (запуск AR-сессии)',
    )
    children.push(...imgs)
  }
  if (section.heading.startsWith('3 ')) {
    const imgs = await maybeImage(
      'docs/screenshots/05-ar-camera-active.png',
      'Рисунок 2 — Активная AR-сессия: инициализация камеры и подсказка включения звука',
    )
    children.push(...imgs)
  }
  if (section.heading.startsWith('4 Цель')) {
    children.push(caption(table2Caption))
    children.push(makeTable(table2Headers, table2Rows, [28, 36, 36]))
    children.push(
      p(
        'Примечание. Значения столбца «Целевое значение» описывают планируемую продукцию по договору (будущее время спецификации). Столбец аналогов носит справочный характер по открытым описаниям SDK и гарнитур и не является протоколом сравнительного стенда.',
        { indent: false, italics: true, size: SIZE_SM },
      ),
    )
  }
}

children.push(caption(tableCaption))
children.push(makeTable(tableHeaders, tableRows, [8, 24, 12, 28, 28]))
children.push(
  p(
    'Примечание. Статус «частично» означает наличие связанного механизма, не покрывающего формулировку пункта плана целиком. Статус «проектно» означает наличие технического решения в настоящем отчёте при отсутствии подтверждающего кода.',
    { indent: false, italics: true, size: SIZE_SM },
  ),
)

children.push(h('Список использованных источников'))
sources.forEach((s, i) => {
  children.push(
    new Paragraph({
      spacing: { after: 120, line: 360 },
      indent: { left: 360, hanging: 360 },
      children: [new TextRun({ text: `${i + 1}. ${s}`, font: FONT, size: SIZE })],
    }),
  )
})

children.push(h('Приложения'))
for (const note of appendixNotes) children.push(p(note))

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: SIZE } } },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickStyle: true,
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 },
        run: { font: FONT, size: 32, bold: true, color: GREEN },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickStyle: true,
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 },
        run: { font: FONT, size: 28, bold: true, color: GREEN },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'src-num',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT }],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1134, bottom: 1134, left: 1418, right: 850 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'Отчёт НИР · ARBook · второй этап',
                  font: FONT,
                  size: 18,
                  color: '666666',
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: '', font: FONT, size: 20 }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
})

const buf = await Packer.toBuffer(doc)
fs.writeFileSync(outPath, buf)
console.log('Wrote', outPath, 'bytes', buf.length)
