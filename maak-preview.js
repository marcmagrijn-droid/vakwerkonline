#!/usr/bin/env node
/* =============================================================
   Vakwerk Online — preview-fabriek
   Gebruik:
   node maak-preview.js --bedrijf "Loodgieter Rotterdam Oost" \
     --plaats "Rotterdam" --regio "Rotterdam-Oost · Kralingen" \
     --rating "5,0" --reviews 76 --tel "+31683849938" \
     --vervalt "16 juli"

   Output: preview/<slug>.html  →  vakwerkonline.nl/preview/<slug>
   ============================================================= */
const fs = require("fs");
const path = require("path");

const args = {};
process.argv.slice(2).forEach((a, i, arr) => {
  if (a.startsWith("--")) args[a.slice(2)] = arr[i + 1] || "";
});

const verplicht = ["bedrijf", "plaats", "rating", "reviews", "tel", "vervalt"];
const mist = verplicht.filter((k) => !args[k]);
if (mist.length) {
  console.error("Ontbrekende parameters: --" + mist.join(" --"));
  process.exit(1);
}

const slug = args.bedrijf
  .toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const telToon = args.tel.replace(/^\+31/, "0").replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5");

let html = fs.readFileSync(path.join(__dirname, "preview", "_template.html"), "utf8");

const vervang = {
  "{{BEDRIJF}}": args.bedrijf,
  "{{BEDRIJF_URL}}": encodeURIComponent(args.bedrijf),
  "{{PLAATS}}": args.plaats,
  "{{REGIO_LABEL}}": args.regio || `${args.plaats} en omgeving`,
  "{{RATING}}": args.rating,
  "{{REVIEWS}}": args.reviews,
  "{{TEL_LINK}}": args.tel,
  "{{TEL_TOON}}": telToon,
  "{{VERVALDATUM}}": args.vervalt,
};
for (const [token, waarde] of Object.entries(vervang)) {
  html = html.split(token).join(waarde);
}

const uit = path.join(__dirname, "preview", `${slug}.html`);
fs.writeFileSync(uit, html);
console.log(`✓ Preview klaar: preview/${slug}.html`);
console.log(`  Live straks op: https://vakwerkonline.nl/preview/${slug}`);
console.log(`  WhatsApp-link voor outreach:`);
console.log(`  https://vakwerkonline.nl/preview/${slug}`);
console.log(`\nLet op: pas de diensten/teksten in het bestand nog aan op het vak (schilder/installateur/hovenier).`);
