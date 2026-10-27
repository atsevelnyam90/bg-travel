import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT;
const bucket = process.env.S3_BUCKET;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
  throw new Error("S3_ENDPOINT, S3_BUCKET and S3 credentials are required");
}

const client = new S3Client({
  endpoint,
  region: process.env.S3_REGION ?? "us-east-1",
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
});

for (let attempt = 0; attempt < 20; attempt += 1) {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    break;
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404) {
      await client.send(new CreateBucketCommand({ Bucket: bucket }));
      break;
    }
    if (attempt === 19) throw error;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

// Public website images need direct GET. Contract documents stay private.
await client.send(
  new PutBucketPolicyCommand({
    Bucket: bucket,
    Policy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicWebsiteImages",
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [
            `arn:aws:s3:::${bucket}/product/*`,
            `arn:aws:s3:::${bucket}/avatar/*`,
            `arn:aws:s3:::${bucket}/travel/*`,
          ],
        },
      ],
    }),
  }),
);

console.log("Object storage bucket and public image prefixes are ready");
