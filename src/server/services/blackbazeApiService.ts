import B2 from "backblaze-b2";
import { B2_BUCKET_ID, B2_APP_KEY, B2_KEY_ID, B2_BUCKET_NAME } from "../config/blackbaze";
class BlackbazeAPIService {
  async uploadToB2(fileName: string, fileBuffer: Buffer, mimeType: string) {
    const b2 = new B2({
      applicationKeyId: B2_KEY_ID,
      applicationKey: B2_APP_KEY,
    });

    await b2.authorize();

    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: B2_BUCKET_ID,
    });

    const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

    const result = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName,
      data: fileBuffer,
      mime: mimeType,
    });

    const publicUrl = `https://f000.backblazeb2.com/file/${B2_BUCKET_NAME}/${encodeURIComponent(fileName)}`;
    return publicUrl;
  }

async getPrivateImageAsBase64(fileName: string): Promise<{ base64: string; mimeType: string }> {
      const b2 = new B2({
      applicationKeyId: B2_KEY_ID,
      applicationKey: B2_APP_KEY,
    });
  await b2.authorize();

  const response = await b2.downloadFileByName({
    bucketName: B2_BUCKET_NAME,
    fileName,
    responseType: "stream",   // <--- Add this
  });

  const contentType = response.headers['content-type'] || 'application/octet-stream';

  const stream = response.data as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  const buffer = Buffer.concat(chunks);
  const base64 = buffer.toString('base64');
  console.log("base64",base64)
  return {
    base64: `data:${contentType};base64,${base64}`,
    mimeType: contentType,
  };
}

}
export default BlackbazeAPIService;