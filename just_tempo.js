const axios = require("axios");
const id = "545c0cd5-c671-4625-b82e-e94deff91a24";
const url = `http://localhost:3000/api/event/${id}`;
axios.delete(url, { timeout: 10000 });
