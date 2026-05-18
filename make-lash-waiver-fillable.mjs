/**
 * make-lash-waiver-fillable.mjs
 *
 * Overlays AcroForm fields on the flat lash waiver PDF exported from Word.
 * Run from repo root:
 *   node make-lash-waiver-fillable.mjs
 *
 * Input:  C:\Users\justi\Downloads\eyelash-waiver-flat.pdf
 * Output: apps/web/public/waivers/lash-waiver.pdf
 */

import { PDFDocument, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

const SRC  = String.raw`C:\Users\justi\Downloads\eyelash-waiver-flat.pdf`
const DEST = 'public/waivers/lash-waiver.pdf'

fs.mkdirSync(path.dirname(DEST), { recursive: true })

const pdfDoc = await PDFDocument.load(fs.readFileSync(SRC))
const form   = pdfDoc.getForm()
const pages  = pdfDoc.getPages()
const [p1, p2] = pages

// ── Helpers ───────────────────────────────────────────────────────────────────
// All y coords from pypdf = distance from BOTTOM of page (same as pdf-lib).
// We pass y as the TOP of the desired field so callers can think top-down.

const FILL = rgb(0.97, 0.97, 0.88)  // faint cream tint so fields are obvious

function text(page, name, x, yTop, w, h = 13) {
  const field = form.createTextField(name)
  field.addToPage(page, {
    x,
    y: yTop - h,
    width: w,
    height: h,
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 0.5,
    backgroundColor: FILL,
  })
  field.setFontSize(9)
}

function initial(page, name, x, yTop) {
  text(page, name, x, yTop, 36, 11)
}

// Radio group helper — creates two buttons (Yes / No) for a single question
function yesNo(page, groupName, xYes, xNo, yTop, size = 11) {
  const group = form.createRadioGroup(groupName)
  const opts = { width: size, height: size, borderColor: rgb(0.5, 0.5, 0.5), borderWidth: 0.75 }
  group.addOptionToPage('Yes', page, { x: xYes, y: yTop - size, ...opts })
  group.addOptionToPage('No',  page, { x: xNo,  y: yTop - size, ...opts })
}

function checkbox(page, name, x, yTop, size = 11) {
  const field = form.createCheckBox(name)
  field.addToPage(page, {
    x,
    y: yTop - size,
    width: size,
    height: size,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 0.75,
  })
}

// ── Page 1 ────────────────────────────────────────────────────────────────────

// Contact info row 1  (y≈658 baseline → yTop≈665)
text(p1, 'client_name',  104, 665, 268)   // Name
text(p1, 'dob',          403, 665, 128)   // DOB

// Contact info row 2  (y≈634 baseline → yTop≈641)
text(p1, 'contact', 162, 641, 148)        // Contact Number
text(p1, 'email',   348, 641, 192)        // Email

// Prior salons   (y≈572, 548 baselines)
text(p1, 'prior_salon_1',       72,  579, 220)
text(p1, 'prior_salon_1_city', 312,  579, 112)
text(p1, 'prior_salon_1_state', 492, 579,  48)
text(p1, 'prior_salon_2',       72,  555, 220)
text(p1, 'prior_salon_2_city', 312,  555, 112)
text(p1, 'prior_salon_2_state', 492, 555,  48)

// "Had extensions before?" — Yes / No circles  (y≈610)
yesNo(p1, 'had_extensions_before', 349, 396, 617)

// "Returning client?" — Yes / No circles  (y≈525)
yesNo(p1, 'returning_client', 410, 469, 532)

// Health checkboxes   (y≈477, 453 → the  box glyphs sit there)
checkbox(p1, 'cb_contacts',   72,  484)
checkbox(p1, 'cb_fishoils',  181,  484)
checkbox(p1, 'cb_eyeinjury', 280,  484)
checkbox(p1, 'cb_cancer',     72,  460)
checkbox(p1, 'cb_allergies', 181,  460)

// Initials (text at y≈406, 354, 303, 210, ~128 on p1)
initial(p1, 'initial_1',  72, 412)   // authorize stylist
initial(p1, 'initial_2',  72, 360)   // consent at own risk
initial(p1, 'initial_3',  72, 309)   // 48 hours curing
initial(p1, 'initial_4',  72, 216)   // full liability release
initial(p1, 'initial_5',  72, 133)   // further release / pre-existing

// ── Page 2 ────────────────────────────────────────────────────────────────────

initial(p2, 'initial_6',        72, 692)   // agree full waiver
initial(p2, 'initial_policies', 72, 449)   // read & understand policies

// Signatures  (y≈381, 358 baselines)
text(p2, 'signature',          167, 388, 218)
text(p2, 'sign_date',          442, 388, 118)
text(p2, 'guardian_signature', 236, 364, 148)
text(p2, 'guardian_date',      442, 364, 118)

// ── Save ──────────────────────────────────────────────────────────────────────
fs.writeFileSync(DEST, await pdfDoc.save())
console.log(`✓  Fillable lash waiver saved → ${DEST}`)
