// core/backup/backupDbToS3.ts
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import Constants from "expo-constants";
import { CONFIGS } from "@/constants/Configs";

// yyyymmdd_hhmmss
function ts() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// compat: dev (expo go) e build standalone
const EXTRA = (Constants.expoConfig?.extra ?? (Constants as any).manifest?.extra ?? {}) as Record<string, string>;
const PRESIGN_ENDPOINT = EXTRA?.EXPO_PUBLIC_PRESIGN_ENDPOINT;

export async function backupDbToS3() {
  const startedAt = Date.now();
  console.log("━━━━━━━━━━ BACKUP → S3 (INÍCIO) ━━━━━━━━━━");

  const dbFileName = "user_data.db";
  const dbPath = `${FileSystem.documentDirectory}SQLite/${dbFileName}`;

  // 1) Verificações
  console.log("Verificando DB em:", dbPath);
  const stat = await FileSystem.getInfoAsync(dbPath);
  if (!stat.exists) {
    console.log("Banco não encontrado:", dbPath);
    throw new Error("Banco de dados não encontrado em " + dbPath);
  }
  console.log(`Banco encontrado • Tamanho: ${((stat.size ?? 0)/(1024*1024)).toFixed(2)} MB • mtime: ${stat.modificationTime}`);

  // 2) Checkpoint (se WAL estiver ativo)
  try {
    const db = SQLite.openDatabaseSync(dbFileName);
    await db.execAsync("PRAGMA wal_checkpoint(FULL);");
    console.log("PRAGMA wal_checkpoint(FULL) OK");
  } catch (e) {
    console.log("wal_checkpoint falhou (seguindo mesmo assim):", e);
  }

  // 3) Presign
  const key = `backup_${ts()}_${CONFIGS.APP_VERSION}.db`;
  const contentType = "application/x-sqlite3";

  if (!PRESIGN_ENDPOINT || typeof PRESIGN_ENDPOINT !== "string") {
    throw new Error("EXPO_PUBLIC_PRESIGN_ENDPOINT não configurado no app.json (expo.extra).");
  }
  const urlReq = `${PRESIGN_ENDPOINT}?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(contentType)}`;
  console.log("Solicitando URL pré-assinada:", urlReq);

  let presignRes: Response;
  try {
    presignRes = await fetch(urlReq);
  } catch (e: any) {
    console.log("Erro de rede ao chamar presign:", e);
    throw new Error("Falha de rede ao acessar o endpoint de presign. Verifique URL/HTTPS/host acessível do dispositivo.");
  }

  const presignText = await presignRes.text().catch(() => "");
  if (!presignRes.ok) {
    console.log("Presign HTTP", presignRes.status, "• body:", presignText?.slice(0, 500));
    throw new Error(`Falha ao obter URL presign (HTTP ${presignRes.status}).`);
  }

  let presignJson: any = {};
  try {
    presignJson = JSON.parse(presignText || "{}");
  } catch {
    console.log("Presign não retornou JSON:", presignText);
    throw new Error("Resposta do presign não é JSON válido.");
  }

  const presignedUrl = presignJson?.url;
  if (!presignedUrl) {
    console.log("Presign JSON sem 'url':", presignJson);
    throw new Error("Endpoint de presign não retornou campo 'url'.");
  }
  console.log("URL pré-assinada recebida.");

  // 4) Upload
  console.log(`Enviando "${key}" para S3…`);
  const up = await FileSystem.uploadAsync(presignedUrl, dbPath, {
    httpMethod: "PUT",
    headers: { "Content-Type": contentType },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  console.log("Upload status:", up.status);
  if (up.status !== 200 && up.status !== 201 && up.status !== 204) {
    console.log("Corpo da resposta (parcial):", up.body?.slice(0, 500));
    throw new Error(`Falha no upload S3 (status ${up.status}).`);
  }

  const tookMs = Date.now() - startedAt;
  console.log(`Backup concluído com sucesso! • key: ${key} • tempo: ${(tookMs/1000).toFixed(1)}s`);
  console.log("━━━━━━━━━━ BACKUP → S3 (FIM) ━━━━━━━━━━━━");

  return key; // mantém compatibilidade com o chamador
}
