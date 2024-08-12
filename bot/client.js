import { TelegramClient } from "telegram";
import { StoreSession } from "telegram/sessions/index.js";

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
let client = null;
if (
  apiId &&
  apiId != 12345678 &&
  apiHash &&
  apiHash != "abc1def2ghi3jkl4mno5pqr6stuvwxyz"
) {
  const session = new StoreSession("auth");
  client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 3,
  });
  await client.start({
    botAuthToken: process.env.TOKEN,
  });

  client.session.save();
} else {
  client = null;
}

const isClientInitialized = Boolean(client)

/**
 *
 * @param {String} login
 * @returns {Promise<Number | undefined>}
 */
async function getUserIdFromLogin(login) {
  if (!isClientInitialized) return;
  const entity = await client.getEntity(login).catch(() => {});
  if (!entity || entity?.className != "User") return;
  return entity?.id?.value ? Number(entity.id.value) : undefined;
}

export { isClientInitialized, getUserIdFromLogin };
