import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { env } from '@/lib/env';

export async function POST(request: Request) {
    try {
        // Parse the request body
        const body = await request.json();
        const { name, email, subject, message } = body;

        console.log({ body, env });

        // Validate required fields
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            );
        }

        // Check if email credentials are configured
        if (!env.EMAIL_USER || !env.EMAIL_PASS) {
            console.error('Email credentials not configured');
            return NextResponse.json(
                { error: 'Email service not configured' },
                { status: 500 }
            );
        }

        console.log({ email: env.EMAIL_USER, pass: env.EMAIL_PASS });

        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: env.EMAIL_USER,
                pass: env.EMAIL_PASS,
            },
        });

        // Email content
        const mailOptions = {
            from: email,
            to: 'danny.israel@gmail.com', // The recipient email
            // to: 'perri.p.lo@gmail.com', // The recipient email
            subject: `Contact Form: ${subject || 'New message from portfolio website'}`,
            text: `
        Name: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `,
            html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Return success response
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
} 