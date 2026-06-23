// Renders sample lead + confirmation emails (lease & tour) to HTML for visual
// review — open the files in a browser. Generated *.html/*.png are gitignored.
//   Run:  node --experimental-strip-types preview/render.ts
import { buildLeadEmail, buildConfirmationEmail } from "../src/index.ts";
import { writeFileSync } from "node:fs";

const env = {
  TO_EMAIL: "luxynsales@gmail.com",
  FROM_EMAIL: "LUXYN <noreply@luxynstudios.com>",
  ALLOWED_ORIGINS: "",
  BRAND_PHONE: "+1 737-287-7396",
  RESEND_API_KEY: "x",
};

const lease = {
  variant: "lease", name: "Sarah Jennings", firstName: "Sarah",
  email: "sarah.jennings@example.com", phone: "(512) 555-0199",
  interest: "Lease a suite", requestKind: "enquiry", action: "lease a suite",
  rows: [
    ["Name", "Sarah Jennings"], ["Email", "sarah.jennings@example.com"],
    ["Phone", "(512) 555-0199"], ["Interest", "Lease a suite"],
    ["Suite type", "Hair"], ["Target move-in", "August 2026"],
    ["Message", "I'm a master colorist looking to move my independent business into a private, design-led space. I'd love to learn about availability and pricing."],
  ],
};

const tour = {
  variant: "tour", name: "Marcus Lee", firstName: "Marcus",
  email: "marcus.lee@example.com", phone: "(512) 555-0123",
  interest: "Book a tour", requestKind: "tour request", action: "book a tour",
  rows: [
    ["Name", "Marcus Lee"], ["Email", "marcus.lee@example.com"],
    ["Phone", "(512) 555-0123"], ["Interest", "Book a tour"],
    ["Preferred date", "2026-07-03"], ["Preferred time", "Afternoon (12pm–4pm)"],
  ],
};

writeFileSync("preview/lead-lease.html", buildLeadEmail(lease, env).html);
writeFileSync("preview/confirmation-lease.html", buildConfirmationEmail(lease, env).html);
writeFileSync("preview/lead-tour.html", buildLeadEmail(tour, env).html);
writeFileSync("preview/confirmation-tour.html", buildConfirmationEmail(tour, env).html);
console.log("LEAD subject:", buildLeadEmail(lease, env).subject);
console.log("CONF subject:", buildConfirmationEmail(tour, env).subject);
console.log("--- confirmation (lease) plain text ---");
console.log(buildConfirmationEmail(lease, env).text);
console.log("wrote 4 preview files to worker/preview/");
