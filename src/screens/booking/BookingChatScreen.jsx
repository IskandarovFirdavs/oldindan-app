import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../components/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getBookingMessages, sendBookingMessage } from '../../api';

export default function BookingChatScreen({ navigation, route }) {
  const { bookingId, branchName } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await getBookingMessages(bookingId);
      setMessages(data);
    } catch {
      setMessages([]);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  const handleSend = async () => {
    const msg = text.trim();
    if (!msg || sending) return;
    setSending(true);
    setText('');
    try {
      const created = await sendBookingMessage(bookingId, msg);
      setMessages((prev) => [...prev, created]);
      setTimeout(() => listRef.current?.scrollToEnd(), 100);
    } catch {
      setText(msg);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === user?.id;
    return (
      <View style={[styles.bubbleWrap, isMe ? styles.meWrap : styles.themWrap]}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isMe ? theme.colors.primary : theme.colors.inputBg,
            },
          ]}
        >
          {!isMe && (
            <Text style={[styles.senderName, { color: theme.colors.textSecondary }]}>
              {item.sender_name || branchName}
            </Text>
          )}
          <Text style={[styles.msgText, { color: isMe ? '#FFF' : theme.colors.text }]}>
            {item.text}
          </Text>
          <Text style={[styles.time, { color: isMe ? '#FFFFFFAA' : theme.colors.textSecondary }]}>
            {new Date(item.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScreenHeader title={branchName || 'Chat'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
              No messages yet. Say hello to the restaurant!
            </Text>
          }
        />
        <View style={[styles.inputRow, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.inputBg, color: theme.colors.text }]}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: theme.colors.primary, opacity: text.trim() ? 1 : 0.4 }]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  list: { padding: 16, flexGrow: 1 },
  bubbleWrap: { marginBottom: 10, maxWidth: '80%' },
  meWrap: { alignSelf: 'flex-end' },
  themWrap: { alignSelf: 'flex-start' },
  bubble: { borderRadius: 16, padding: 12 },
  senderName: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  msgText: { fontSize: 15, lineHeight: 20 },
  time: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
