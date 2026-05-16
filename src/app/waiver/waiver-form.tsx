'use client'

import { useState } from 'react'
import { CheckCircle, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type WaiverType = 'lash' | 'pmu' | 'reconsent'
type Answers    = Record<string, string | boolean | null>

interface WizardProps {
  token:      string
  waiverType: WaiverType
  prefill: {
    name:            string
    email:           string
    phone:           string
    serviceName:     string
    appointmentDate: string
  }
}

// ── Step labels ───────────────────────────────────────────────────────────────

const STEP_LABELS: Record<WaiverType, string[]> = {
  lash:      ['Your Info', 'Health History', 'Initials', 'Signature'],
  pmu:       ['Your Info', 'Consent', 'Initials', 'Medical History', 'Signature'],
  reconsent: ['Your Info', 'Health Update', 'Initials', 'Signature'],
}

// ── Lash waiver content ───────────────────────────────────────────────────────

const LASH_HEALTH_QUESTIONS = [
  { key: 'h_allergies',     text: 'Are you allergic to latex, formaldehyde, cyanoacrylate adhesives, or any other chemicals?' },
  { key: 'h_eyeConditions', text: 'Do you have any eye conditions (dry eye syndrome, conjunctivitis, blepharitis, or eczema near the eyes)?' },
  { key: 'h_priorLashes',   text: 'Have you had lash extensions before? (If yes, did you experience any reactions or sensitivity?)' },
  { key: 'h_medications',   text: 'Are you currently using prescription eye drops, Latisse, or applying retinols or actives near the eye area?' },
  { key: 'h_pregnant',      text: 'Are you currently pregnant or breastfeeding?' },
]

const LASH_INITIALS = [
  'I have received and understand the post-care instructions for my lash extensions and will follow them as directed.',
  'I understand that lash extensions require refills every 2–3 weeks to maintain a full, seamless look.',
  'I understand that results vary based on my individual natural lash type, lifestyle, and adherence to aftercare.',
  'I understand that failure to follow aftercare instructions may result in premature lash loss or damage to my natural lashes.',
  'I consent to BeautyByAmy taking before and after photos for documentation, training, and/or promotional purposes. (You may decline by not initialing this item and notifying your technician.)',
  'I understand that allergic reactions, while rare, are possible with lash adhesive, and I agree to report any discomfort immediately. I have disclosed all known allergies.',
]

// ── PMU consent content ───────────────────────────────────────────────────────

const PMU_INITIALS = [
  'I understand that permanent makeup (PMU) is a form of cosmetic tattooing and that results are semi-permanent — pigment will fade over time.',
  'I understand the final healed result will only be fully visible 4–6 weeks after my appointment, once the skin has completely healed.',
  'I understand that a follow-up touch-up appointment (if included in my service) is typically needed 4–8 weeks after the initial procedure.',
  'I understand the treated area will appear significantly darker immediately after the procedure and will soften considerably during the healing process.',
  'I understand that the healing process may involve redness, minor swelling, tenderness, and peeling — this is a normal part of the healing cycle.',
  'I consent to BeautyByAmy taking before and after photographs for documentation, training, and promotional purposes.',
  'I understand that sun exposure, skincare products (retinols, acids), and certain medications may affect how long the pigment lasts.',
  'I understand that results cannot be guaranteed due to individual variation in skin type, lifestyle, and healing response.',
  'I understand that the cost of the initial service does not include future maintenance touch-ups beyond what is specified in my service agreement.',
  'I confirm I have accurately disclosed all relevant medical information and understand that withholding information may affect the safety and outcome of my procedure.',
  'I release BeautyByAmy and Amy Le from liability for any results that differ from expectations due to undisclosed health or skin information.',
]

const PMU_MEDICAL_QUESTIONS = [
  { key: 'med_bloodDisorders',     text: 'Do you have any blood clotting disorders, or are you currently taking blood thinners (e.g., warfarin, aspirin therapy)?' },
  { key: 'med_heart',              text: 'Do you have heart disease, a heart condition, or a pacemaker?' },
  { key: 'med_diabetes',           text: 'Do you have diabetes (Type 1 or Type 2)?' },
  { key: 'med_hivHepatitis',       text: 'Do you have HIV/AIDS or hepatitis (any strain)?' },
  { key: 'med_keloid',             text: 'Do you have a history of keloid scarring or abnormal scarring?' },
  { key: 'med_skinConditions',     text: 'Do you have active skin conditions near the treatment area (eczema, psoriasis, rosacea, dermatitis)?' },
  { key: 'med_accutane',           text: 'Are you currently taking Accutane, or have you taken it within the past 12 months?' },
  { key: 'med_pregnant',           text: 'Are you currently pregnant or breastfeeding?' },
  { key: 'med_epilepsy',           text: 'Do you have epilepsy or a history of seizure disorders?' },
  { key: 'med_autoimmune',         text: 'Do you have an autoimmune disorder (e.g., lupus, multiple sclerosis, rheumatoid arthritis)?' },
  { key: 'med_chemo',              text: 'Are you currently undergoing or have recently completed chemotherapy or radiation (within the past 6 months)?' },
  { key: 'med_botox',              text: 'Have you had BOTOX or dermal fillers in or near the treatment area within the past 2 weeks?' },
  { key: 'med_surgery',            text: 'Have you had surgical procedures in or near the treatment area within the past 6 months?' },
  { key: 'med_herpes',             text: 'Do you have a history of oral herpes or cold sores? (Relevant for lip blush services)' },
  { key: 'med_numbing',            text: 'Do you have known allergies to numbing agents (e.g., lidocaine, benzocaine, tetracaine)?' },
  { key: 'med_thyroid',            text: 'Do you have a thyroid condition requiring medication?' },
  { key: 'med_anemia',             text: 'Do you have anemia or iron deficiency?' },
  { key: 'med_priorPmu',           text: 'Have you had any permanent makeup or cosmetic tattooing procedures before?' },
  { key: 'med_pigmentReaction',    text: 'Have you ever had an adverse reaction to tattoo ink, pigments, or cosmetic procedures?' },
  { key: 'med_retinol',            text: 'Are you currently using retinol, glycolic acid, or chemical exfoliants near the treatment area?' },
  { key: 'med_immunosuppressant',  text: 'Have you had an organ transplant or are you taking immunosuppressant medications?' },
  { key: 'med_sunburn',            text: 'Do you have a sunburn or recent excessive sun exposure at the treatment area?' },
  { key: 'med_steroids',           text: 'Are you currently taking oral steroid medications (e.g., prednisone, hydrocortisone)?' },
  { key: 'med_hemophilia',         text: 'Do you have hemophilia or any condition that severely affects blood clotting?' },
  { key: 'med_other',              text: 'Are there any other medical conditions, medications, or health concerns you would like to disclose?' },
]

// ── Re-consent content ────────────────────────────────────────────────────────

const RECONSENT_INITIALS = [
  'I confirm that my personal and medical information has been reviewed and remains accurate, or I have noted any changes above.',
  'I understand that PMU is a semi-permanent procedure and that results will continue to fade over time, requiring periodic maintenance.',
  'I understand the normal healing process including redness, swelling, peeling, and color changes in the days following my appointment.',
  'I understand that results vary based on individual healing, skin type, and lifestyle factors.',
  'I confirm that I am not currently pregnant or breastfeeding.',
  'I confirm that I have not used Accutane or isotretinoin within the past 12 months.',
  'I confirm that I have not received BOTOX or dermal fillers in or near the treatment area within the past 2 weeks.',
  'I confirm that I have not had any surgical procedures in or near the treatment area within the past 6 months.',
  'I understand that sun exposure and certain skincare products (retinols, chemical exfoliants) can accelerate fading of the pigment.',
  'I understand that additional color sessions beyond what is included in my service agreement are available at an additional cost.',
  'I consent to BeautyByAmy taking before and after photos for documentation and promotional use.',
  'I understand the risks of cosmetic tattooing, including but not limited to infection, allergic reaction, and results that may not meet my expectations.',
  'I understand that color matching and pigment selection is performed to the best of Amy\'s professional ability, but exact replication of prior results cannot be guaranteed.',
  'I understand that some fading between appointments is normal and expected and does not indicate a problem with the procedure.',
  'I release BeautyByAmy and Amy Le from liability for variation in results due to my individual skin response, healing, or any undisclosed health information.',
  'I confirm I have read and agree to BeautyByAmy\'s aftercare guidelines and cancellation policy.',
  'I confirm that all information provided on this form is accurate and complete, and I have not withheld any relevant health details.',
]

// ── Validation ────────────────────────────────────────────────────────────────

function validateStep(step: number, type: WaiverType, answers: Answers): boolean {
  if (type === 'lash') {
    switch (step) {
      case 0: return !!(answers.dob as string)?.trim()
      case 1: return LASH_HEALTH_QUESTIONS.every((q) => answers[q.key] !== null && answers[q.key] !== undefined)
      case 2: return LASH_INITIALS.every((_, i) => answers[`i_${i}`] === true)
      case 3: return !!(answers.signature as string)?.trim()
    }
  }
  if (type === 'pmu') {
    switch (step) {
      case 0: return !!(answers.dob as string)?.trim()
      case 1: return answers.photo_consent !== null && answers.photo_consent !== undefined
            && answers.patch_test !== null && answers.patch_test !== undefined
      case 2: return PMU_INITIALS.every((_, i) => answers[`i_${i}`] === true)
      case 3: return PMU_MEDICAL_QUESTIONS.every((q) => answers[q.key] !== null && answers[q.key] !== undefined)
            && !!(answers.emergency_name as string)?.trim()
            && !!(answers.emergency_phone as string)?.trim()
      case 4: return !!(answers.signature as string)?.trim()
    }
  }
  if (type === 'reconsent') {
    switch (step) {
      case 0: return true
      case 1: return answers.pregnant !== null && answers.pregnant !== undefined
            && answers.history_changed !== null && answers.history_changed !== undefined
      case 2: return RECONSENT_INITIALS.every((_, i) => answers[`ri_${i}`] === true)
      case 3: return !!(answers.signature as string)?.trim()
    }
  }
  return true
}

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function StepBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => (
        <div key={label} className="flex flex-1 flex-col items-center">
          <div className="flex w-full items-center">
            {i > 0 && (
              <div className={cn('h-px flex-1 transition-colors duration-300', i <= current ? 'bg-gold' : 'bg-border')} />
            )}
            <div className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all duration-300',
              i < current  ? 'border-gold bg-gold text-white' :
              i === current ? 'border-gold bg-white text-gold' :
                              'border-border bg-white text-muted-foreground',
            )}>
              {i < current ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={cn('h-px flex-1 transition-colors duration-300', i < current ? 'bg-gold' : 'bg-border')} />
            )}
          </div>
          <p className={cn(
            'mt-1.5 text-center text-[10px] tracking-wide',
            i === current ? 'font-semibold text-gold-dark' : 'text-muted-foreground',
          )}>
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-1 font-serif text-2xl text-charcoal">{children}</h2>
}

function SectionDesc({ children }: { children: React.ReactNode }) {
  return <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{children}</p>
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground">{value}</p>
    </div>
  )
}

function TextField({
  label, value, onChange, placeholder, required, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; required?: boolean; type?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20"
      />
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20"
      />
    </div>
  )
}

function YesNoQuestion({
  text, value, onChange,
}: {
  text: string; value: boolean | null; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start gap-4 px-4 py-3.5">
      <p className="flex-1 text-sm leading-snug text-foreground">{text}</p>
      <div className="flex shrink-0 gap-2">
        {([true, false] as const).map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'w-14 rounded-full border py-1.5 text-xs font-semibold transition-all',
              value === opt ? 'border-gold bg-gold text-white' : 'border-border text-muted-foreground hover:border-gold/50',
            )}
          >
            {opt ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}

function InitialItem({
  index, text, checked, onChange,
}: {
  index: number; text: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className={cn(
      'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all',
      checked ? 'border-gold/60 bg-gold/5' : 'border-border bg-white hover:border-gold/30',
    )}>
      <div className={cn(
        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 text-xs font-bold transition-all',
        checked ? 'border-gold bg-gold text-white' : 'border-border bg-white',
      )}>
        {checked ? '✓' : ''}
      </div>
      <div className="flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold-dark">Initial #{index}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground">{text}</p>
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
    </label>
  )
}

// ── Step components ───────────────────────────────────────────────────────────

function StepPersonalInfo({
  answers, set, prefill, askDob, showConcerns,
}: {
  answers: Answers
  set: (k: string, v: string | boolean | null) => void
  prefill: WizardProps['prefill']
  askDob?: boolean
  showConcerns?: boolean
}) {
  return (
    <div className="space-y-4">
      <div>
        <SectionTitle>Confirm Your Information</SectionTitle>
        <SectionDesc>We've pre-filled the following from your booking. Review to confirm everything is correct.</SectionDesc>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ReadOnlyField label="Full Name" value={prefill.name} />
        <ReadOnlyField label="Email" value={prefill.email} />
        <ReadOnlyField label="Phone" value={prefill.phone} />
        {askDob && (
          <TextField
            label="Date of Birth"
            value={(answers.dob as string) ?? ''}
            onChange={(v) => set('dob', v)}
            placeholder="MM/DD/YYYY"
            required
          />
        )}
      </div>
      {showConcerns && (
        <TextArea
          label="Special Concerns or Requests (Optional)"
          value={(answers.concerns as string) ?? ''}
          onChange={(v) => set('concerns', v)}
          placeholder="Any skin sensitivities, prior reactions, design preferences, or questions for Amy…"
        />
      )}
    </div>
  )
}

function StepHealthQuestions({
  answers, set,
}: {
  answers: Answers
  set: (k: string, v: string | boolean | null) => void
}) {
  return (
    <div>
      <SectionTitle>Health History</SectionTitle>
      <SectionDesc>Please answer all questions honestly. This information helps ensure your safety during the procedure.</SectionDesc>
      <div className="overflow-hidden rounded-xl border border-border divide-y divide-border">
        {LASH_HEALTH_QUESTIONS.map((q) => (
          <YesNoQuestion
            key={q.key}
            text={q.text}
            value={(answers[q.key] as boolean | null) ?? null}
            onChange={(v) => set(q.key, v)}
          />
        ))}
      </div>
      {answers.h_priorLashes === true && (
        <div className="mt-4">
          <TextArea
            label="If you experienced reactions or sensitivity, please describe:"
            value={(answers.h_priorReactions as string) ?? ''}
            onChange={(v) => set('h_priorReactions', v)}
            placeholder="Describe any reactions, redness, itching, or issues from prior lash extensions…"
          />
        </div>
      )}
    </div>
  )
}

function StepInitialsList({
  answers, set, initials, prefix,
}: {
  answers: Answers
  set: (k: string, v: string | boolean | null) => void
  initials: string[]
  prefix: string
}) {
  const allChecked = initials.every((_, i) => answers[`${prefix}${i}`] === true)
  return (
    <div>
      <SectionTitle>Individual Initials</SectionTitle>
      <SectionDesc>
        Read each statement carefully and check the box to initial your understanding and agreement.
        All items must be initialed to continue.
      </SectionDesc>
      <div className="space-y-2.5">
        {initials.map((text, i) => (
          <InitialItem
            key={i}
            index={i + 1}
            text={text}
            checked={(answers[`${prefix}${i}`] as boolean) ?? false}
            onChange={(v) => set(`${prefix}${i}`, v)}
          />
        ))}
      </div>
      {allChecked && (
        <p className="mt-4 text-center text-sm font-medium text-gold-dark">✓ All items initialed</p>
      )}
    </div>
  )
}

function StepPmuConsent({
  answers, set,
}: {
  answers: Answers
  set: (k: string, v: string | boolean | null) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Consent & Treatment Decisions</SectionTitle>
        <SectionDesc>Please review and make a selection for each item below.</SectionDesc>
      </div>

      {/* Photo consent */}
      <div className="rounded-xl border border-border p-5">
        <h3 className="mb-1 font-medium text-charcoal">Photo &amp; Video Consent</h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          I consent to BeautyByAmy photographing or filming my procedure (including before/after images)
          for the purposes of documentation, training, and promotional use on social media and the
          BeautyByAmy website. My name will not be shared without separate written permission.
        </p>
        <div className="flex gap-3">
          {([['true', 'I consent'], ['false', 'I decline']] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => set('photo_consent', val === 'true')}
              className={cn(
                'flex-1 rounded-lg border py-2.5 text-sm font-medium transition-all',
                String(answers.photo_consent) === val
                  ? 'border-gold bg-gold/10 text-gold-dark'
                  : 'border-border text-muted-foreground hover:border-gold/40',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Patch test */}
      <div className="rounded-xl border border-border p-5">
        <h3 className="mb-1 font-medium text-charcoal">Patch Test Decision</h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          A patch test involves applying a small amount of pigment to a discreet area 48–72 hours before
          your appointment to check for any allergic reaction. We recommend it for first-time PMU clients,
          but it is optional.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {([
            ['waive', 'Waive the Test', 'I elect to proceed on my appointment date without a prior patch test.'],
            ['take',  'Take the Test',  'I would like to schedule a patch test before my appointment.'],
          ] as const).map(([val, title, desc]) => (
            <button
              key={val}
              type="button"
              onClick={() => set('patch_test', val)}
              className={cn(
                'flex-1 rounded-xl border p-4 text-left transition-all',
                answers.patch_test === val ? 'border-gold bg-gold/10' : 'border-border hover:border-gold/40',
              )}
            >
              <p className={cn('font-semibold', answers.patch_test === val ? 'text-gold-dark' : 'text-charcoal')}>{title}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{desc}</p>
            </button>
          ))}
        </div>
        {answers.patch_test === 'take' && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
            ⚠ Please contact BeautyByAmy after submitting this form to schedule your patch test appointment.
          </p>
        )}
      </div>
    </div>
  )
}

function StepMedicalHistory({
  answers, set,
}: {
  answers: Answers
  set: (k: string, v: string | boolean | null) => void
}) {
  return (
    <div>
      <SectionTitle>Medical History</SectionTitle>
      <SectionDesc>
        Your safety is our top priority. Answer all questions honestly — certain conditions or medications
        may affect eligibility for PMU procedures.
      </SectionDesc>

      <div className="mb-6 overflow-hidden rounded-xl border border-border divide-y divide-border">
        {PMU_MEDICAL_QUESTIONS.map((q) => (
          <YesNoQuestion
            key={q.key}
            text={q.text}
            value={(answers[q.key] as boolean | null) ?? null}
            onChange={(v) => set(q.key, v)}
          />
        ))}
      </div>

      <div className="space-y-4">
        <TextArea
          label="Current Medications"
          value={(answers.medications as string) ?? ''}
          onChange={(v) => set('medications', v)}
          placeholder="List any medications, supplements, or vitamins you currently take — or write 'none'…"
        />
        <TextArea
          label="Known Allergies"
          value={(answers.allergies as string) ?? ''}
          onChange={(v) => set('allergies', v)}
          placeholder="List known allergies (medications, foods, materials, etc.) — or write 'none'…"
        />
      </div>

      <div className="mt-6 rounded-xl border border-border p-5">
        <h3 className="mb-4 font-medium text-charcoal">Emergency Contact <span className="text-xs font-normal text-muted-foreground">(required)</span></h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField label="Full Name" value={(answers.emergency_name as string) ?? ''} onChange={(v) => set('emergency_name', v)} required />
          <TextField label="Phone Number" value={(answers.emergency_phone as string) ?? ''} onChange={(v) => set('emergency_phone', v)} required type="tel" />
          <TextField label="Relationship" value={(answers.emergency_relation as string) ?? ''} onChange={(v) => set('emergency_relation', v)} />
        </div>
      </div>
    </div>
  )
}

function StepHealthUpdate({
  answers, set,
}: {
  answers: Answers
  set: (k: string, v: string | boolean | null) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Health Update</SectionTitle>
        <SectionDesc>Since your last visit, please let us know if anything has changed.</SectionDesc>
      </div>

      <div className="overflow-hidden rounded-xl border border-border divide-y divide-border">
        <YesNoQuestion
          text="Are you currently pregnant or breastfeeding?"
          value={(answers.pregnant as boolean | null) ?? null}
          onChange={(v) => set('pregnant', v)}
        />
        <YesNoQuestion
          text="Has your medical history (conditions, medications, allergies) changed since your last appointment?"
          value={(answers.history_changed as boolean | null) ?? null}
          onChange={(v) => set('history_changed', v)}
        />
      </div>

      {answers.history_changed === true && (
        <TextArea
          label="Please describe what has changed:"
          value={(answers.history_changes as string) ?? ''}
          onChange={(v) => set('history_changes', v)}
          placeholder="Describe any new medical conditions, medications, allergies, or other relevant changes…"
        />
      )}

      {answers.pregnant === true && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-semibold text-destructive">⚠ Important Notice</p>
          <p className="mt-1 text-sm text-muted-foreground">
            PMU procedures are not recommended during pregnancy or while breastfeeding.
            Please contact BeautyByAmy to discuss your options or reschedule your appointment.
          </p>
        </div>
      )}
    </div>
  )
}

function StepSignature({
  answers, set, prefill,
}: {
  answers: Answers
  set: (k: string, v: string | boolean | null) => void
  prefill: WizardProps['prefill']
}) {
  const sig = (answers.signature as string) ?? ''
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div>
      <SectionTitle>Electronic Signature</SectionTitle>
      <div className="mb-6 rounded-xl border border-border bg-secondary/30 p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          By typing your full name below, you acknowledge that you have read, understood, and agree to
          all terms of this consent form. Your typed name constitutes a legal electronic signature under
          the U.S. Electronic Signatures in Global and National Commerce Act (E-SIGN Act).
        </p>
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Type Your Full Name to Sign <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={sig}
          onChange={(e) => set('signature', e.target.value)}
          placeholder={prefill.name}
          className="w-full rounded-lg border border-border bg-white px-4 py-3 font-serif text-2xl italic text-charcoal placeholder:text-muted-foreground/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </div>

      {sig.trim() && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-5">
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Signature Preview</p>
          <div className="flex items-end gap-3 border-b border-charcoal/20 pb-2">
            <span className="font-serif text-2xl text-muted-foreground/30">✕</span>
            <p className="font-serif text-2xl italic text-charcoal">{sig}</p>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Signed electronically · {today}</p>
        </div>
      )}
    </div>
  )
}

// ── Step renderer ─────────────────────────────────────────────────────────────

function renderStep(
  step: number,
  type: WaiverType,
  answers: Answers,
  set: (k: string, v: string | boolean | null) => void,
  prefill: WizardProps['prefill'],
) {
  if (type === 'lash') {
    switch (step) {
      case 0: return <StepPersonalInfo answers={answers} set={set} prefill={prefill} askDob />
      case 1: return <StepHealthQuestions answers={answers} set={set} />
      case 2: return <StepInitialsList answers={answers} set={set} initials={LASH_INITIALS} prefix="i_" />
      case 3: return <StepSignature answers={answers} set={set} prefill={prefill} />
    }
  }
  if (type === 'pmu') {
    switch (step) {
      case 0: return <StepPersonalInfo answers={answers} set={set} prefill={prefill} askDob showConcerns />
      case 1: return <StepPmuConsent answers={answers} set={set} />
      case 2: return <StepInitialsList answers={answers} set={set} initials={PMU_INITIALS} prefix="i_" />
      case 3: return <StepMedicalHistory answers={answers} set={set} />
      case 4: return <StepSignature answers={answers} set={set} prefill={prefill} />
    }
  }
  if (type === 'reconsent') {
    switch (step) {
      case 0: return <StepPersonalInfo answers={answers} set={set} prefill={prefill} />
      case 1: return <StepHealthUpdate answers={answers} set={set} />
      case 2: return <StepInitialsList answers={answers} set={set} initials={RECONSENT_INITIALS} prefix="ri_" />
      case 3: return <StepSignature answers={answers} set={set} prefill={prefill} />
    }
  }
  return null
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export function WaiverWizard({ token, waiverType, prefill }: WizardProps) {
  const steps   = STEP_LABELS[waiverType]
  const [step,    setStep]    = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function set(key: string, val: string | boolean | null) {
    setAnswers((prev) => ({ ...prev, [key]: val }))
  }

  const canAdvance = validateStep(step, waiverType, answers)

  async function submit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/waivers/sign', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          waiverType,
          formData: { ...answers, type: waiverType, signedAt: new Date().toISOString() },
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
          <CheckCircle className="h-8 w-8 text-gold" />
        </div>
        <h2 className="font-serif text-2xl text-charcoal">All done — thank you!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your consent form has been signed and submitted. We look forward to seeing you!
        </p>
        <div className="mt-6 rounded-xl border border-gold/20 bg-gold/5 p-4 text-left">
          <p className="text-xs text-muted-foreground">
            Appointment: <span className="font-medium text-foreground">{prefill.serviceName}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{prefill.appointmentDate}</p>
        </div>
      </div>
    )
  }

  const formTitle =
    waiverType === 'lash'     ? 'Lash Extension Consent Form'    :
    waiverType === 'pmu'      ? 'Permanent Makeup Consent Form'   :
                                'PMU Touch-Up Re-Consent Form'

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
          {prefill.serviceName} · {prefill.appointmentDate}
        </p>
        <h1 className="mt-1 font-serif text-2xl text-charcoal">{formTitle}</h1>
      </div>

      {/* Progress bar */}
      <div className="border-b border-border bg-secondary/20 px-6 py-4">
        <StepBar steps={steps} current={step} />
      </div>

      {/* Step content */}
      <div className="px-6 py-8">
        {renderStep(step, waiverType, answers, set, prefill)}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {error && (
          <p className="mx-4 flex-1 text-center text-xs text-destructive">{error}</p>
        )}

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance}
            className="flex items-center gap-1.5 rounded-lg bg-charcoal px-5 py-2 text-sm font-medium text-white transition-all hover:bg-charcoal/85 disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!canAdvance || loading}
            className="flex items-center gap-2 rounded-lg bg-gold px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-gold-dark disabled:opacity-40"
          >
            <Shield className="h-4 w-4" />
            {loading ? 'Submitting…' : 'Sign & Submit'}
          </button>
        )}
      </div>
    </div>
  )
}
