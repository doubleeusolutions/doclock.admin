import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  BackHandler,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Colors, Shapes, Motion } from '@/theme';

export interface AlertOptionItem {
  label: string;
  value: string;
  badge?: string;
  subtitle?: string;
}

export interface AlertDetailItem {
  label: string;
  value: string;
}

export interface CustomAlertModalProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: 'info' | 'confirm' | 'destructive' | 'success' | 'select';
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeBgColor?: string;
  options?: AlertOptionItem[];
  selectedOptionValue?: string;
  details?: AlertDetailItem[];
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (selectedValue?: string) => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  dismissible?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  title,
  message,
  type = 'info',
  icon,
  iconColor,
  iconBgColor,
  badgeText,
  badgeColor,
  badgeBgColor,
  options,
  selectedOptionValue,
  details,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  onClose,
  dismissible = true,
}) => {
  const [selectedVal, setSelectedVal] = useState<string | undefined>(
    selectedOptionValue
  );

  useEffect(() => {
    if (visible) {
      setSelectedVal(selectedOptionValue);
    }
  }, [visible, selectedOptionValue]);

  // Handle Android hardware back press
  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (dismissible) {
        if (onCancel) onCancel();
        if (onClose) onClose();
      }
      return true; // Consume event so it doesn't pop route
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      } else {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }
    };
  }, [visible, dismissible, onCancel, onClose]);

  // Card entrance and button scale animations
  const cardScale = useSharedValue(0.94);
  const confirmScale = useSharedValue(1);
  const cancelScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      cardScale.value = 0.94;
      cardScale.value = withSpring(1, Motion.tactileSpring);
    }
  }, [visible]);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const confirmAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confirmScale.value }],
  }));

  const cancelAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cancelScale.value }],
  }));

  if (!visible) {
    return null;
  }

  // Determine icon & theme based on type
  const isDestructive = type === 'destructive';
  const isSelect = type === 'select';
  const isConfirm = type === 'confirm';
  const isSuccess = type === 'success';

  let defaultIcon: keyof typeof MaterialIcons.glyphMap = 'info';
  let defaultIconColor: string = Colors.primary;
  let defaultIconBg: string = Colors.primaryFixed;

  if (isDestructive) {
    defaultIcon = 'warning-amber';
    defaultIconColor = Colors.error;
    defaultIconBg = '#ffdad6';
  } else if (isSuccess) {
    defaultIcon = 'check-circle';
    defaultIconColor = Colors.success;
    defaultIconBg = Colors.successContainer;
  } else if (isSelect) {
    defaultIcon = 'check-box';
    defaultIconColor = Colors.primary;
    defaultIconBg = Colors.primaryFixed;
  } else if (isConfirm) {
    defaultIcon = 'help-outline';
    defaultIconColor = Colors.primary;
    defaultIconBg = Colors.primaryFixed;
  }

  const finalIcon = icon || defaultIcon;
  const finalIconColor = iconColor || defaultIconColor;
  const finalIconBg = iconBgColor || defaultIconBg;

  const handleConfirmPress = async () => {
    if (onConfirm) {
      await onConfirm(selectedVal);
    }
    if (onClose) onClose();
  };

  const handleCancelPress = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  const handleBackdropPress = () => {
    if (dismissible) {
      if (onCancel) onCancel();
      if (onClose) onClose();
    }
  };

  const showCancelButton = !!cancelText || isDestructive || isConfirm || isSelect;
  const resolvedConfirmText =
    confirmText || (isDestructive ? 'Delete' : isSelect ? 'Apply' : 'OK');
  const resolvedCancelText = cancelText || 'Cancel';

  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(120)}
      style={styles.overlay}
      pointerEvents="auto"
    >
      {/* Backdrop touch to dismiss */}
      <Pressable
        style={styles.backdrop}
        onPress={handleBackdropPress}
        accessibilityRole="button"
        accessibilityLabel="Dismiss popup"
      />

      {/* Modal Container */}
      <Animated.View style={[styles.cardWrapper, cardAnimStyle]}>
          <View
            style={styles.modalCard}
            onStartShouldSetResponder={() => true}
          >
            {/* Top Icon Badge */}
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: finalIconBg },
              ]}
            >
              <MaterialIcons
                name={finalIcon}
                size={26}
                color={finalIconColor}
              />
            </View>

            {/* Optional Tag Badge */}
            {badgeText && (
              <View
                style={[
                  styles.tagBadge,
                  { backgroundColor: badgeBgColor || Colors.primaryFixed },
                ]}
              >
                <Text
                  style={[
                    styles.tagBadgeText,
                    { color: badgeColor || Colors.primary },
                  ]}
                >
                  {badgeText}
                </Text>
              </View>
            )}

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message Body */}
            {!!message && <Text style={styles.message}>{message}</Text>}

            {/* Selectable Options List (e.g. Target Exam) */}
            {isSelect && options && options.length > 0 && (
              <ScrollView
                style={styles.optionsScroll}
                contentContainerStyle={styles.optionsContent}
                showsVerticalScrollIndicator={false}
              >
                {options.map((opt) => {
                  const isSelected = selectedVal === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      style={[
                        styles.optionItem,
                        isSelected
                          ? styles.optionItemSelected
                          : styles.optionItemUnselected,
                      ]}
                      onPress={() => setSelectedVal(opt.value)}
                    >
                      <View style={styles.optionInfo}>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                        {opt.subtitle && (
                          <Text style={styles.optionSubtitle}>
                            {opt.subtitle}
                          </Text>
                        )}
                      </View>

                      <View style={styles.optionRightGroup}>
                        {opt.badge && (
                          <View
                            style={[
                              styles.optionBadge,
                              isSelected
                                ? styles.optionBadgeActive
                                : styles.optionBadgeInactive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionBadgeText,
                                isSelected && styles.optionBadgeTextActive,
                              ]}
                            >
                              {opt.badge}
                            </Text>
                          </View>
                        )}
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleSelected,
                          ]}
                        >
                          {isSelected && <View style={styles.radioDot} />}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            {/* Key-Value Details List (e.g. Pro Pass expiry, Linked Devices) */}
            {details && details.length > 0 && (
              <View style={styles.detailsContainer}>
                {details.map((item, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.detailRow,
                      idx < details.length - 1 && styles.detailRowBorder,
                    ]}
                  >
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    <Text style={styles.detailValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons Row */}
            <View
              style={[
                styles.actionsRow,
                !showCancelButton && styles.actionsRowSingle,
              ]}
            >
              {showCancelButton && (
                <AnimatedPressable
                  onPress={handleCancelPress}
                  onPressIn={() => {
                    cancelScale.value = withSpring(0.95, Motion.tactileSpring);
                  }}
                  onPressOut={() => {
                    cancelScale.value = withSpring(1, Motion.tactileSpring);
                  }}
                  style={[styles.actionButton, styles.cancelButton, cancelAnimStyle]}
                  accessibilityRole="button"
                  accessibilityLabel={resolvedCancelText}
                >
                  <Text style={styles.cancelButtonText}>
                    {resolvedCancelText}
                  </Text>
                </AnimatedPressable>
              )}

              <AnimatedPressable
                onPress={handleConfirmPress}
                onPressIn={() => {
                  confirmScale.value = withSpring(0.95, Motion.tactileSpring);
                }}
                onPressOut={() => {
                  confirmScale.value = withSpring(1, Motion.tactileSpring);
                }}
                style={[
                  styles.actionButton,
                  isDestructive
                    ? styles.destructiveButton
                    : styles.confirmButton,
                  !showCancelButton && styles.singleConfirmButton,
                  confirmAnimStyle,
                ]}
                accessibilityRole="button"
                accessibilityLabel={resolvedConfirmText}
              >
                <Text style={styles.confirmButtonText}>
                  {resolvedConfirmText}
                </Text>
              </AnimatedPressable>
            </View>
          </View>
        </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 20,
    paddingVertical: 40,
    zIndex: 999999,
    elevation: 999999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 390,
    zIndex: 2,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingTop: 26,
    paddingBottom: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#001a40',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(215, 226, 255, 0.6)',
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Shapes.pill,
    marginBottom: 10,
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14.5,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  optionsScroll: {
    width: '100%',
    maxHeight: 220,
    marginBottom: 18,
  },
  optionsContent: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  optionItemUnselected: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  optionItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: Colors.primary,
  },
  optionInfo: {
    flex: 1,
    marginRight: 10,
  },
  optionLabel: {
    fontSize: 14.5,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  optionLabelSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  optionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  optionRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  optionBadgeActive: {
    backgroundColor: Colors.primaryFixed,
  },
  optionBadgeInactive: {
    backgroundColor: '#e2e8f0',
  },
  optionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  optionBadgeTextActive: {
    color: Colors.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94a3b8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#ffffff',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
  },
  detailRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: Colors.onSurface,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  actionsRowSingle: {
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  singleConfirmButton: {
    flex: 1,
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#475569',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  destructiveButton: {
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
