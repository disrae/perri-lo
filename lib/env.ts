// Environment variables with validation
export const env = {
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASS: process.env.EMAIL_PASS || '',
};

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
    const missingVars = Object.entries(env)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingVars.length > 0) {
        console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        // In production, you might want to throw an error or log to a monitoring service
    }
} 