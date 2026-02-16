import sendEmail from './mailer';

export async function sendVerificationEmail(email: string, verificationCode: string) {
    try {
        await sendEmail(
            'Verify your email',
            email,
            'verificationEmail', // EJS template name (no need to import)
            { verificationCode } // Data to replace placeholders
        );
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
}

export async function sendWelcomeEmail(email: string, name: string) {
    try {
        await sendEmail(
            'Welcome to Our Service!',
            email,
            'welcomeEmail', // EJS template name (no need to import)
            { name } // Data to replace placeholders
        );
        console.log('Welcome email sent successfully');
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
}

export async function sendPasswordResetEmail(email: string, resetURL: string) {
    try {
        await sendEmail(
            'Reset your password',
            email,
            'passwordResetRequest', // EJS template name (no need to import)
            { resetURL } // Data to replace placeholders
        );
        console.log('Password reset email sent successfully');
    } catch (error) {
        console.error('Error sending password reset email:', error);
    }
}