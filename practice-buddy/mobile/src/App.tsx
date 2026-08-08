// AEEG Practice Buddy - React Native Entry Point
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  BackHandler,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import RNEncryptedStorage from 'react-native-encrypted-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const API_URL = 'http://191.218.165.228:3001';
const FRONTEND_URL = 'http://191.218.165.228:3000/practice-buddy';

const Stack = createStackNavigator();

// Loading screen component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1a56db" />
      <Text style={styles.loadingText}>Loading Practice Buddy...</Text>
    </View>
  );
}

// Main WebView wrapper
function PracticeBuddyWebView({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    loadToken();
    
    // Handle Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'Exit Practice Buddy?',
        'Your progress will be saved automatically.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => BackHandler.exitApp() },
        ]
      );
      return true;
    });

    return () => backHandler.remove();
  }, []);

  async function loadToken() {
    try {
      const saved = await RNEncryptedStorage.getItem('pb_token');
      if (saved) setToken(saved);
    } catch {}
    setLoading(false);
  }

  // Inject token into WebView
  const injectedJS = `
    (function() {
      if ('${token}') {
        localStorage.setItem('pb_token', '${token}');
      }
      // Prevent screenshots where supported
      document.addEventListener('keydown', function(e) {
        if (e.key === 'PrintScreen') {
          e.preventDefault();
        }
      });
      // Prevent context menu
      document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
      });
    })();
  `;

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView
        source={{ uri: FRONTEND_URL }}
        style={styles.webview}
        onLoad={() => setLoading(false)}
        injectedJavaScript={injectedJS}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => <LoadingScreen />}
        allowsBackForwardNavigationGestures={true}
        allowsInlineMediaPlayback={true}
        sharedCookiesEnabled={true}
        // Security: disable zoom
        scalesPageToFit={false}
        // Prevent content capture
        androidLayerType="hardware"
        // Handle navigation
        onNavigationStateChange={(navState) => {
          // Track login state changes
          if (navState.url?.includes('logout')) {
            RNEncryptedStorage.removeItem('pb_token');
          }
        }}
        // Error handling
        onError={() => {
          Alert.alert('Connection Error', 'Unable to connect to Practice Buddy. Please check your internet connection.');
        }}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PracticeBuddy" component={PracticeBuddyWebView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
});