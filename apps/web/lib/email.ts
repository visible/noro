import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;

const from = "noro <noreply@noro.sh>";

export async function sendverification(email: string, url: string) {
	if (!resend) {
		console.log("[email] verification email (no api key):", email, url);
		return;
	}
	await resend.emails.send({
		from,
		to: email,
		subject: "verify your email",
		html: `
			<div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
				<h1 style="font-size: 24px; font-weight: 600; margin: 0 0 24px;">verify your email</h1>
				<p style="color: #666; margin: 0 0 24px; line-height: 1.5;">
					click the button below to verify your email address and complete your registration.
				</p>
				<a href="${url}" style="display: inline-block; background: #d4b08c; color: #0a0a0a; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
					verify email
				</a>
				<p style="color: #999; font-size: 14px; margin: 32px 0 0; line-height: 1.5;">
					if you didn't create an account, you can ignore this email.
				</p>
			</div>
		`,
	});
}

export async function sendreset(email: string, url: string) {
	if (!resend) {
		console.log("[email] reset email (no api key):", email, url);
		return;
	}
	await resend.emails.send({
		from,
		to: email,
		subject: "reset your password",
		html: `
			<div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
				<h1 style="font-size: 24px; font-weight: 600; margin: 0 0 24px;">reset your password</h1>
				<p style="color: #666; margin: 0 0 24px; line-height: 1.5;">
					click the button below to reset your password. this link expires in 1 hour.
				</p>
				<a href="${url}" style="display: inline-block; background: #d4b08c; color: #0a0a0a; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
					reset password
				</a>
				<p style="color: #999; font-size: 14px; margin: 32px 0 0; line-height: 1.5;">
					if you didn't request this, you can ignore this email.
				</p>
			</div>
		`,
	});
}
