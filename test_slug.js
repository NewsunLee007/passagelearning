const slug = "register";
const parts = Array.isArray(slug) ? slug.map((part) => String(part || "").trim()).filter(Boolean) : [];
console.log(parts);
