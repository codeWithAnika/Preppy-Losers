/**
 * Route audit against production server.
 * Usage: node scripts/audit-routes.mjs [baseUrl]
 */

const base = process.argv[2] ?? "http://localhost:3002";

const routes = [
  "/",
  "/shop",
  "/login",
  "/signup",
  "/account",
  "/checkout",
  "/admin",
  "/admin/dashboard",
  "/admin/products",
  "/admin/orders",
  "/admin/drops",
  "/admin/media",
  "/admin/customers",
  "/admin/settings",
  "/admin/products/new",
  "/auth/callback",
  "/this-does-not-exist",
];

async function checkRoute(path) {
  const res = await fetch(`${base}${path}`, { redirect: "manual" });
  const location = res.headers.get("location");
  return {
    path,
    status: res.status,
    location: location ? new URL(location, base).pathname + (new URL(location, base).search || "") : null,
  };
}

const results = [];
for (const path of routes) {
  try {
    results.push(await checkRoute(path));
  } catch (error) {
    results.push({ path, status: "ERR", error: String(error) });
  }
}

console.log(JSON.stringify(results, null, 2));
