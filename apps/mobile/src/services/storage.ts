import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase, RECEIPTS_BUCKET } from "@/config/supabase";

export interface UploadedAttachment {
  url: string;
  name: string;
  path: string;
}

// Le o arquivo local (uri do ImagePicker/DocumentPicker) como base64 e envia
// como ArrayBuffer. Evita usar fetch()+blob(), que trava silenciosamente
// para arquivos locais em alguns ambientes React Native (Hermes/Expo Go).
export async function uploadAttachment(
  userId: string,
  uri: string,
  name: string,
): Promise<UploadedAttachment> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const arrayBuffer = decode(base64);
  const path = `${userId}/${Date.now()}-${name}`;

  const extension = name.split(".").pop()?.toLowerCase();
  const contentType =
    extension === "png"
      ? "image/png"
      : extension === "pdf"
        ? "application/pdf"
        : "image/jpeg";

  const { error: uploadError } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(RECEIPTS_BUCKET).getPublicUrl(path);

  return { url: data.publicUrl, name, path };
}

export async function removeAttachment(path: string) {
  try {
    await supabase.storage.from(RECEIPTS_BUCKET).remove([path]);
  } catch {
    // Se o arquivo ja nao existe, seguimos sem erro.
  }
}
