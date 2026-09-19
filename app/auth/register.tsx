import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TARGET_EXAMS = [
  'FMGE (Dec 2026)',
  'NEET PG 2026',
  'USMLE Step 1',
  'INI-CET 2026',
];

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetExam, setTargetExam] = useState(TARGET_EXAMS[0]);
  const [loading, setLoading] = useState(false);

  const btnScale = useSharedValue(1);
  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password, fullName.trim(), targetExam);
    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes('network request failed')) {
        Alert.alert(
          'Network Connection Failed',
          'Unable to reach Supabase. This typically happens when:\n\n1. Metro cached the previous .env file — please restart Expo with: npx expo start -c\n2. The emulator or device does not have an active internet connection.'
        );
      } else {
        Alert.alert('Registration Failed', error.message);
      }
    } else {
      Alert.alert(
        'Account Created! 🎉',
        'Welcome to DocLock. Your candidate profile has been initialized.',
        [{ text: 'Start Studying', onPress: () => router.replace('/(tabs)') }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
          </Pressable>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Candidate Registration</Text>
          <Text style={styles.subtitle}>
            Create your account to unlock high-yield clinical MCQs and live classes
          </Text>
        </View>

        <View style={styles.card}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL LEGAL NAME</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Dr. Alex Rivera"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="alex.rivera@doclock.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CREATE PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Minimum 6 characters"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Target Exam Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>TARGET MEDICAL EXAMINATION</Text>
            <View style={styles.examPillsRow}>
              {TARGET_EXAMS.map((exam) => {
                const isSelected = targetExam === exam;
                return (
                  <Pressable
                    key={exam}
                    onPress={() => setTargetExam(exam)}
                    style={[styles.examPill, isSelected && styles.examPillSelected]}
                  >
                    <Text
                      style={[styles.examPillText, isSelected && styles.examPillTextSelected]}
                    >
                      {exam}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Submit Button */}
          <AnimatedPressable
            onPress={handleRegister}
            disabled={loading}
            onPressIn={() => {
              btnScale.value = withSpring(0.96, Motion.tactileSpring);
            }}
            onPressOut={() => {
              btnScale.value = withSpring(1, Motion.tactileSpring);
            }}
            style={[styles.submitBtn, btnAnimStyle]}
          >
            <LinearGradient
              colors={['#0059b9', '#004591']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.btnText}>Complete Registration</Text>
                  <MaterialIcons name="check" size={18} color="#ffffff" />
                </>
              )}
            </LinearGradient>
          </AnimatedPressable>

          {/* Login Callout */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/auth/login' as any)}>
              <Text style={styles.loginLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  topBar: {
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#001b3f',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#424753',
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },
  examPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  examPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  examPillSelected: {
    backgroundColor: '#d7e2ff',
    borderColor: Colors.primary,
  },
  examPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  examPillTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 12,
  },
  btnGradient: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
