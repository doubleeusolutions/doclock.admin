import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/theme';

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: 'faculty' | 'moderator' | 'student';
  avatar?: string | null;
  message: string;
  timestamp: string;
  isPinned?: boolean;
  isQuestion?: boolean;
  likesCount?: number;
}

interface LiveChatTabProps {
  messages?: ChatMessage[];
  onSendMessage?: (text: string, isQuestion?: boolean) => void;
  onSendReaction: (emoji: string) => void;
}

export const LiveChatTab: React.FC<LiveChatTabProps> = ({
  messages: propMessages,
  onSendMessage,
  onSendReaction,
}) => {
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messages = propMessages !== undefined ? propMessages : localMessages;
  const [inputText, setInputText] = useState('');
  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'questions' | 'faculty'>(
    'all'
  );

  const filteredMessages = messages.filter((m) => {
    if (filterMode === 'questions') return m.isQuestion;
    if (filterMode === 'faculty') return m.senderRole === 'faculty';
    return true;
  });

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();

    if (onSendMessage) {
      onSendMessage(text, isQuestionMode);
    } else {
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderName: 'Alex (You)',
        senderRole: 'student',
        message: text,
        timestamp: 'Just now',
        isQuestion: isQuestionMode,
        likesCount: 0,
      };
      setLocalMessages((prev) => [...prev, newMsg]);
    }
    setInputText('');
  };

  const handleLikeMessage = (id: string) => {
    if (propMessages === undefined) {
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, likesCount: (m.likesCount || 0) + 1 } : m
        )
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs Bar */}
      <View style={styles.filterBar}>
        <Pressable
          onPress={() => setFilterMode('all')}
          style={[
            styles.filterPill,
            filterMode === 'all' && styles.filterPillActive,
          ]}
        >
          <Text
            style={[
              styles.filterPillText,
              filterMode === 'all' && styles.filterPillTextActive,
            ]}
          >
            All Messages ({messages.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilterMode('questions')}
          style={[
            styles.filterPill,
            filterMode === 'questions' && styles.filterPillActive,
          ]}
        >
          <MaterialIcons
            name="help-outline"
            size={13}
            color={filterMode === 'questions' ? '#0059b9' : '#575f6e'}
          />
          <Text
            style={[
              styles.filterPillText,
              filterMode === 'questions' && styles.filterPillTextActive,
            ]}
          >
            Questions Only
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilterMode('faculty')}
          style={[
            styles.filterPill,
            filterMode === 'faculty' && styles.filterPillActive,
          ]}
        >
          <MaterialIcons
            name="verified"
            size={13}
            color={filterMode === 'faculty' ? '#0059b9' : '#575f6e'}
          />
          <Text
            style={[
              styles.filterPillText,
              filterMode === 'faculty' && styles.filterPillTextActive,
            ]}
          >
            Faculty
          </Text>
        </Pressable>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        style={styles.messagesScroll}
        contentContainerStyle={[
          styles.messagesContent,
          filteredMessages.length === 0 && styles.messagesContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredMessages.length === 0 ? (
          <View style={styles.emptyMessagesContainer}>
            <MaterialIcons name="chat-bubble-outline" size={40} color="#94a3b8" />
            <Text style={styles.emptyMessagesTitle}>No messages yet</Text>
            <Text style={styles.emptyMessagesSub}>
              {filterMode === 'questions'
                ? 'No doubts posted yet. Ask a question to get faculty guidance.'
                : filterMode === 'faculty'
                ? 'No faculty announcements in this session yet.'
                : 'Join the conversation! Post questions or cheer on your peers.'}
            </Text>
          </View>
        ) : (
          filteredMessages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              msg={msg}
              onLike={() => handleLikeMessage(msg.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Sticky Bottom Input Bar */}
      <View style={styles.inputBarWrapper}>
        {/* Toggle Question Mode & Quick Reactions */}
        <View style={styles.inputPreBar}>
          <Pressable
            onPress={() => setIsQuestionMode((prev) => !prev)}
            style={[
              styles.questionToggleBtn,
              isQuestionMode && styles.questionToggleBtnActive,
            ]}
          >
            <MaterialIcons
              name={isQuestionMode ? 'check-circle' : 'radio-button-unchecked'}
              size={14}
              color={isQuestionMode ? '#0059b9' : '#727782'}
            />
            <Text
              style={[
                styles.questionToggleText,
                isQuestionMode && styles.questionToggleTextActive,
              ]}
            >
              Ask as Doubts / Q&A
            </Text>
          </Pressable>

          <View style={styles.miniReactions}>
            {['❤️', '🔥', '👏', '💡', '🙋'].map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => onSendReaction(emoji)}
                style={styles.miniReactionBtn}
                hitSlop={3}
              >
                <Text style={styles.miniReactionText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Input Row */}
        <View style={styles.inputRow}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              isQuestionMode
                ? 'Type your clinical doubt for Dr. Vance...'
                : 'Send message to faculty and peers...'
            }
            placeholderTextColor="#8a92a6"
            style={styles.textInput}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />

          <Pressable
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
            style={[
              styles.sendBtn,
              inputText.trim() ? styles.sendBtnActive : styles.sendBtnDisabled,
            ]}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Send chat message"
          >
            <MaterialIcons
              name="send"
              size={18}
              color={inputText.trim() ? '#ffffff' : '#9ca3af'}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const ChatMessageItem: React.FC<{
  msg: ChatMessage;
  onLike: () => void;
}> = ({ msg, onLike }) => {
  const isFaculty = msg.senderRole === 'faculty';
  const isMod = msg.senderRole === 'moderator';

  return (
    <View
      style={[
        styles.msgCard,
        msg.isPinned && styles.msgCardPinned,
        msg.isQuestion && styles.msgCardQuestion,
      ]}
    >
      {/* Pinned banner if pinned */}
      {msg.isPinned && (
        <View style={styles.pinnedHeader}>
          <MaterialIcons name="push-pin" size={13} color="#0059b9" />
          <Text style={styles.pinnedHeaderText}>PINNED FACULTY HIGHLIGHT</Text>
        </View>
      )}

      {/* Question tag if question */}
      {msg.isQuestion && (
        <View style={styles.questionHeader}>
          <MaterialIcons name="help" size={13} color="#b45309" />
          <Text style={styles.questionHeaderText}>CANDIDATE DOUBT</Text>
        </View>
      )}

      <View style={styles.msgBodyRow}>
        {msg.avatar ? (
          <Image source={{ uri: msg.avatar }} style={styles.avatarImg} />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              isFaculty
                ? styles.avatarFaculty
                : isMod
                ? styles.avatarMod
                : styles.avatarStudent,
            ]}
          >
            <Text style={styles.avatarInitial}>{msg.senderName[0]}</Text>
          </View>
        )}

        <View style={styles.msgTextContent}>
          <View style={styles.senderHeaderRow}>
            <View style={styles.nameAndBadge}>
              <Text style={styles.senderName}>{msg.senderName}</Text>
              {isFaculty && (
                <View style={styles.roleBadgeFaculty}>
                  <Text style={styles.roleBadgeText}>FACULTY</Text>
                </View>
              )}
              {isMod && (
                <View style={styles.roleBadgeMod}>
                  <Text style={styles.roleBadgeText}>MOD</Text>
                </View>
              )}
            </View>
            <Text style={styles.msgTimestamp}>{msg.timestamp}</Text>
          </View>

          <Text style={styles.msgText}>{msg.message}</Text>

          {/* Likes & Reaction Count */}
          <View style={styles.msgFooter}>
            <Pressable
              onPress={onLike}
              style={styles.likeBtn}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Like message"
            >
              <MaterialIcons name="favorite-border" size={13} color="#727782" />
              {(msg.likesCount || 0) > 0 && (
                <Text style={styles.likeCount}>{msg.likesCount}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },

  /* Filter Bar */
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f7',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: '#f0f3fa',
  },
  filterPillActive: {
    backgroundColor: '#e3edff',
    borderWidth: 1,
    borderColor: '#0059b9',
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#575f6e',
  },
  filterPillTextActive: {
    color: '#0059b9',
    fontWeight: '700',
  },

  /* Messages Scroll */
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 12,
    gap: 10,
    paddingBottom: 20,
  },
  messagesContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyMessagesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyMessagesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  emptyMessagesSub: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Message Card */
  msgCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  msgCardPinned: {
    backgroundColor: '#f0f5ff',
    borderColor: '#b4cfff',
  },
  msgCardQuestion: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },

  pinnedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 89, 185, 0.12)',
  },
  pinnedHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0059b9',
    letterSpacing: 0.5,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(180, 83, 9, 0.15)',
  },
  questionHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 0.5,
  },

  msgBodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatarImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  avatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFaculty: {
    backgroundColor: '#0059b9',
  },
  avatarMod: {
    backgroundColor: '#006780',
  },
  avatarStudent: {
    backgroundColor: '#6b7280',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },

  msgTextContent: {
    flex: 1,
    gap: 4,
  },
  senderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  senderName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#181c22',
  },
  roleBadgeFaculty: {
    backgroundColor: '#0059b9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  roleBadgeMod: {
    backgroundColor: '#006780',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  msgTimestamp: {
    fontSize: 10.5,
    color: '#8a92a6',
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#2d333e',
  },

  msgFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  likeCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#727782',
  },

  /* Input Bar Wrapper */
  inputBarWrapper: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#edf0f7',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 8,
  },
  inputPreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    backgroundColor: '#f3f4f8',
  },
  questionToggleBtnActive: {
    backgroundColor: '#e7eeff',
  },
  questionToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#575f6e',
  },
  questionToggleTextActive: {
    color: '#0059b9',
    fontWeight: '700',
  },
  miniReactions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniReactionBtn: {
    padding: 2,
  },
  miniReactionText: {
    fontSize: 17,
  },

  /* Input Row */
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f1f4fb',
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#181c22',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#0059b9',
  },
  sendBtnDisabled: {
    backgroundColor: '#e2e6ee',
  },
});
