import B2 from "backblaze-b2";
import { B2_BUCKET_ID, B2_APP_KEY, B2_KEY_ID, B2_BUCKET_NAME, B2_BASE_URL } from "../config/blackbaze";
class BlackbazeAPIService {
  blackbaze: any;
  constructor() {
    this.blackbaze = new B2({
      applicationKeyId: B2_KEY_ID,
      applicationKey: B2_APP_KEY,
    });
  }

  async uploadToB2(fileName: string, fileBuffer: Buffer, mimeType: string) {
    await this.blackbaze.authorize();
    const uploadUrlResponse = await this.blackbaze.getUploadUrl({
      bucketId: B2_BUCKET_ID,
    });

    const { uploadUrl, authorizationToken } = uploadUrlResponse.data;
    await this.blackbaze.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName,
      data: fileBuffer,
      mime: mimeType,
    });

    const publicUrl = `${B2_BASE_URL}/file/${B2_BUCKET_NAME}/${encodeURIComponent(fileName)}`;
    return publicUrl;
  }
  async getSignedUrl(fileName: string): Promise<string> {
    await this.blackbaze.authorize();
    const authResponse = await this.blackbaze.authorize();

    // Generate download authorization token for this file
    const downloadAuth = await this.blackbaze.getDownloadAuthorization({
      bucketId: B2_BUCKET_ID,
      fileNamePrefix: fileName,
      validDurationInSeconds: 3600, // 1 hour valid
    });

    // signed Url
    const signedUrl = `${authResponse.data.downloadUrl}/file/${B2_BUCKET_NAME}/${encodeURIComponent(fileName)}?Authorization=${encodeURIComponent(downloadAuth.data.authorizationToken)}`;
    return signedUrl;
  }

}
export default BlackbazeAPIService;