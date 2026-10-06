// Ändra här per kund. Lämna SUPABASE_URL tom för demoläge (sparar i webbläsaren).
const CONFIG = {
  SUPABASE_URL: "https://dyoqrzqusjxtrnywfsxj.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_7aEyICs31EvJDojzdXRumg_Msd0jfPr",
  ADMIN_EMAIL: "snellmaneric2@gmail.com",              // ägarens e-post, samma som användaren i Supabase Auth
  API_BASE: "",                 // används bara om ni skriver egen backend istället
  STAFF: ["Ciina", "Kerstin"],
  SERVICES: [
    ["Damklippning", 45, "ca 45 min"],
    ["Herrklippning", 28, "ca 30 min"],
    ["Barnklippning", 20, "ca 30 min"],
    ["Färgning", 70, "ca 90 min"],
    ["Permanent / slingor", 85, "ca 120 min"]
  ],
  OPEN: { start: 9, end: 17, stepMin: 30, closedWeekdays: [0] }
};
