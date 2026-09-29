import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/auth-provider';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatUsPhone, toUsE164 } from '@/lib/phone';
import { supabase } from '@/lib/supabase';

/** Supabase allows one code per number per minute by default. */
const RESEND_SECONDS = 60;

type Step = { name: 'phone' } | { name: 'code'; phone: string } | { name: 'name' };

/**
 * Sign in with a phone number and a texted code, in three steps: phone, code, and,
 * the first time only, the customer's name for the packing list. New numbers get an
 * account automatically, so there's no separate sign-up.
 */
export default function SignInScreen() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>({ name: 'phone' });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Keeps the button above the iPhone keyboard; Android resizes the screen itself. */}
        <KeyboardAvoidingView
          style={styles.container}
          behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <ThemedText type="subtitle">{t('signIn.title')}</ThemedText>
            {step.name === 'phone' && (
              <PhoneStep onSent={(phone) => setStep({ name: 'code', phone })} />
            )}
            {step.name === 'code' && (
              <CodeStep
                phone={step.phone}
                onChangeNumber={() => setStep({ name: 'phone' })}
                onNeedsName={() => setStep({ name: 'name' })}
              />
            )}
            {step.name === 'name' && <NameStep />}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

/** Back to wherever sign-in was opened from, or the lunchbox if it was opened directly. */
function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

function PhoneStep({ onSent }: { onSent: (phone: string) => void }) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phone = toUsE164(input);

  const send = async () => {
    if (!phone || sending) return;
    setSending(true);
    setError(null);
    const { error: sendError } = await supabase.auth.signInWithOtp({ phone });
    setSending(false);
    if (sendError) setError(t(errorKey(sendError)));
    else onSent(phone);
  };

  return (
    <>
      <ThemedText themeColor="textSecondary">{t('signIn.phoneIntro')}</ThemedText>
      <TextField
        label={t('signIn.phoneLabel')}
        prefix="+1"
        value={input}
        onChangeText={setInput}
        onSubmitEditing={send}
        placeholder="(336) 555-0100"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        autoFocus
      />
      <ErrorText error={error} />
      <PrimaryButton
        label={sending ? t('signIn.sending') : t('signIn.sendCode')}
        onPress={send}
        disabled={!phone || sending}
      />
      {/* Consent for order texts (see the spec's "Text messages" section). */}
      <ThemedText type="small" themeColor="textSecondary">
        {t('signIn.consent')}
      </ThemedText>
    </>
  );
}

type CodeStepProps = {
  phone: string;
  onChangeNumber: () => void;
  onNeedsName: () => void;
};

function CodeStep({ phone, onChangeNumber, onNeedsName }: CodeStepProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bumped after each resend to restart the resend countdown.
  const [resendCount, setResendCount] = useState(0);

  const verify = async (token = code) => {
    if (token.length !== 6 || verifying) return;
    setVerifying(true);
    setError(null);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (verifyError || !data.user) {
      setVerifying(false);
      setError(t(verifyError ? errorKey(verifyError) : 'signIn.genericError'));
      return;
    }
    // Record when they agreed to order texts, the first time only.
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, sms_consent_at')
      .eq('id', data.user.id)
      .single();
    if (profile && !profile.sms_consent_at) {
      await supabase
        .from('profiles')
        .update({ sms_consent_at: new Date().toISOString() })
        .eq('id', data.user.id);
    }
    if (profile?.full_name) close();
    else onNeedsName();
  };

  const resend = async () => {
    setError(null);
    const { error: sendError } = await supabase.auth.signInWithOtp({ phone });
    if (sendError) setError(t(errorKey(sendError)));
    else setResendCount((count) => count + 1);
  };

  return (
    <>
      <ThemedText themeColor="textSecondary">
        {t('signIn.codeIntro', { phone: formatUsPhone(phone) })}
      </ThemedText>
      <TextField
        label={t('signIn.codeLabel')}
        value={code}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '').slice(0, 6);
          setCode(digits);
          // Submit as soon as all six digits are in, e.g. from the phone's autofill.
          if (digits.length === 6) verify(digits);
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={6}
        autoFocus
      />
      <ErrorText error={error} />
      <PrimaryButton
        label={verifying ? t('signIn.verifying') : t('signIn.verify')}
        onPress={() => verify()}
        disabled={code.length !== 6 || verifying}
      />
      <View style={styles.links}>
        <SecondaryLink label={t('signIn.changeNumber')} onPress={onChangeNumber} />
        <ResendLink key={resendCount} onPress={resend} />
      </View>
    </>
  );
}

/** Disabled for a minute after each code is sent; remounted via `key` to restart. */
function ResendLink({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const remaining = useCountdown(RESEND_SECONDS);
  return (
    <SecondaryLink
      label={remaining > 0 ? t('signIn.resendIn', { seconds: remaining }) : t('signIn.resend')}
      onPress={onPress}
      disabled={remaining > 0}
    />
  );
}

function NameStep() {
  const { t } = useTranslation();
  const { session, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = name.trim();

  const save = async () => {
    if (!trimmed || saving || !session) return;
    setSaving(true);
    setError(null);
    const { error: saveError } = await supabase
      .from('profiles')
      .update({ full_name: trimmed })
      .eq('id', session.user.id);
    setSaving(false);
    if (saveError) {
      setError(t('signIn.genericError'));
      return;
    }
    await refreshProfile();
    close();
  };

  return (
    <>
      <ThemedText themeColor="textSecondary">{t('signIn.nameIntro')}</ThemedText>
      <TextField
        label={t('signIn.nameLabel')}
        value={name}
        onChangeText={setName}
        onSubmitEditing={save}
        textContentType="name"
        autoComplete="name"
        autoCapitalize="words"
        autoFocus
      />
      <ErrorText error={error} />
      <PrimaryButton
        label={t('signIn.saveName')}
        onPress={save}
        disabled={!trimmed || saving}
      />
    </>
  );
}

/** Counts down once a second from `from` to 0. */
function useCountdown(from: number) {
  const [secondsLeft, setSecondsLeft] = useState(from);
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);
  return secondsLeft;
}

/** The message for the errors customers are likely to hit. */
function errorKey(error: { code?: string; status?: number }) {
  if (error.code === 'otp_expired' || error.code === 'invalid_credentials') {
    return 'signIn.wrongCode';
  }
  if (error.status === 429 || error.code === 'over_sms_send_rate_limit') {
    return 'signIn.tooMany';
  }
  return 'signIn.genericError';
}

function ErrorText({ error }: { error: string | null }) {
  const theme = useTheme();
  if (!error) return null;
  return (
    <ThemedText type="small" role="alert" style={{ color: theme.tint }}>
      {error}
    </ThemedText>
  );
}

type ButtonProps = { label: string; onPress: () => void; disabled?: boolean };

function PrimaryButton({ label, onPress, disabled }: ButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      role="button"
      aria-disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: theme.primary },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function SecondaryLink({ label, onPress, disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      role="button"
      aria-disabled={disabled}
      hitSlop={Spacing.two}
      style={({ pressed }) => pressed && styles.pressed}>
      <ThemedText type="small" themeColor={disabled ? 'textSecondary' : 'tint'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
});
