import { createApp } from './app.js';
import { CONFIG } from './config.js';

const app = createApp();

app.listen(CONFIG.PORT, () => {
  console.log(`[Convertify Server] Listening locally on http://localhost:${CONFIG.PORT}`);
  console.log(`[Convertify Server] Temporary storage at ${CONFIG.TEMP_DIR}`);
  console.log(`[Convertify Server] Max file limit: ${CONFIG.MAX_FILE_SIZE_MB} MB`);
});
