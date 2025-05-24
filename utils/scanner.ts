// utils/scanner.ts
import { recordScan } from './api';
import { supabase } from './supabase';

import { Camera } from 'expo-camera';
import { launchImageLibraryAsync } from 'expo-image-picker';

export type ScanResult = { status: string; url: string } | undefined;

export async function handleQRScanned({ type, data }: { type: string; data: string }) : Promise<ScanResult> {
    try {// Get current session for authenticated user
        // Validate input types, ignore any data that is not a string
        if (typeof type !== 'string' || typeof data !== 'string' || data.trim() === '') {
            console.warn('Invalid QR scan data received, ignoring.');
            return;
        }
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user?.id) {
            console.warn('No authenticated user, skipping recordScan');
            // store on local storage. (Will probably have to do an import history once user signs up)
            return;
        }

        // Placeholder. To be replaced with actual functions to check in the future
        //const securityStatus = 'Safe' // ← PLACEHOLDER SECURITY STATUS
        //const securityStatus = 'Malicious' // ← PLACEHOLDER SECURITY STATUS
        const securityStatus = 'Suspicious' // ← PLACEHOLDER SECURITY STATUS

        // Insert a new row into qr_scans
        const payload = {
            user_id: session.user.id,
            decoded_content: data.trim(),
            security_status: securityStatus,
        };

        try {
            const inserted = await recordScan(payload);
            console.log('Scan recorded:', inserted);
            return { status: securityStatus, url: data };
        } catch (insertError) {
            console.error('Failed to record scan:', insertError);
        }

    } catch (err) {
        console.error('Error in handleQRScanned:', err);
    }
}

export async function pickImageAndScan(handleQRScanned: (result: { type: string; data: string }) => Promise<ScanResult>): Promise<ScanResult> {
    const result = await launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
    });

    if (!result.canceled && Array.isArray(result.assets) && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (!uri || typeof uri !== 'string') {
            console.warn('Invalid image URI');
            return;
        }
        try {
            const scanResult = await Camera.scanFromURLAsync(uri, ['qr']);
            console.log("Gallery SCan")
            if (Array.isArray(scanResult) && scanResult.length > 0) {
                const { type, data } = scanResult[0];
                if (type.toString() === '256' && typeof data === 'string') { // QR Codes will always return type 256
                    const type = 'qr'
                    return handleQRScanned({ type, data });
                } else {
                    console.warn('Invalid QR scan result data');
                }
            } else {
                console.warn('No QR code found in the image');
            }
        } catch (err) {
            console.error('Failed to scan image:', err);
        }
    }
}