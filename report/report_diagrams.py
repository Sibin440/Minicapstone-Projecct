"""Vector diagrams for the Creamy Bites project report."""

import math

from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon, Circle

from report_lib import (
    FRAME_W, FONT_BODY, FONT_BOLD, FONT_ITALIC,
    LINE, FILL_HDR, FILL_BOX, FILL_ALT, FILL_STORE, GREY,
    arrow, dlabel, store, actor, elbox,
)

W = FRAME_W            # 451.3 pt usable width


# ----------------------------------------------------------------------------
# low-level helpers
# ----------------------------------------------------------------------------

def box(d, x, y, w, h, title, attrs=(), hdr=FILL_HDR, fill=FILL_BOX, stroke=LINE,
        tsize=8.5, asize=7.2, hdr_h=None, tcolor=colors.white, left=False):
    d.add(Rect(x, y, w, h, fillColor=fill, strokeColor=stroke, strokeWidth=1.0))
    if title:
        hh = hdr_h or (tsize + 6)
        d.add(Rect(x, y + h - hh, w, hh, fillColor=hdr, strokeColor=None))
        d.add(String(x + w / 2.0, y + h - hh + (hh - tsize) / 2.0 - 1, title,
                     fontName=FONT_BOLD, fontSize=tsize, fillColor=tcolor,
                     textAnchor='middle'))
        ty = y + h - hh - (asize + 5)
    else:
        ty = y + h - (asize + 6)
    for a in attrs:
        if left:
            d.add(String(x + 5, ty, a, fontName=FONT_BODY, fontSize=asize,
                         fillColor=colors.black))
        else:
            d.add(String(x + w / 2.0, ty, a, fontName=FONT_BODY, fontSize=asize,
                         fillColor=colors.black, textAnchor='middle'))
        ty -= (asize + 3.2)


def sbox(d, x, y, w, h, lines, fill=colors.white, stroke=LINE, size=7.2,
         bold_first=True):
    """Plain small box with centred text lines."""
    d.add(Rect(x, y, w, h, fillColor=fill, strokeColor=stroke, strokeWidth=0.9))
    total = (size + 3.0) * len(lines)
    ty = y + (h + total) / 2.0 - size - 3
    for i, ln in enumerate(lines):
        d.add(String(x + w / 2.0, ty, ln,
                     fontName=FONT_BOLD if (bold_first and i == 0) else FONT_BODY,
                     fontSize=size, fillColor=colors.black, textAnchor='middle'))
        ty -= (size + 3.0)


def diamond(d, cx, cy, w, h, lines=(), size=6.8):
    d.add(Polygon([cx, cy + h / 2.0, cx + w / 2.0, cy, cx, cy - h / 2.0, cx - w / 2.0, cy],
                  fillColor=colors.white, strokeColor=LINE, strokeWidth=1.0))
    total = (size + 2.2) * len(lines)
    ty = cy + total / 2.0 - size
    for ln in lines:
        d.add(String(cx, ty, ln, fontName=FONT_BODY, fontSize=size,
                     fillColor=colors.black, textAnchor='middle'))
        ty -= (size + 2.2)


def lifeline(d, x, ytop, ybot, name, w=90, h=26, size=7.5):
    d.add(Rect(x - w / 2.0, ytop, w, h, fillColor=FILL_BOX, strokeColor=LINE,
               strokeWidth=1.0))
    d.add(String(x, ytop + (h - size) / 2.0 + 1, name, fontName=FONT_BOLD,
                 fontSize=size, fillColor=colors.black, textAnchor='middle'))
    ln = Line(x, ytop, x, ybot, strokeColor=LINE, strokeWidth=0.9)
    ln.strokeDashArray = [4, 3]
    d.add(ln)


def activation(d, x, y1, y2, w=7):
    d.add(Rect(x - w / 2.0, min(y1, y2), w, abs(y2 - y1),
               fillColor=colors.HexColor('#D9E2F3'), strokeColor=LINE,
               strokeWidth=0.7))


def note(d, y, text, size=7.5):
    d.add(String(W / 2.0, y, text, fontName=FONT_ITALIC, fontSize=size,
                 fillColor=GREY, textAnchor='middle'))


# ----------------------------------------------------------------------------
# Fig 4.1  System architecture
# ----------------------------------------------------------------------------

def fig_architecture():
    H = 372
    d = Drawing(W, H)
    cx = W / 2.0
    L, IW = 8, W - 16

    # ---- Presentation layer ----
    box(d, L, 286, IW, 68, 'PRESENTATION LAYER  (CLIENT SIDE)',
        hdr=FILL_HDR, fill=colors.HexColor('#EDF3FB'))
    bw = (IW - 32) / 3.0
    sbox(d, L + 8, 294, bw, 32, ['Customer Storefront', 'React 18 + Vite'])
    sbox(d, L + 16 + bw, 294, bw, 32, ['Admin Dashboard', 'React + Axios'])
    sbox(d, L + 24 + 2 * bw, 294, bw, 32, ['POS Counter Terminal', 'Admin / Shop floor'])

    # ---- Application layer ----
    box(d, L, 164, IW, 68, 'APPLICATION LAYER  (NODE.JS + EXPRESS REST API)',
        hdr=FILL_HDR, fill=colors.HexColor('#EDF3FB'))
    r1y, r2y = 198, 172
    sbox(d, L + 8, r1y, bw, 22, ['Auth + JWT'])
    sbox(d, L + 16 + bw, r1y, bw, 22, ['Product & Catalogue'])
    sbox(d, L + 24 + 2 * bw, r1y, bw, 22, ['Cart & Wishlist'])
    sbox(d, L + 8, r2y, bw, 22, ['Order & Coupon'])
    sbox(d, L + 16 + bw, r2y, bw, 22, ['Admin & Analytics'])
    sbox(d, L + 24 + 2 * bw, r2y, bw, 22, ['POS & Loyalty'])

    # ---- Data layer ----
    box(d, L, 42, IW, 68, 'DATA LAYER  (MONGODB ATLAS)',
        hdr=FILL_HDR, fill=colors.HexColor('#EDF3FB'))
    dw = (IW - 40) / 4.0
    for i, nm in enumerate(['Users', 'Products & Categories', 'Orders & Cart', 'Loyalty']):
        sbox(d, L + 8 + i * (dw + 8), 50, dw, 32, [nm, 'Mongoose ODM'])

    # ---- connectors ----
    arrow(d, cx - 46, 286, cx - 46, 234, label='HTTP request (JSON)', lsize=7)
    arrow(d, cx + 46, 234, cx + 46, 286, label='JSON response', lsize=7)
    arrow(d, cx - 46, 164, cx - 46, 112, label='Mongoose query', lsize=7)
    arrow(d, cx + 46, 112, cx + 46, 164, label='BSON documents', lsize=7)

    note(d, 22, 'Cross-cutting services: JWT authentication, CORS policy, '
                'Morgan request logging, Multer image upload, bcrypt password hashing')
    note(d, 10, 'Every protected request carries an "Authorization: Bearer <JWT>" header; '
                'the server stays stateless.')
    return d


# ----------------------------------------------------------------------------
# Fig 4.2  DFD Level 0
# ----------------------------------------------------------------------------

def fig_dfd0():
    H = 330
    d = Drawing(W, H)
    cx, cy, r = W / 2.0, 178, 54

    box(d, 8, 226, 104, 34, None, ['Customer'], fill=FILL_STORE, stroke=LINE,
        asize=8.6)
    box(d, W - 112, 226, 104, 34, None, ['Shop Owner /', 'Administrator'],
        fill=FILL_STORE, stroke=LINE, asize=8.6)
    box(d, 8, 118, 104, 34, None, ['Delivery', 'Agent'], fill=FILL_STORE,
        stroke=LINE, asize=8.6)
    box(d, W - 112, 118, 104, 34, None, ['Payment', 'Gateway'], fill=FILL_STORE,
        stroke=LINE, asize=8.6)

    d.add(Circle(cx, cy, r, fillColor=FILL_BOX, strokeColor=LINE, strokeWidth=1.4))
    d.add(String(cx, cy + 14, '0', fontName=FONT_BOLD, fontSize=11,
                 fillColor=LINE, textAnchor='middle'))
    d.add(String(cx, cy - 2, 'CREAMY BITES', fontName=FONT_BOLD, fontSize=8.6,
                 fillColor=colors.black, textAnchor='middle'))
    d.add(String(cx, cy - 13, 'E-COMMERCE', fontName=FONT_BODY, fontSize=7.4,
                 fillColor=colors.black, textAnchor='middle'))
    d.add(String(cx, cy - 23, 'SYSTEM', fontName=FONT_BODY, fontSize=7.4,
                 fillColor=colors.black, textAnchor='middle'))

    store_w, store_h = 250, 26
    store(d, cx - store_w / 2.0, 22, store_w, store_h,
          'D1 : MongoDB Atlas  (Users, Products, Orders, Loyalty)')

    # customer <-> system
    arrow(d, 112, 248, cx - 38, 212, label='login / browse / order', lsize=6.8, ldy=6)
    arrow(d, cx - 38, 200, 112, 234, label='catalogue, cart, bill', lsize=6.8, ldy=-9)
    # admin <-> system
    arrow(d, W - 112, 248, cx + 38, 212, label='products, stock, reports', lsize=6.8, ldy=6)
    arrow(d, cx + 38, 200, W - 112, 234, label='dashboard data', lsize=6.8, ldy=-9)
    # delivery agent
    arrow(d, cx - 34, 150, 112, 132, label='address, delivery OTP', lsize=6.8, ldy=6)
    arrow(d, 112, 122, cx - 34, 140, label='delivered status', lsize=6.8, ldy=-9)
    # payment gateway
    arrow(d, cx + 34, 150, W - 112, 132, label='payment request', lsize=6.8, ldy=6)
    arrow(d, W - 112, 122, cx + 34, 140, label='payment status', lsize=6.8, ldy=-9)
    # system <-> data store
    arrow(d, cx - 10, cy - r, cx - 10, 22 + store_h, both=True, lsize=6.8,
          label='read / write', ldx=34, ldy=0)

    note(d, 4, 'Level 0 (Context) Data Flow Diagram')
    return d


# ----------------------------------------------------------------------------
# Fig 4.3  DFD Level 1
# ----------------------------------------------------------------------------

def fig_dfd1():
    H = 430
    d = Drawing(W, H)

    # ---- external entities ----
    box(d, 10, 386, 108, 30, None, ['Customer'], fill=FILL_STORE, stroke=LINE, asize=8.4)
    box(d, W - 118, 386, 108, 30, None, ['Shop Owner /', 'Administrator'],
        fill=FILL_STORE, stroke=LINE, asize=8.4)

    # ---- processes ----
    cols = [78, 225, 372]
    rows = [300, 222, 144]
    procs = [
        ('1.0', 'User', 'Authentication'),
        ('2.0', 'Product &', 'Catalogue'),
        ('3.0', 'Cart &', 'Wishlist'),
        ('4.0', 'Order', 'Placement'),
        ('5.0', 'Coupon &', 'Discount'),
        ('6.0', 'Loyalty', 'Points'),
        ('7.0', 'Inventory', 'Control'),
        ('8.0', 'POS Counter', 'Billing'),
        ('9.0', 'Analytics &', 'Prediction'),
    ]
    R = 30
    i = 0
    for ry in rows:
        for cx_ in cols:
            num, n1, n2 = procs[i]
            i += 1
            d.add(Circle(cx_, ry, R, fillColor=FILL_BOX, strokeColor=LINE, strokeWidth=1.1))
            d.add(String(cx_, ry + 13, num, fontName=FONT_BOLD, fontSize=8.6,
                         fillColor=LINE, textAnchor='middle'))
            d.add(String(cx_, ry + 2, n1, fontName=FONT_BOLD, fontSize=6.8,
                         fillColor=colors.black, textAnchor='middle'))
            d.add(String(cx_, ry - 6.5, n2, fontName=FONT_BOLD, fontSize=6.8,
                         fillColor=colors.black, textAnchor='middle'))

    # ---- data stores ----
    for nm, lb, x, w in [('D1', 'Users', 6, 100),
                         ('D2', 'Products & Categories', 118, 110),
                         ('D3', 'Orders', 240, 90),
                         ('D4', 'Loyalty', 342, 100)]:
        store(d, x, 26, w, 26, '%s : %s' % (nm, lb))

    # ---- customer flows ----
    arrow(d, 118, 394, 60, 322, label='login', lsize=6.4, ldx=-16)
    arrow(d, 118, 399, 208, 330, label='browse', lsize=6.4, ldy=-8)
    arrow(d, 118, 404, 350, 330, label='cart & wishlist', lsize=6.4, ldy=-12)

    # ---- administrator flows ----
    arrow(d, 333, 399, 256, 330, label='products', lsize=6.4, ldy=-8)
    arrow(d, 400, 396, 380, 175, label='reports', lsize=6.4, ldx=44)
    arrow(d, 360, 404, 250, 170, label='counter billing', lsize=6.4, ldy=6)
    d.add(Line(441, 400, 441, 100, strokeColor=LINE, strokeWidth=1.0))
    d.add(Line(441, 100, 78, 100, strokeColor=LINE, strokeWidth=1.0))
    arrow(d, 78, 100, 78, 112, label='stock', lsize=6.4, ldx=36, ldy=-4)

    # ---- inter-process flows ----
    arrow(d, 78, 270, 78, 252, label='identity', lsize=6.2, ldx=28, ldy=-12)
    arrow(d, 352, 278, 100, 236, label='cart', lsize=6.2, ldx=60)
    arrow(d, 108, 222, 195, 222, label='discount', lsize=6.2, ldy=9)
    arrow(d, 255, 222, 342, 222, label='points', lsize=6.2, ldy=9)
    arrow(d, 78, 192, 78, 174, label='deduct', lsize=6.2, ldx=44)
    arrow(d, 108, 144, 195, 144, label='stock', lsize=6.2, ldy=9)
    arrow(d, 255, 144, 342, 144, label='bills', lsize=6.2, ldy=9)
    arrow(d, 372, 192, 372, 174, label='sales', lsize=6.2, ldx=26)

    # ---- process to data store ----
    d.add(Line(20, 300, 20, 84, strokeColor=LINE, strokeWidth=1.0))
    d.add(Line(20, 84, 56, 84, strokeColor=LINE, strokeWidth=1.0))
    arrow(d, 56, 84, 56, 54, lsize=6.2)
    arrow(d, 100, 122, 170, 54, lsize=6.2)
    arrow(d, 245, 122, 280, 54, lsize=6.2)
    arrow(d, 380, 122, 392, 54, lsize=6.2)

    note(d, 6, 'Level 1 Data Flow Diagram - detailed processes and data stores')
    return d


def fig_usecase():
    H = 452
    d = Drawing(W, H)

    d.add(Rect(96, 24, 259, 400, fillColor=colors.HexColor('#FAFCFF'),
               strokeColor=LINE, strokeWidth=1.0, rx=6))
    d.add(String(W / 2.0, 414, 'CREAMY BITES  E-COMMERCE SYSTEM', fontName=FONT_BOLD,
                 fontSize=9.5, fillColor=LINE, textAnchor='middle'))
    d.add(Line(96, 406, 355, 406, strokeColor=LINE, strokeWidth=0.8))

    actor(d, 52, 372, 'Customer', size=9)
    actor(d, 399, 372, 'Administrator', size=9)

    left = ['Register / Login', 'Browse Catalogue', 'Search / AI Chatbot',
            'Manage Cart', 'Manage Wishlist', 'Manage Addresses',
            'Apply Coupon', 'Place Order', 'Track Order / Review']
    right = ['Admin Authentication', 'Manage Products', 'Manage Inventory',
             'Manage Orders', 'Manage Customers', 'Loyalty Configuration',
             'Sales Analytics', 'Demand Prediction', 'POS Counter Billing']

    ys = [378, 344, 310, 276, 242, 208, 174, 140, 106]
    for y, t in zip(ys, left):
        elbox(d, 160, y, 118, 25, t)
    for y, t in zip(ys, right):
        elbox(d, 292, y, 118, 25, t)

    for y in ys:
        d.add(Line(66, 350, 101, y, strokeColor=LINE, strokeWidth=0.6))
        d.add(Line(385, 350, 351, y, strokeColor=LINE, strokeWidth=0.6))

    # <<include>> relationships
    ln = Line(103, 174, 103, 140, strokeColor=LINE, strokeWidth=0.8)
    ln.strokeDashArray = [3, 2]
    d.add(ln)
    d.add(String(100, 155, '<<include>>', fontName=FONT_ITALIC, fontSize=6.2,
                 fillColor=GREY, textAnchor='end'))
    ln2 = Line(349, 106, 349, 130, strokeColor=LINE, strokeWidth=0.8)
    ln2.strokeDashArray = [3, 2]
    d.add(ln2)
    d.add(String(352, 116, '<<include>>', fontName=FONT_ITALIC, fontSize=6.2,
                 fillColor=GREY, textAnchor='start'))

    note(d, 8, 'Actors, use cases and include-relationships of the proposed system')
    return d


# ----------------------------------------------------------------------------
# Fig 4.5  Sequence diagram - placing an online order
# ----------------------------------------------------------------------------

def fig_sequence():
    H = 424
    d = Drawing(W, H)
    xs = [46, 141, 232, 323, 412]
    names = ['Customer', 'React Frontend', 'Express API', 'Auth Middleware', 'MongoDB Atlas']
    top, bot = 388, 14
    for x, n in zip(xs, names):
        lifeline(d, x, top, bot, n, w=88, h=26, size=7.2)

    msgs = [
        (0, 1, 'browse catalogue and add items to cart', 364, False),
        (1, 1, 'update CartContext / re-render drawer', 340, True),
        (1, 2, 'POST /api/cart/add   (Bearer JWT)', 316, False),
        (2, 3, 'authenticate(token)', 292, False),
        (3, 2, 'req.user { id, role }', 268, False),
        (2, 4, 'findOneAndUpdate(cart)', 244, False),
        (4, 2, 'updated cart document', 220, False),
        (2, 1, '200 OK  { success, cart }', 196, False),
        (1, 2, 'POST /api/orders  { address, slot, coupon }', 172, False),
        (2, 4, 'validate city, minimum order, stock', 148, False),
        (4, 2, 'order document created', 124, False),
        (2, 4, 'credit loyalty points (5 per Rs.100)', 100, False),
        (2, 1, '201 Created { order, delivery OTP }', 76, False),
        (1, 0, 'order confirmation + WhatsApp receipt link', 52, False),
    ]

    activation(d, xs[2], 320, 70)

    for a, b, label, y, self_msg in msgs:
        if self_msg:
            d.add(Line(xs[a], y, xs[a] + 34, y, strokeColor=LINE, strokeWidth=0.9))
            arrow(d, xs[a] + 34, y, xs[a] + 4, y - 9, head=6)
            d.add(String(xs[a] + 40, y - 2, label, fontName=FONT_BODY, fontSize=6.5,
                         fillColor=colors.black))
        else:
            arrow(d, xs[a], y, xs[b], y, head=6)
            xm = (xs[a] + xs[b]) / 2.0
            d.add(String(xm, y + 4, label, fontName=FONT_BODY, fontSize=6.5,
                         fillColor=colors.black, textAnchor='middle'))

    note(d, 2, 'Sequence of interactions while placing a secured online order')
    return d


# ----------------------------------------------------------------------------
# Fig 4.6  Activity diagram - POS counter billing
# ----------------------------------------------------------------------------

def fig_activity():
    H = 524
    d = Drawing(W, H)
    cx = W / 2.0

    d.add(Circle(cx, 496, 8, fillColor=LINE, strokeColor=LINE))

    sbox(d, cx - 92, 456, 184, 28, ['Search / select customer'], size=8)
    arrow(d, cx, 488, cx, 484)

    diamond(d, cx, 410, 132, 46, ['Customer', 'found?'])
    arrow(d, cx, 456, cx, 433)

    sbox(d, 74, 356, 126, 28, ['Quick-register', 'walk-in customer'], size=7.6)
    sbox(d, 252, 356, 126, 28, ['Load loyalty', 'point balance'], size=7.6)
    arrow(d, cx - 66, 410, 137, 370, label='No', lsize=6.6, ldx=-14, ldy=6)
    arrow(d, cx + 66, 410, 315, 370, label='Yes', lsize=6.6, ldx=14, ldy=6)

    sbox(d, cx - 92, 312, 184, 28, ['Scan / add products to the bill'], size=8)
    d.add(Line(137, 356, 137, 348, strokeColor=LINE, strokeWidth=1.0))
    d.add(Line(137, 348, cx, 348, strokeColor=LINE, strokeWidth=1.0))
    d.add(Line(315, 356, 315, 348, strokeColor=LINE, strokeWidth=1.0))
    d.add(Line(315, 348, cx, 348, strokeColor=LINE, strokeWidth=1.0))
    arrow(d, cx, 348, cx, 340)

    diamond(d, cx, 266, 132, 46, ['Sufficient', 'stock?'])
    arrow(d, cx, 312, cx, 289)

    sbox(d, 16, 222, 124, 28, ['Reject line item,', 'show stock error'], size=7.4)
    arrow(d, cx - 66, 266, 140, 246, label='No', lsize=6.6, ldx=-14)
    d.add(Line(78, 222, 78, 330, strokeColor=LINE, strokeWidth=1.0))
    arrow(d, 78, 330, cx - 92, 326, label='revise', lsize=6.4, ldy=8)

    sbox(d, cx - 100, 190, 200, 28, ['Apply coupon and loyalty redemption'], size=7.8)
    arrow(d, cx, 243, cx, 218, label='Yes', lsize=6.6, ldx=16)

    sbox(d, cx - 100, 150, 200, 28, ['Compute subtotal, discount', 'and final payable'], size=7.8)
    arrow(d, cx, 190, cx, 178)

    diamond(d, cx, 104, 132, 46, ['Payment', 'received?'])
    arrow(d, cx, 150, cx, 127)

    sbox(d, cx - 100, 40, 200, 26, ['Deduct stock, create POS order,',
                                    'credit points, print bill'], size=7.2)
    arrow(d, cx, 81, cx, 66, label='Yes', lsize=6.6, ldx=16, ldy=-2)

    d.add(Circle(cx, 22, 9, fillColor=colors.white, strokeColor=LINE, strokeWidth=1.4))
    d.add(Circle(cx, 22, 5, fillColor=LINE, strokeColor=LINE))
    arrow(d, cx, 40, cx, 31)

    arrow(d, cx + 66, 104, cx + 141, 104, label='No - hold bill', lsize=6.6, ldy=8)

    note(d, 4, 'Activity flow of the in-store Point-of-Sale (POS) billing module')
    return d


def fig_er():
    H = 348
    d = Drawing(W, H)

    ew, gap = 125, 30
    c1, c2, c3 = 8, 8 + ew + gap, 8 + 2 * (ew + gap)
    y1, y2 = 250, 60
    bh = 70

    box(d, c1, y1, ew, bh, 'USER',
        ['PK  user_id', 'name', 'email', 'password', 'role', 'city / pincode'],
        left=True, asize=7.0, tsize=8.2)
    box(d, c2, y1, ew, bh, 'CATEGORY',
        ['PK  category_id', 'name', 'slug', 'description', 'image_url', 'icon'],
        left=True, asize=7.0, tsize=8.2)
    box(d, c3, y1, ew, bh, 'PRODUCT',
        ['PK  product_id', 'FK  category_id', 'name / slug', 'base_price',
         'stock_qty', 'rating'],
        left=True, asize=7.0, tsize=8.2)
    box(d, c1, y2, ew, bh, 'CART',
        ['PK  cart_id', 'FK  user_id', 'items[product_id]', 'items[weight]',
         'items[quantity]', 'items[unit_price]'],
        left=True, asize=7.0, tsize=8.2)
    box(d, c2, y2, ew, bh, 'ORDER',
        ['PK  order_id', 'FK  user_id', 'items[] / address', 'subtotal / total',
         'order_status', 'delivery_otp'],
        left=True, asize=7.0, tsize=8.2)
    box(d, c3, y2, ew, bh, 'LOYALTY',
        ['PK  loyalty_id', 'FK  user_id', 'balance', 'transactions[order_id]',
         'transactions[pts]', 'transactions[reason]'],
        left=True, asize=7.0, tsize=8.2)

    arrow(d, c2 + ew, 285, c3, 285, both=True, label='1 : N', lsize=6.6, ldy=9)
    arrow(d, c1 + 62, y1, c1 + 62, y2 + bh, both=True, label='1 : 1', lsize=6.6, ldx=20, ldy=0)
    arrow(d, c1 + 100, y1, 200, y2 + bh, label='1 : N', lsize=6.6, ldx=-2, ldy=-10)
    arrow(d, c1 + ew, 95, c2, 95, both=True, label='1 : N', lsize=6.6, ldy=9)
    arrow(d, 380, y1, 250, y2 + bh, both=True, label='M : N', lsize=6.6, ldx=-6, ldy=4)
    arrow(d, 115, y1, 370, y2 + bh, label='1 : 1', lsize=6.6, ldx=0, ldy=-4)

    d.add(String(W / 2.0, 34,
                 'Cardinality:  one user owns one cart and one loyalty account, and places many orders;',
                 fontName=FONT_BODY, fontSize=7.2, fillColor=colors.black, textAnchor='middle'))
    d.add(String(W / 2.0, 24,
                 'each category holds many products and each order contains many products (M : N).',
                 fontName=FONT_BODY, fontSize=7.2, fillColor=colors.black, textAnchor='middle'))
    note(d, 10, 'PK = primary key (_id)      FK = foreign key reference      '
                'Additional collections: addresses, reviews, coupons')
    return d
