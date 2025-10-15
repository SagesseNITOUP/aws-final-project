import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION || "eu-west-3" });

export const handler = async (event) => {
  try {
    const { filename, contentType } = JSON.parse(event.body || "{}");
    if (!filename || !contentType) return { statusCode: 400, body: JSON.stringify({ error: "Filename and contentType required" }) };

    const key = `${uuidv4()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.ATTACHMENTS_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour

    return { statusCode: 200, body: JSON.stringify({ uploadUrl: url, key }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not generate signed URL" }) };
  }
};
