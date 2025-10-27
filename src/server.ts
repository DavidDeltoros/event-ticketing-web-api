import { buildApp } from "./app";

const PORT = process.env.PORT ?? 3000;
const app = buildApp();

app.listen(PORT, () => {
  console.log(`Books API running at http://localhost:${PORT}`);
});