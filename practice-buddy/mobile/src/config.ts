// AEEG Practice Buddy - React Native App Configuration
// Android: app/build.gradle
android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.aeeg.practicebuddy"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    // Security: Disable screenshots in production
    if (project.hasProperty('RELEASE_STORE_FILE')) {
        buildTypes {
            release {
                minifyEnabled true
                proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            }
        }
    }
}

// Android AndroidManifest.xml additions:
// <activity
//     android:name=".MainActivity"
//     android:screenOrientation="fullSensor"
//     android:windowSoftInputMode="adjustResize"
//     android:excludeFromRecents="false"
//     android:supportsPictureInPicture="false">
//     <!-- FLAG_SECURE for content protection -->
// </activity>

// iOS Info.plist additions:
// <key>UIApplicationExitsOnSuspend</key>
// <false/>
// <key>UIViewControllerBasedStatusBarAppearance</key>
// <false/>
// <key>NSAppTransportSecurity</key>
// <dict>
//     <key>NSAllowsArbitraryLoads</key>
//     <true/>
// </dict>
// <key>UIApplicationSupportsIndirectInputEvents</key>
// <true/>
// <key>UIFileSharingEnabled</key>
// <false/>
// <key>LSSupportsOpeningDocumentsInPlace</key>
// <false/>

// App Store deployment checklist:
// 1. Create App Store Connect listing
// 2. Configure In-App Purchases for subscriptions
// 3. Set up App Store Review Notes
// 4. Prepare privacy policy URL
// 5. Test with TestFlight
// 6. Submit for review
// 7. Prepare for release

// Google Play deployment checklist:
// 1. Create Google Play Console listing
// 2. Set up Google Play Billing for subscriptions
// 3. Upload signed APK/AAB
// 4. Complete content rating questionnaire
// 5. Set up pricing and distribution
// 6. Roll out to production