import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const client = new S3Client({
	region: "auto",
	endpoint: process.env.R2_ENDPOINT,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID!,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
	},
});

const bucket = process.env.R2_BUCKET_NAME || "noro-vaults";

export async function upload(key: string, data: Buffer): Promise<void> {
	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: data,
			ContentType: "application/octet-stream",
		}),
	);
}

export async function download(key: string): Promise<Buffer | null> {
	try {
		const response = await client.send(
			new GetObjectCommand({
				Bucket: bucket,
				Key: key,
			}),
		);
		const stream = response.Body;
		if (!stream) return null;
		const chunks: Uint8Array[] = [];
		for await (const chunk of stream as AsyncIterable<Uint8Array>) {
			chunks.push(chunk);
		}
		return Buffer.concat(chunks);
	} catch {
		return null;
	}
}

export async function remove(key: string): Promise<void> {
	await client.send(
		new DeleteObjectCommand({
			Bucket: bucket,
			Key: key,
		}),
	);
}

export function vaultkey(userId: string): string {
	return `vaults/${userId}/vault.enc`;
}
