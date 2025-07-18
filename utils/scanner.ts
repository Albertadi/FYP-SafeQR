    // utils/scanner.ts
    import { recordScan } from './api';
import { supabase } from './supabase';

    import { Camera } from 'expo-camera';
import { launchImageLibraryAsync } from 'expo-image-picker';

    import { checkUrlSafety } from './GoogleSafeAPI';

    export type ScanResult = { status: string; url: string } | undefined;

    export async function handleQRScanned({ type, data }: { type: string; data: string }): Promise<ScanResult> {
        try {
            // 1. Validate input
            if (typeof type !== 'string' || typeof data !== 'string' || data.trim() === '') {
                console.warn('Invalid QR scan data received, ignoring.');
                return;
            }

            const trimmedData = data.trim();

            // 2. Check if user is logged in
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            // 3. Check URL safety using Google Safe Browsing API
            const securityStatus = await checkUrlSafety(trimmedData); // ← Integrated here

            // 4. If user is not logged in, return safe status without storing
            if (sessionError || !session?.user?.id) {
                console.warn('No authenticated user, skipping recordScan');
                return {
                    status: securityStatus,
                    url: trimmedData,
                };
            }

            // 5. Prepare data to store
            const payload = {
                user_id: session.user.id,
                decoded_content: trimmedData,
                security_status: securityStatus,
            };

            try {
                const inserted = await recordScan(payload);
                console.log('Scan recorded:', inserted);
                return { status: securityStatus, url: trimmedData };
            } catch (insertError) {
                console.error('Failed to record scan:', insertError);
                // Still return the scan result even if DB insert fails
                return { status: securityStatus, url: trimmedData };
            }

        } catch (err) {
            console.error('Error in handleQRScanned:', err);
            return;
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