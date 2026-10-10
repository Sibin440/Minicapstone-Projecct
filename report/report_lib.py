"""
Shared library for building the Creamy Bites mini project report (PDF).

All typography / colour / page-setup decisions live here so the whole document
can be re-skinned in one place (e.g. to match a sample report exactly).
"""

import math

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak,
    NextPageTemplate, Table, TableStyle, KeepTogether, HRFlowable,
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon, Ellipse, Circle

# =============================================================================
# 1.  TYPOGRAPHY  --  change these to re-skin the entire document
# =============================================================================

FONT_BODY   = 'Times-Roman'
FONT_BOLD   = 'Times-Bold'
FONT_ITALIC = 'Times-Italic'
FONT_BI     = 'Times-BoldItalic'
FONT_MONO   = 'Courier'

# colours
CLR_BODY    = colors.black                      # body text colour
CLR_HEAD    = colors.HexColor('#1F3864')        # chapter / section heading colour
CLR_SUB     = colors.black                      # sub-section heading colour
CLR_RULE    = colors.HexColor('#1F3864')        # horizontal rules / table borders
CLR_TBLHDR  = colors.HexColor('#D9E2F3')        # table header fill
CLR_TBLALT  = colors.HexColor('#F2F5FB')        # table alternate-row fill
CLR_CAPTION = colors.black
CLR_PAGENO  = colors.black

# sizes (pt)
SZ_BODY     = 12
SZ_LEAD     = 18          # 1.5 line spacing on a 12pt body
SZ_CHAPTER  = 16
SZ_SECTION  = 14
SZ_SUBSECT  = 12.5
SZ_CAPTION  = 11
SZ_TABLE    = 9.5
SZ_PAGENO   = 11

# =============================================================================
# 2.  PAGE SETUP
# =============================================================================

PAGE_W, PAGE_H = A4
MARGIN_L = 1.25 * inch      # wider left margin for binding
MARGIN_R = 0.75 * inch
MARGIN_T = 0.90 * inch
MARGIN_B = 0.90 * inch

FRAME_W = PAGE_W - MARGIN_L - MARGIN_R
FRAME_H = PAGE_H - MARGIN_T - MARGIN_B

TITLE = 'CREAMY BITES'
SUBTITLE = ('Online Bakery E-Commerce Platform with Intelligent Sales Prediction, '
            'Loyalty Management and AI Shopping Assistant')

# =============================================================================
# 3.  PARAGRAPH STYLES
# =============================================================================

def build_styles():
    S = {}

    S['Body'] = ParagraphStyle(
        'Body', fontName=FONT_BODY, fontSize=SZ_BODY, leading=SZ_LEAD,
        alignment=TA_JUSTIFY, textColor=CLR_BODY, spaceAfter=8,
        firstLineIndent=0)

    S['BodyNoJustify'] = ParagraphStyle(
        'BodyNoJustify', parent=S['Body'], alignment=TA_LEFT)

    S['Chapter'] = ParagraphStyle(
        'Chapter', fontName=FONT_BOLD, fontSize=SZ_CHAPTER, leading=SZ_CHAPTER + 5,
        alignment=TA_CENTER, textColor=CLR_HEAD, spaceBefore=6, spaceAfter=16)

    S['Section'] = ParagraphStyle(
        'Section', fontName=FONT_BOLD, fontSize=SZ_SECTION, leading=SZ_SECTION + 4,
        alignment=TA_LEFT, textColor=CLR_HEAD, spaceBefore=14, spaceAfter=7)

    S['SubSection'] = ParagraphStyle(
        'SubSection', fontName=FONT_BOLD, fontSize=SZ_SUBSECT, leading=SZ_SUBSECT + 4,
        alignment=TA_LEFT, textColor=CLR_SUB, spaceBefore=10, spaceAfter=5)

    S['ChapterNum'] = ParagraphStyle(
        'ChapterNum', fontName=FONT_BOLD, fontSize=13, leading=17,
        alignment=TA_CENTER, textColor=CLR_HEAD, spaceBefore=6, spaceAfter=3)

    S['FrontH'] = ParagraphStyle(
        'FrontH', fontName=FONT_BOLD, fontSize=SZ_CHAPTER, leading=SZ_CHAPTER + 5,
        alignment=TA_CENTER, textColor=CLR_HEAD, spaceBefore=6, spaceAfter=18)

    S['TocH'] = ParagraphStyle(
        'TocH', fontName=FONT_BOLD, fontSize=SZ_CHAPTER, leading=SZ_CHAPTER + 5,
        alignment=TA_CENTER, textColor=CLR_HEAD, spaceBefore=0, spaceAfter=16)

    S['FigCaption'] = ParagraphStyle(
        'FigCaption', fontName=FONT_BOLD, fontSize=SZ_CAPTION, leading=SZ_CAPTION + 4,
        alignment=TA_CENTER, textColor=CLR_CAPTION, spaceBefore=8, spaceAfter=14)

    S['TableCaption'] = ParagraphStyle(
        'TableCaption', fontName=FONT_BOLD, fontSize=SZ_CAPTION, leading=SZ_CAPTION + 4,
        alignment=TA_CENTER, textColor=CLR_CAPTION, spaceBefore=8, spaceAfter=14)

    S['Bullet'] = ParagraphStyle(
        'Bullet', fontName=FONT_BODY, fontSize=SZ_BODY, leading=SZ_LEAD,
        alignment=TA_JUSTIFY, textColor=CLR_BODY, leftIndent=28, bulletIndent=10,
        spaceAfter=5)

    S['Code'] = ParagraphStyle(
        'Code', fontName=FONT_MONO, fontSize=9, leading=12.5,
        alignment=TA_LEFT, textColor=CLR_BODY, leftIndent=16, spaceBefore=4,
        spaceAfter=8)

    # ---- title page ----
    S['TpTop'] = ParagraphStyle(
        'TpTop', fontName=FONT_BOLD, fontSize=13, leading=17, alignment=TA_CENTER,
        textColor=CLR_BODY)
    S['TpTitle'] = ParagraphStyle(
        'TpTitle', fontName=FONT_BOLD, fontSize=19, leading=25, alignment=TA_CENTER,
        textColor=CLR_HEAD)
    S['TpSub'] = ParagraphStyle(
        'TpSub', fontName=FONT_BOLD, fontSize=13, leading=18, alignment=TA_CENTER,
        textColor=CLR_BODY)
    S['TpBody'] = ParagraphStyle(
        'TpBody', fontName=FONT_BODY, fontSize=12, leading=18, alignment=TA_CENTER,
        textColor=CLR_BODY)
    S['TpBold'] = ParagraphStyle(
        'TpBold', fontName=FONT_BOLD, fontSize=12.5, leading=19, alignment=TA_CENTER,
        textColor=CLR_BODY)
    S['TpDept'] = ParagraphStyle(
        'TpDept', fontName=FONT_BOLD, fontSize=13, leading=19, alignment=TA_CENTER,
        textColor=CLR_HEAD)

    # ---- misc ----
    S['Centre'] = ParagraphStyle(
        'Centre', fontName=FONT_BODY, fontSize=SZ_BODY, leading=SZ_LEAD,
        alignment=TA_CENTER, textColor=CLR_BODY)
    S['Cell'] = ParagraphStyle(
        'Cell', fontName=FONT_BODY, fontSize=SZ_TABLE, leading=SZ_TABLE + 3.2,
        alignment=TA_LEFT, textColor=CLR_BODY)
    S['CellC'] = ParagraphStyle(
        'CellC', parent=S['Cell'], alignment=TA_CENTER)
    S['CellH'] = ParagraphStyle(
        'CellH', fontName=FONT_BOLD, fontSize=SZ_TABLE, leading=SZ_TABLE + 3.2,
        alignment=TA_CENTER, textColor=CLR_BODY)

    return S


# =============================================================================
# 4.  DOCUMENT TEMPLATE (page numbers + TOC / LoF / LoT collection)
# =============================================================================

ROMAN = [(1000, 'm'), (900, 'cm'), (500, 'd'), (400, 'cd'), (100, 'c'), (90, 'xc'),
         (50, 'l'), (40, 'xl'), (10, 'x'), (9, 'ix'), (5, 'v'), (4, 'iv'), (1, 'i')]


def to_roman(n):
    out = ''
    for val, sym in ROMAN:
        while n >= val:
            out += sym
            n -= val
    return out


class ReportDoc(BaseDocTemplate):
    """Collects TOC / List-of-Figures / List-of-Tables entries and draws
    page numbers (lower-case roman for the front matter, arabic for the body).

    `body_start` is the 1-based canvas page on which Chapter 1 falls.  It is
    discovered on the first pass and fed back on later passes, so the folios
    and the index page numbers converge after two or three passes.
    """

    def __init__(self, filename, store, body_start=None, **kw):
        self.store = store
        self.body_start = body_start
        self._detected_body_start = None
        BaseDocTemplate.__init__(
            self, filename, pagesize=A4,
            leftMargin=MARGIN_L, rightMargin=MARGIN_R,
            topMargin=MARGIN_T, bottomMargin=MARGIN_B,
            title='Creamy Bites - Mini Project Report',
            author='Audhidya Sibin R.',
            subject='Online Bakery E-Commerce Platform',
            **kw)

        frame = Frame(MARGIN_L, MARGIN_B, FRAME_W, FRAME_H, id='f',
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(id='all', frames=[frame], onPage=self._decorate),
        ])

    # -- page decoration ------------------------------------------------
    def _label(self, page=None):
        p = page if page is not None else self.page
        bs = self.body_start
        if bs and p >= bs:
            return str(p - bs + 1)
        return to_roman(p)

    def _decorate(self, canv, doc):
        p = self.page
        if p == 1:                      # title page carries no folio
            return
        canv.saveState()
        bs = self.body_start
        if bs and p >= bs:
            canv.setStrokeColor(CLR_RULE)
            canv.setLineWidth(0.6)
            canv.line(MARGIN_L, PAGE_H - MARGIN_T + 14,
                      PAGE_W - MARGIN_R, PAGE_H - MARGIN_T + 14)
        canv.setFont(FONT_BODY, SZ_PAGENO)
        canv.setFillColor(CLR_PAGENO)
        canv.drawCentredString(PAGE_W / 2.0, MARGIN_B - 22, self._label(p))
        canv.restoreState()

    # -- entry collection ------------------------------------------------
    def afterFlowable(self, flowable):
        if not isinstance(flowable, Paragraph):
            return
        style = flowable.style.name
        text = flowable.getPlainText().strip()

        if style == 'Chapter':
            if self._detected_body_start is None:
                self._detected_body_start = self.page
            self.store['toc'].append((0, text, self.page))
        elif style == 'FrontH':
            self.store['toc'].append((0, text, self.page))
        elif style == 'Section':
            self.store['toc'].append((1, text, self.page))
        elif style == 'SubSection':
            self.store['toc'].append((2, text, self.page))
        elif style == 'FigCaption':
            self.store['lof'].append((0, text, self.page))
        elif style == 'TableCaption':
            self.store['lot'].append((0, text, self.page))

    @property
    def detected_body_start(self):
        return self._detected_body_start

    def page_formatter(self):
        bs = self.body_start

        def fmt(page):
            if bs and page >= bs:
                return str(page - bs + 1)
            return to_roman(page)
        return fmt


# =============================================================================
# 5.  SMALL FLOWABLE HELPERS
# =============================================================================

def para(txt, style):
    return Paragraph(txt, style)


def bullets(items, S, style='Bullet'):
    return [Paragraph(t, S[style], bulletText='\u2022') for t in items]


def bullets_num(items, S):
    out = []
    for i, t in enumerate(items, 1):
        out.append(Paragraph(t, S['Bullet'], bulletText='%d.' % i))
    return out


def hrule(width=FRAME_W, thick=0.8, space=6):
    return HRFlowable(width='100%', thickness=thick, color=CLR_RULE,
                      spaceBefore=space, spaceAfter=space)


def make_table(header, rows, widths, S, align_center_cols=(), font_size=SZ_TABLE):
    """header: list[str]; rows: list[list[str]]; widths: list[float] (pt)."""
    data = [[Paragraph('<b>%s</b>' % h, S['CellH']) for h in header]]
    for r in rows:
        line = []
        for i, c in enumerate(r):
            st = S['CellC'] if i in align_center_cols else S['Cell']
            line.append(Paragraph(str(c), st))
        data.append(line)

    t = Table(data, colWidths=widths, repeatRows=1, hAlign='CENTER')
    style = [
        ('GRID', (0, 0), (-1, -1), 0.6, CLR_RULE),
        ('BACKGROUND', (0, 0), (-1, 0), CLR_TBLHDR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]
    for i in range(2, len(data), 2):
        style.append(('BACKGROUND', (0, i), (-1, i), CLR_TBLALT))
    t.setStyle(TableStyle(style))
    return t


def figure_placeholder(text, height=190):
    """A clearly-marked frame the student drops a screenshot into."""
    d = Drawing(FRAME_W, height)
    d.add(Rect(2, 2, FRAME_W - 4, height - 4,
               fillColor=colors.HexColor('#F4F4F4'),
               strokeColor=colors.HexColor('#808080'),
               strokeWidth=1, strokeDashArray=[5, 3]))
    d.add(String(FRAME_W / 2.0, height / 2.0 + 18, 'INSERT SCREENSHOT',
                 fontName=FONT_BOLD, fontSize=11,
                 fillColor=colors.HexColor('#595959'), textAnchor='middle'))
    d.add(String(FRAME_W / 2.0, height / 2.0 - 2, text,
                 fontName=FONT_ITALIC, fontSize=9.5,
                 fillColor=colors.HexColor('#595959'), textAnchor='middle'))
    d.add(String(FRAME_W / 2.0, height / 2.0 - 22, '(paste your screen capture here)',
                 fontName=FONT_BODY, fontSize=8,
                 fillColor=colors.HexColor('#8C8C8C'), textAnchor='middle'))
    return d


# =============================================================================
# 6.  DIAGRAM PRIMITIVES (vector drawings)
# =============================================================================

LINE = colors.HexColor('#1F3864')
FILL_HDR = colors.HexColor('#1F3864')
FILL_BOX = colors.HexColor('#DEEAF6')
FILL_ALT = colors.HexColor('#F2F5FB')
FILL_STORE = colors.HexColor('#FFF2CC')
FILL_ACTOR = colors.HexColor('#FFF2CC')
GREY = colors.HexColor('#595959')


def node(d, x, y, w, h, title, lines=(), fill=FILL_BOX, stroke=LINE,
         tsize=9, lsize=7.6, title_font=FONT_BOLD, title_color=colors.white,
         header=True, radius=0, line_color=None):
    """Rounded/plain rectangle with an optional filled title bar."""
    d.add(Rect(x, y, w, h, fillColor=fill, strokeColor=stroke,
               strokeWidth=1.1, rx=radius))
    lc = line_color or colors.black
    if header and title:
        bh = tsize + 6
        d.add(Rect(x, y + h - bh, w, bh, fillColor=FILL_HDR, strokeColor=None))
        d.add(String(x + w / 2.0, y + h - bh + 3.5, title, fontName=FONT_BOLD,
                     fontSize=tsize, fillColor=colors.white, textAnchor='middle'))
        cy = y + h - bh - (lsize + 4)
    else:
        if title:
            d.add(String(x + w / 2.0, y + h / 2.0 + (lsize + 2) * (len(lines)) / 2.0 + 2,
                         title, fontName=title_font, fontSize=tsize,
                         fillColor=lc, textAnchor='middle'))
        cy = y + h / 2.0 - 4 + (lsize + 2) * (len(lines) - 1) / 2.0 - (lsize + 2) + 4
        cy = y + h / 2.0 - 4 + (lsize + 2.5) * (len(lines) - 1) / 2.0 - lsize
    for ln in lines:
        d.add(String(x + w / 2.0, cy, ln, fontName=FONT_BODY, fontSize=lsize,
                     fillColor=lc, textAnchor='middle'))
        cy -= (lsize + 2.5)


def centre_node(d, x, y, w, h, title, lines=(), fill=FILL_BOX, stroke=LINE,
                tsize=9.5, lsize=7.6, title_color=colors.white):
    """Box whose title bar + body are vertically centred as a block."""
    d.add(Rect(x, y, w, h, fillColor=fill, strokeColor=stroke, strokeWidth=1.1))
    bh = tsize + 6 if title else 0
    total = bh + (lsize + 2.5) * max(1, len(lines))
    cy = y + (h - total) / 2.0
    if title:
        d.add(Rect(x, cy + total - bh, w, bh, fillColor=FILL_HDR, strokeColor=None))
        d.add(String(x + w / 2.0, cy + total - bh + 3.5, title, fontName=FONT_BOLD,
                     fontSize=tsize, fillColor=colors.white, textAnchor='middle'))
    ty = cy + total - bh - (lsize + 2)
    for ln in lines:
        d.add(String(x + w / 2.0, ty, ln, fontName=FONT_BODY, fontSize=lsize,
                     fillColor=colors.black, textAnchor='middle'))
        ty -= (lsize + 2.5)


def arrow(d, x1, y1, x2, y2, color=LINE, label=None, dash=None, lw=1.0,
          head=7, lsize=7, ldx=4, ldy=4, both=False):
    ln = Line(x1, y1, x2, y2, strokeColor=color, strokeWidth=lw)
    if dash:
        ln.strokeDashArray = dash
    d.add(ln)
    ang = math.atan2(y2 - y1, x2 - x1)
    for (ax, ay) in [(x2, y2)] + ([(x1, y1)] if both else []):
        s = -1 if (ax, ay) == (x1, y1) else 1
        a = ang if s == 1 else ang + math.pi
        p1 = (ax - head * math.cos(a - math.pi / 7.0), ay - head * math.sin(a - math.pi / 7.0))
        p2 = (ax - head * math.cos(a + math.pi / 7.0), ay - head * math.sin(a + math.pi / 7.0))
        d.add(Polygon([ax, ay, p1[0], p1[1], p2[0], p2[1]],
                      fillColor=color, strokeColor=color))
    if label:
        d.add(String((x1 + x2) / 2.0 + ldx, (y1 + y2) / 2.0 + ldy, label,
                     fontName=FONT_BODY, fontSize=lsize, fillColor=GREY,
                     textAnchor='middle'))


def elbox(d, cx, cy, w, h, title, lines=(), fill=colors.white, stroke=LINE,
          tsize=8.5, lsize=7.4):
    """Ellipse-style use-case bubble drawn as a rounded rect (cleaner in print)."""
    d.add(Rect(cx - w / 2.0, cy - h / 2.0, w, h, fillColor=fill,
               strokeColor=stroke, strokeWidth=1.0, rx=h / 2.2))
    total = (tsize + 2) + (lsize + 2) * len(lines)
    ty = cy + total / 2.0 - tsize
    d.add(String(cx, ty, title, fontName=FONT_BODY, fontSize=tsize,
                 fillColor=colors.black, textAnchor='middle'))
    ty -= (tsize + 2)
    for ln in lines:
        d.add(String(cx, ty, ln, fontName=FONT_BODY, fontSize=lsize,
                     fillColor=colors.black, textAnchor='middle'))
        ty -= (lsize + 2)


def actor(d, cx, cy, name, size=9):
    """Stick figure + label."""
    hr = 7
    d.add(Circle(cx, cy + 12, hr / 1.6, fillColor=colors.white, strokeColor=LINE,
                 strokeWidth=1.1))
    d.add(Line(cx, cy + 12 - hr / 1.6, cx, cy - 6, strokeColor=LINE, strokeWidth=1.1))
    d.add(Line(cx - 9, cy - 22, cx + 9, cy - 22, strokeColor=LINE, strokeWidth=1.1))
    d.add(Line(cx, cy - 6, cx - 9, cy - 22, strokeColor=LINE, strokeWidth=1.1))
    d.add(Line(cx, cy - 6, cx + 9, cy - 22, strokeColor=LINE, strokeWidth=1.1))
    d.add(Line(cx - 9, cy + 1, cx + 9, cy + 1, strokeColor=LINE, strokeWidth=1.1))
    d.add(String(cx, cy - 34, name, fontName=FONT_BOLD, fontSize=size,
                 fillColor=colors.black, textAnchor='middle'))


def store(d, x, y, w, h, label):
    """Data-store symbol: open-ended rectangle."""
    d.add(Line(x, y, x, y + h, strokeColor=LINE, strokeWidth=1.6))
    d.add(Line(x, y, x + w, y, strokeColor=LINE, strokeWidth=1.1))
    d.add(Line(x, y + h, x + w, y + h, strokeColor=LINE, strokeWidth=1.1))
    d.add(Line(x + w, y, x + w, y + h, strokeColor=LINE, strokeWidth=1.1))
    d.add(String(x + w / 2.0, y + h / 2.0 - 3, label, fontName=FONT_BOLD,
                 fontSize=8.5, fillColor=colors.black, textAnchor='middle'))


def process(d, cx, cy, r, num, name, lines=()):
    """Numbered process bubble for DFDs."""
    d.add(Circle(cx, cy, r, fillColor=FILL_BOX, strokeColor=LINE, strokeWidth=1.2))
    d.add(String(cx, cy + 6, num, fontName=FONT_BOLD, fontSize=9,
                 fillColor=LINE, textAnchor='middle'))
    d.add(String(cx, cy - 7, name, fontName=FONT_BOLD, fontSize=7.2,
                 fillColor=colors.black, textAnchor='middle'))
    ty = cy - 17
    for ln in lines:
        d.add(String(cx, ty, ln, fontName=FONT_BODY, fontSize=6.6,
                     fillColor=colors.black, textAnchor='middle'))
        ty -= 8


def dlabel(d, x, y, text, size=7.5, color=GREY, anchor='middle', bold=False):
    d.add(String(x, y, text, fontName=FONT_BOLD if bold else FONT_BODY,
                 fontSize=size, fillColor=color, textAnchor=anchor))
