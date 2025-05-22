import { recordScan } from '@/utils/api';
import { supabase } from '@/utils/supabase';
import React, { useEffect, useState } from 'react';
import { Button, Image, View, StyleSheet, Alert, Text, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, CameraView } from 'expo-camera';

export default function LibraryTab() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<string | null>(null);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets?.length > 0) {
            setImage(result.assets[0].uri);
            setScanResult(null);
        }
    };

    const readImage = async () => {
        if (!image) return;
        try {
            const result = await Camera.scanFromURLAsync(image);
            if (result.length > 0) {
                const { type, data } = result[0];
                setScanResult(data);

                Alert.alert(`Scanned ${type}:`, data, // This is the message string
                    [{
                        text: 'OK',
                        onPress: () => {
                            setImage(null);       // Reset image
                            setScanResult(null);  // Reset scan result
                        },},],
                    { cancelable: false });

                await handleQRScanned({ type, data });
            } else {
                alert('No QR code found');
            }
        } catch (error) {
            console.error('Scan error:', error);
            alert('Failed to scan image');
        }
    };

    const handleQRScanned = async ({ type, data }: { type: string; data: string }) => {
        try {
            // Get current session for authenticated user
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError || !session?.user?.id) {
                console.warn('No authenticated user, skipping recordScan');
                return;
            }

            // Insert a new row into qr_scans
            const payload = {
                user_id: session.user.id,
                decoded_content: data,
                security_status: 'Safe',  // ← PLACEHOLDER SECURITY STATUS
            };

            try {
                const inserted = await recordScan(payload);
                console.log('Scan recorded:', inserted);
            } catch (insertError) {
                console.error('Failed to record scan:', insertError);
            }

        } catch (err) {
            console.error('Error in handleQRScanned:', err);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        fullImage: {
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            resizeMode: 'contain',
        },
        resultText: {
            position: 'absolute',
            bottom: 120,
            fontSize: 16,
            color: 'black',
            backgroundColor: 'white',
            padding: 10,
        },
        scanButton: {
            position: 'absolute',
            bottom: 60,
        },
    });

    return (
        <View style={styles.container}>
            {!image ? (
                <Button title="Pick Image from Gallery" onPress={pickImage} />
            ) : (
                <>
                    <Image source={{ uri: image }} style={styles.fullImage} />
                    <View style={styles.scanButton}>
                        <Button title="Scan This Image" onPress={readImage} />
                    </View>
                    {scanResult && <Text style={styles.resultText}>Scanned Result: {scanResult}</Text>}
                </>
            )}
        </View>
    );
}
