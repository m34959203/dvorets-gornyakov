import { initAuthCreds, BufferJSON, proto } from "@whiskeysockets/baileys";
import type { AuthenticationState, AuthenticationCreds, SignalDataTypeMap } from "@whiskeysockets/baileys";
import { query, getOne } from "@/lib/db";

// Хранение сессии Baileys в Postgres (таблица wa_auth) — переживает рестарты.
async function writeData(id: string, data: unknown): Promise<void> {
  const value = JSON.stringify(data, BufferJSON.replacer);
  await query(
    `INSERT INTO wa_auth (id, value, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [id, value]
  );
}

async function readData<T = unknown>(id: string): Promise<T | null> {
  const row = await getOne<{ value: string }>(`SELECT value FROM wa_auth WHERE id = $1`, [id]);
  if (!row) return null;
  return JSON.parse(row.value, BufferJSON.reviver) as T;
}

async function removeData(id: string): Promise<void> {
  await query(`DELETE FROM wa_auth WHERE id = $1`, [id]);
}

export async function clearAuthState(): Promise<void> {
  await query(`DELETE FROM wa_auth`);
}

export async function useDbAuthState(): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}> {
  const creds: AuthenticationCreds = (await readData<AuthenticationCreds>("creds")) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [id: string]: SignalDataTypeMap[typeof type] } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value as object);
              }
              data[id] = value as SignalDataTypeMap[typeof type];
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            const cat = data[category as keyof typeof data]!;
            for (const id in cat) {
              const value = cat[id];
              const key = `${category}-${id}`;
              tasks.push(value ? writeData(key, value) : removeData(key));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => writeData("creds", creds),
  };
}
