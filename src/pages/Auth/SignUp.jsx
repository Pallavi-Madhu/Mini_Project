import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../Theme/ThemeContext';
import { supabase } from '../../lib/supabaseClient';

export default function SignUp({ navigation }) {
  const { colors } = useAppTheme();
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !userId || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    // 1. Create auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, user_id: userId }, // stored in auth.users raw_user_meta_data
      },
    });

    if (signUpError) {
      setLoading(false);
      Alert.alert('Sign Up Failed', signUpError.message);
      return;
    }

    // 2. Insert profile row into a 'profiles' table (optional but recommended)
    // Make sure you have a 'profiles' table in Supabase:
    //   id uuid references auth.users(id), name text, user_id text, email text
    if (data?.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        user_id: userId,
        email,
      });

      if (profileError) {
        console.warn('Profile insert failed:', profileError.message);
        // Non-fatal: auth account was created successfully
      }
    }

    setLoading(false);
    Alert.alert(
      'Account Created!',
      'Please check your email to confirm your account, then sign in.',
      [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="heart-pulse" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Join us today,</Text>
            <Text style={[styles.title, { color: colors.text }]}>Cure Connect</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Create Account</Text>

            {/* Name */}
            <View style={styles.fieldWrapper}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Icon name="account-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* User ID */}
            <View style={styles.fieldWrapper}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>User ID</Text>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Icon name="badge-account-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g. DOC-001"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  value={userId}
                  onChangeText={setUserId}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldWrapper}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Icon name="email-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldWrapper}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Icon name="lock-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Icon
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleSignUp}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="account-plus" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },

  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: { fontSize: 17 },
  title: { fontSize: 28, fontWeight: 'bold' },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },

  fieldWrapper: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15 },
  eyeIcon: { padding: 4 },

  primaryButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: 14 },
  linkText: { fontSize: 14, fontWeight: '700' },
});