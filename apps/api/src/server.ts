import { createApp } from "./app.js";
import { config, paymentsInTestMode } from "./lib/config.js";

createApp().listen(config.port, () => {
  console.log(`MOVA API listening on :${config.port}${paymentsInTestMode() ? " (payments: TEST MODE)" : ""}`);
});
