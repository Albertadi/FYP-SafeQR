// app/permissionDenied.tsx
import PermissionScreen from '@/components/PermissionScreen';

import * as IntentLauncher from 'expo-intent-launcher';
import { useLocalSearchParams, useRouter, } from 'expo-router';
import { Linking, Platform, } from 'react-native';

export default function PermissionDenied() {
  const { type } = useLocalSearchParams();
  const router = useRouter();

  //Ensures that type is either camera or gallery. If not, pass undefined
  const stringType = Array.isArray(type) ? type[0] : type;
  const validTypes = ['camera', 'gallery'] as const;
  const permType = validTypes.includes(stringType as any) ? (stringType as 'camera' | 'gallery') : undefined;

  if (!permType) {
    console.log('Invalid permission type.')
    return (<PermissionScreen
        onOpenSettings={() => alert('Invalid permission type.')}
        permType={undefined}
      />
    );}

  const handleBack = () => router.replace('/');

  const openSettings = async () => {
    try {
      const checkAction = await Linking.canOpenURL('app-settings:'); // Works for iOS and newer Android phones

      if (checkAction) {
        await Linking.openSettings();
        return;
      }

      if (Platform.OS === 'android') { // Older android phones use package:example.com to open settings
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS, {
          data: 'package:host.exp.exponent', // Currently set to Expo Go package name. To be replaced with actual Android package name once app is ready to be deployed 
        });
        return;
      }
      alert('Unable to open settings. Please open them manually.')
    } catch (error) {
      alert('Unable to open settings. Please open them manually.');
    }
  };

  return <PermissionScreen
    onOpenSettings={openSettings}
    permType={permType}
    onBack={handleBack}
  />;
}
