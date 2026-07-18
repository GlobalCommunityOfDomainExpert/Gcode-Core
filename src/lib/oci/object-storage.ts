import * as common from "oci-common";
import * as objectstorage from "oci-objectstorage";

// Server-only. Never import this from a client component — it reads the
// private key from env and would leak it into the browser bundle.
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

let client: objectstorage.ObjectStorageClient | null = null;

function getClient(): objectstorage.ObjectStorageClient {
  if (client) return client;

  const provider = new common.SimpleAuthenticationDetailsProvider(
    requiredEnv("OCI_TENANCY_OCID"),
    requiredEnv("OCI_USER_OCID"),
    requiredEnv("OCI_FINGERPRINT"),
    // .env files store literal "\n" for newlines in a PEM block.
    requiredEnv("OCI_PRIVATE_KEY").replace(/\\n/g, "\n"),
    null,
    common.Region.fromRegionId(requiredEnv("OCI_REGION")),
  );

  client = new objectstorage.ObjectStorageClient({
    authenticationDetailsProvider: provider,
  });
  return client;
}

// Same object path per participant on every call — a re-record overwrites
// the previous upload instead of accumulating orphaned objects.
function audioObjectName(participantId: string): string {
  return `participants/${participantId}/audio.webm`;
}

// Uploaded server-side (this route, via oci-objectstorage's putObject) —
// browser can't PUT to OCI directly without a CORS rule on the bucket, and
// that console option wasn't available, so the blob is proxied through here
// instead of using a pre-authenticated request.
export async function uploadAudioObject(
  participantId: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  const namespace = requiredEnv("OCI_NAMESPACE");
  const bucketName = requiredEnv("OCI_BUCKET_NAME");
  const region = requiredEnv("OCI_REGION");
  const objectName = audioObjectName(participantId);

  await getClient().putObject({
    namespaceName: namespace,
    bucketName,
    objectName,
    putObjectBody: body,
    contentLength: body.length,
    contentType,
  });

  // Plain object URL, not a PAR — only resolves for a reviewer without
  // another signed link if the bucket's visibility is set to "Public"
  // (read-only) in OCI. Same "anyone with the link" trust model as the old
  // Drive-link flow, just backed by the bucket setting instead.
  const host = `https://objectstorage.${region}.oraclecloud.com`;
  return `${host}/n/${namespace}/b/${bucketName}/o/${encodeURIComponent(objectName)}`;
}
