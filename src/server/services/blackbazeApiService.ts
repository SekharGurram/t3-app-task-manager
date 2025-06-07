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
  async getSignedUrl(fileName: string): Promise<string> {
    // Authorize and get account-level info
    const b2 = new B2({
      applicationKeyId: B2_KEY_ID,
      applicationKey: B2_APP_KEY,
    });

    await b2.authorize();
    const authResponse = await b2.authorize();

    // Generate download authorization token for this file
    const downloadAuth = await b2.getDownloadAuthorization({
      bucketId: B2_BUCKET_ID,
      fileNamePrefix: fileName, // must be exact filename
      validDurationInSeconds: 3600, // 1 hour
    });

    // Construct the signed URL
    const signedUrl = `${authResponse.data.downloadUrl}/file/${B2_BUCKET_NAME}/${encodeURIComponent(fileName)}?Authorization=${encodeURIComponent(downloadAuth.data.authorizationToken)}`;

    return signedUrl;
  }

}
export default BlackbazeAPIService;