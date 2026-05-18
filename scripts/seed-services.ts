import { db } from '@/db'
import { adminServices } from '@/db/schema'

const services = [
  // Lashes — Classic
  { category: 'lashes', group_label: 'Classic', name: 'Classic Set',                       duration: '2 hrs 30 mins', price: '$185', display_order: 1  },
  { category: 'lashes', group_label: 'Classic', name: 'Classic Touch Up — 7 to 14 days',   duration: '45 mins',       price: '$60',  display_order: 2  },
  { category: 'lashes', group_label: 'Classic', name: 'Classic Touch Up — 15 to 21 days',  duration: '1 hr',          price: '$80',  display_order: 3  },
  { category: 'lashes', group_label: 'Classic', name: 'Classic Touch Up — 22 to 28 days',  duration: '1 hr 15 mins',  price: '$100', display_order: 4  },
  // Lashes — Volume
  { category: 'lashes', group_label: 'Volume',  name: 'Volume Set',                        duration: '2 hrs 30 mins', price: '$210', display_order: 5  },
  { category: 'lashes', group_label: 'Volume',  name: 'Volume Touch Up — 7 to 14 days',    duration: '1 hr',          price: '$90',  display_order: 6  },
  { category: 'lashes', group_label: 'Volume',  name: 'Volume Touch Up — 15 to 21 days',   duration: '1 hr 15 mins',  price: '$110', display_order: 7  },
  { category: 'lashes', group_label: 'Volume',  name: 'Volume Touch Up — 22 to 28 days',   duration: '1 hr 30 mins',  price: '$130', display_order: 8  },
  // Lashes — Hybrid
  { category: 'lashes', group_label: 'Hybrid',  name: 'Hybrid Set',                        duration: '2 hrs 15 mins', price: '$195', display_order: 9  },
  { category: 'lashes', group_label: 'Hybrid',  name: 'Hybrid Touch Up — 7 to 14 days',    duration: '50 mins',       price: '$75',  display_order: 10 },
  { category: 'lashes', group_label: 'Hybrid',  name: 'Hybrid Touch Up — 15 to 21 days',   duration: '1 hr 5 mins',   price: '$95',  display_order: 11 },
  { category: 'lashes', group_label: 'Hybrid',  name: 'Hybrid Touch Up — 22 to 28 days',   duration: '1 hr 20 mins',  price: '$115', display_order: 12 },
  // Lashes — Other
  { category: 'lashes', group_label: 'Other',   name: 'Touch Up',                          duration: '1 hr 30 mins',  price: '$100', display_order: 13 },
  { category: 'lashes', group_label: 'Other',   name: 'Lash Removal',                      duration: '30 mins',       price: '$30',  display_order: 14 },
  // Brows
  { category: 'brows',  group_label: null,       name: 'Brow Tint',                         duration: '30 mins',       price: '$35',          display_order: 1 },
  { category: 'brows',  group_label: null,       name: 'Brow Wax',                          duration: '15 mins',       price: '$15',          display_order: 2 },
  { category: 'brows',  group_label: null,       name: 'Color Splash-Ins',                  duration: '30 mins',       price: '$50',          display_order: 3 },
  { category: 'brows',  group_label: null,       name: 'Chin Wax',                          duration: '30 mins',       price: 'Price varies', display_order: 4 },
  // PMU — Brows
  { category: 'pmu',    group_label: 'Brows',    name: 'Microblading',                      duration: '2 hrs 45 mins', price: '$450', display_order: 1  },
  { category: 'pmu',    group_label: 'Brows',    name: 'Microshading',                      duration: '3 hrs',         price: '$650', display_order: 2  },
  { category: 'pmu',    group_label: 'Brows',    name: 'Ombré Brows',                       duration: '2 hrs 30 mins', price: '$500', display_order: 3  },
  { category: 'pmu',    group_label: 'Brows',    name: 'Ombré Cover-Up',                    duration: '3 hrs',         price: '$650', display_order: 4  },
  { category: 'pmu',    group_label: 'Brows',    name: 'Microshading Cover-Up',             duration: '3 hrs 30 mins', price: '$750', display_order: 5  },
  { category: 'pmu',    group_label: 'Brows',    name: 'Cover-Up with Correction',          duration: '3 hrs 30 mins', price: '$800', display_order: 6  },
  // PMU — Lips
  { category: 'pmu',    group_label: 'Lips',     name: 'Lip Blush',                         duration: '3 hrs',         price: '$600', display_order: 7  },
  // PMU — Color Refreshes
  { category: 'pmu',    group_label: 'Color Refreshes', name: 'Brow Color Refresh — 8 weeks to 6 months', duration: '2 hrs',         price: '$175', display_order: 8  },
  { category: 'pmu',    group_label: 'Color Refreshes', name: 'Brow Color Refresh — 6 months to 1 year',  duration: '2 hrs 15 mins', price: '$250', display_order: 9  },
  { category: 'pmu',    group_label: 'Color Refreshes', name: 'Brow Color Refresh — 12 to 20 months',     duration: '2 hrs 30 mins', price: '$375', display_order: 10 },
  // Add-ons
  { category: 'addons', group_label: null, name: 'PMU Consultation',                        duration: '30 mins',       price: '$25',  display_order: 1 },
  { category: 'addons', group_label: null, name: 'Patch Test',                              duration: '30 mins',       price: '$25',  display_order: 2 },
  { category: 'addons', group_label: null, name: 'Additional Correction / Touch Up',        duration: '2 hrs',         price: '$150', display_order: 3 },
]

async function main() {
  await db.insert(adminServices).values(services)
  console.log(`Seeded ${services.length} services.`)
  process.exit(0)
}

main().catch((err) => { console.error(err); process.exit(1) })
